from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated # IsAuthenticated for order history
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView # For OrderCheckoutView
from django.db import transaction # For atomic order creation
from django.utils import timezone

from .models import Product, PromoCode, Order, OrderItem
from .serializers import ProductSerializer, PromoCodeSerializer, OrderSerializer, OrderItemSerializer

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


from django.utils import timezone

class PromoCodeValidateView(generics.GenericAPIView):
    permission_classes = [AllowAny] # Allow unauthenticated users to validate promo codes.
    serializer_class = PromoCodeSerializer # Used for serializing the valid promo code data.

    def post(self, request, *args, **kwargs):
        code = request.data.get("code", "").upper()
        if not code:
            return Response(
                {"detail": "Promo code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            promo_code = PromoCode.objects.get(code=code, is_active=True)
        except PromoCode.DoesNotExist:
            return Response(
                {"detail": "Invalid or inactive promo code."},
                status=status.HTTP_404_NOT_FOUND,
            )

        now = timezone.now()
        if promo_code.valid_from and now < promo_code.valid_from:
            return Response({"detail": "Promo code not yet active."}, status=status.HTTP_400_BAD_REQUEST)
        if promo_code.valid_until and now > promo_code.valid_until:
            return Response({"detail": "Promo code has expired."}, status=status.HTTP_400_BAD_REQUEST)
        if promo_code.max_uses and promo_code.uses_count >= promo_code.max_uses:
            return Response({"detail": "Promo code has reached its maximum uses."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = PromoCodeSerializer(promo_code)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]


class OrderCheckoutView(APIView):
    """
    Handles the checkout process: creates an order, decrements stock,
    applies promo codes, and sends a confirmation email.
    """
    permission_classes = [AllowAny] # Allow guest checkout

    def post(self, request, *args, **kwargs):
        # Frontend sends a payload that includes cart items, fulfillment, payment, and promo code
        # This is a simplified mock of a real checkout payload.
        payload = request.data
        cart_items_data = payload.get("items", [])
        promo_code_str = payload.get("promoCode")
        
        if not cart_items_data:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate cart items and calculate pricing (should ideally be done on backend for security)
        # For now, we trust the frontend's pricing summary for simplicity, but a real app
        # would re-calculate subtotal, tax, discount, etc. here based on product prices from DB.
        subtotal = payload.get("subtotal")
        discount = payload.get("discount", 0)
        tax = payload.get("tax")
        fulfillment_fee = payload.get("fulfillmentFee", 0)
        total = payload.get("total")

        if any(val is None for val in [subtotal, tax, total]):
            return Response({"detail": "Missing pricing details."}, status=status.HTTP_400_BAD_REQUEST)

        promo_code_instance = None
        if promo_code_str:
            try:
                promo_code_instance = PromoCode.objects.get(code=promo_code_str, is_active=True)
                # Further validation (expiry, min_cart_total, max_uses) should happen here
                # For now, we assume frontend validation is sufficient for this mock.
                if promo_code_instance.max_uses is not None and promo_code_instance.uses_count >= promo_code_instance.max_uses:
                    return Response({"detail": "Promo code has reached its maximum uses."}, status=status.HTTP_400_BAD_REQUEST)
            except PromoCode.DoesNotExist:
                return Response({"detail": "Invalid promo code provided."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Create the Order
            customer_data = payload.get("customer", {})
            order = Order.objects.create(
                user=request.user if request.user.is_authenticated else None,
                customer_full_name=customer_data.get("fullName", ""),
                customer_email=customer_data.get("email", ""),
                customer_phone=customer_data.get("phone", ""),
                status="pending", # Initial status, will be updated after processing
                fulfillment_method=payload.get("fulfillment"),
                pickup_slot=payload.get("pickupSlot"),
                delivery_address=payload.get("deliveryAddress"),
                delivery_instructions=payload.get("deliveryInstructions"),
                subtotal=subtotal,
                discount=discount,
                tax=tax,
                fulfillment_fee=fulfillment_fee,
                total=total,
                promo_code=promo_code_instance,
                payment_method=payload.get("paymentMethod"),
                payment_label=payload.get("paymentLabel"),
            )

            # Add OrderItems and decrement product stock
            for item_data in cart_items_data:
                product_id = item_data.get("productId")
                quantity = item_data.get("quantity")
                unit_price = item_data.get("unitPrice")

                try:
                    product = Product.objects.get(id=product_id, is_active=True)
                except Product.DoesNotExist:
                    raise ValueError(f"Product with ID {product_id} not found or inactive.")

                if product.stock < quantity:
                    raise ValueError(f"Not enough stock for product {product.title}.")
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    title=product.title,
                    category=product.category,
                    quantity=quantity,
                    unit_price=unit_price,
                )
                product.stock -= quantity
                product.save()
            
            if promo_code_instance:
                promo_code_instance.uses_count += 1
                promo_code_instance.save()

            # Send order confirmation email (assuming this is implemented in emails.py)
            from accounts.emails import send_order_confirmation_email
            if order.user and order.user.email:
                send_order_confirmation_email(order.user.email, order)
            elif payload.get("customer", {}).get("email"): # Fallback for guest checkout if email is provided
                 send_order_confirmation_email(payload["customer"]["email"], order)

            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """Lists all orders for the authenticated user."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related('promo_code').prefetch_related('items__product')


class OrderDetailView(generics.RetrieveAPIView):
    """Retrieves a single order for the authenticated user."""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).select_related('promo_code').prefetch_related('items__product')