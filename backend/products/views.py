from __future__ import annotations

import logging
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.emails import send_order_confirmation_email

from .models import Order, OrderItem, Product, PromoCode
from .serializers import OrderSerializer, ProductSerializer, PromoCodeSerializer

logger = logging.getLogger(__name__)

TAX_RATE = Decimal("0.0825")
DELIVERY_FEE = Decimal("5.00")
FREE_DELIVERY_THRESHOLD = Decimal("50.00")
MONEY = Decimal("0.01")


def money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


class ProductListView(generics.ListCreateAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

    def get_permissions(self):
        permission_classes = [AllowAny] if self.request.method == "GET" else [IsAdminUser]
        return [permission() for permission in permission_classes]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = "slug"

    def get_permissions(self):
        permission_classes = [AllowAny] if self.request.method == "GET" else [IsAdminUser]
        return [permission() for permission in permission_classes]


class PromoCodeValidateView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PromoCodeSerializer

    def post(self, request, *args, **kwargs):
        code = str(request.data.get("code", "")).strip().upper()
        if not code:
            return Response(
                {"detail": "Enter a promo code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            promo_code = PromoCode.objects.get(code=code, is_active=True)
        except PromoCode.DoesNotExist:
            return Response(
                {"detail": "That promo code is not available."},
                status=status.HTTP_404_NOT_FOUND,
            )

        now = timezone.now()
        if promo_code.valid_from and now < promo_code.valid_from:
            return Response(
                {"detail": "That promo code is not active yet."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if promo_code.valid_until and now > promo_code.valid_until:
            return Response(
                {"detail": "That promo code has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if promo_code.max_uses and promo_code.uses_count >= promo_code.max_uses:
            return Response(
                {"detail": "That promo code has reached its use limit."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(PromoCodeSerializer(promo_code).data)


class OrderCheckoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        payload = request.data
        cart_items = payload.get("items") or []
        if not isinstance(cart_items, list) or not cart_items:
            raise serializers.ValidationError({"detail": "Your cart is empty."})
        if len(cart_items) > 100:
            raise serializers.ValidationError({"detail": "Your cart has too many items."})

        fulfillment = payload.get("fulfillment")
        if fulfillment not in {"pickup", "delivery"}:
            raise serializers.ValidationError(
                {"detail": "Choose campus pickup or delivery."}
            )

        customer = payload.get("customer") or {}
        if not customer.get("fullName") or not customer.get("email"):
            raise serializers.ValidationError(
                {"detail": "Add a name and email before placing the order."}
            )
        if fulfillment == "delivery" and not payload.get("deliveryAddress"):
            raise serializers.ValidationError(
                {"detail": "Add a delivery address before placing the order."}
            )

        with transaction.atomic():
            resolved_items: list[tuple[Product, int]] = []
            subtotal = Decimal("0.00")
            quantities: dict[int, int] = {}

            for item in cart_items:
                product_id = str(item.get("productId", "")).strip()
                try:
                    quantity = int(item.get("quantity", 0))
                except (TypeError, ValueError) as exc:
                    raise serializers.ValidationError(
                        {"detail": "A cart quantity is invalid."}
                    ) from exc

                if not product_id or quantity < 1:
                    raise serializers.ValidationError(
                        {"detail": "A cart item is invalid."}
                    )

                products = Product.objects.select_for_update().filter(is_active=True)
                try:
                    if product_id.isdigit():
                        product = products.get(pk=int(product_id))
                    else:
                        product = products.get(slug=product_id)
                except Product.DoesNotExist as exc:
                    raise serializers.ValidationError(
                        {"detail": "One of the products is no longer available."}
                    ) from exc

                quantities[product.pk] = quantities.get(product.pk, 0) + quantity
                if product.stock < quantities[product.pk]:
                    raise serializers.ValidationError(
                        {
                            "detail": (
                                f"Only {product.stock} of {product.title} "
                                "remain in stock."
                            )
                        }
                    )

                resolved_items.append((product, quantity))
                subtotal += product.price * quantity

            subtotal = money(subtotal)
            promo_code = self._get_promo_code(payload.get("promoCode"), subtotal)
            discount = self._calculate_discount(promo_code, subtotal)
            discounted_subtotal = subtotal - discount
            tax = money(discounted_subtotal * TAX_RATE)
            fulfillment_fee = (
                DELIVERY_FEE
                if fulfillment == "delivery"
                and discounted_subtotal < FREE_DELIVERY_THRESHOLD
                else Decimal("0.00")
            )
            total = money(discounted_subtotal + tax + fulfillment_fee)

            order = Order.objects.create(
                user=request.user if request.user.is_authenticated else None,
                customer_full_name=customer.get("fullName", "").strip(),
                customer_email=customer.get("email", "").strip().lower(),
                customer_phone=customer.get("phone", "").strip(),
                status="pending",
                fulfillment_method=fulfillment,
                pickup_slot=payload.get("pickupSlot") if fulfillment == "pickup" else None,
                delivery_address=payload.get("deliveryAddress")
                if fulfillment == "delivery"
                else None,
                delivery_instructions=payload.get("deliveryInstructions")
                if fulfillment == "delivery"
                else None,
                subtotal=subtotal,
                discount=discount,
                tax=tax,
                fulfillment_fee=fulfillment_fee,
                total=total,
                promo_code=promo_code,
                payment_method="pay-later",
                payment_label="Payment to be arranged",
            )

            for product, quantity in resolved_items:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    title=product.title,
                    category=product.category,
                    quantity=quantity,
                    unit_price=product.price,
                )
                product.stock -= quantity
                product.save(update_fields=["stock", "updated_at"])

            if promo_code:
                promo_code.uses_count += 1
                promo_code.save(update_fields=["uses_count", "updated_at"])

        if settings.EMAIL_BACKEND != "django.core.mail.backends.console.EmailBackend":
            try:
                send_order_confirmation_email(order.customer_email, order)
            except Exception:
                logger.exception("Order request email failed for order %s", order.pk)

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _get_promo_code(code, subtotal: Decimal) -> PromoCode | None:
        if not code:
            return None

        try:
            promo = PromoCode.objects.select_for_update().get(
                code=str(code).strip().upper(),
                is_active=True,
            )
        except PromoCode.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"detail": "That promo code is not available."}
            ) from exc

        now = timezone.now()
        if promo.valid_from and now < promo.valid_from:
            raise serializers.ValidationError(
                {"detail": "That promo code is not active yet."}
            )
        if promo.valid_until and now > promo.valid_until:
            raise serializers.ValidationError({"detail": "That promo code has expired."})
        if promo.max_uses and promo.uses_count >= promo.max_uses:
            raise serializers.ValidationError(
                {"detail": "That promo code has reached its use limit."}
            )
        if promo.minimum_cart_total and subtotal < promo.minimum_cart_total:
            raise serializers.ValidationError(
                {
                    "detail": (
                        f"Spend ${promo.minimum_cart_total:.2f} before using "
                        f"{promo.code}."
                    )
                }
            )
        return promo

    @staticmethod
    def _calculate_discount(promo: PromoCode | None, subtotal: Decimal) -> Decimal:
        if not promo:
            return Decimal("0.00")
        if promo.discount_type == "percentage":
            discount = subtotal * (promo.discount_value / Decimal("100"))
        else:
            discount = promo.discount_value
        return money(min(discount, subtotal))


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("promo_code")
            .prefetch_related("items__product")
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("promo_code")
            .prefetch_related("items__product")
        )
