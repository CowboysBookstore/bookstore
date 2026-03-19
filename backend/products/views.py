from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404
from django.conf import settings

try:
    import stripe
    STRIPE_AVAILABLE = True
except Exception:  # pragma: no cover - optional dependency in dev
    stripe = None
    STRIPE_AVAILABLE = False

from .models import Product
from .serializers import ProductSerializer
from .serializers import WishlistItemSerializer, CartItemSerializer
from .models import WishlistItem, CartItem

# initialize stripe with secret key if present
STRIPE_SECRET = getattr(settings, "STRIPE_SECRET_KEY", None) or None
if STRIPE_AVAILABLE and STRIPE_SECRET:
    stripe.api_key = STRIPE_SECRET


class ProductViewSet(viewsets.ModelViewSet):
    """CRUD for products. Public read, authenticated write (if needed later).

    For now allow any to keep it simple for the demo; we'll tighten permissions later.
    """

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["get"])
    def featured(self, request):
        """Return a small list of featured products (first 4) to power a homepage widget."""
        qs = self.get_queryset()[:4]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related("product")
        data = [
            ProductSerializer(i.product, context={"request": request}).data for i in items
        ]
        return Response(data)

    def post(self, request):
        serializer = WishlistItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = get_object_or_404(Product, pk=serializer.validated_data["product_id"])
        item, created = WishlistItem.objects.get_or_create(user=request.user, product=product)
        return Response({"created": created}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request):
        serializer = WishlistItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = get_object_or_404(Product, pk=serializer.validated_data["product_id"])
        WishlistItem.objects.filter(user=request.user, product=product).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = (
            CartItem.objects.filter(user=request.user).select_related("product")
        )
        data = [
            {
                "product": ProductSerializer(i.product, context={"request": request}).data,
                "quantity": i.quantity,
            }
            for i in items
        ]
        return Response(data)

    def post(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = get_object_or_404(Product, pk=serializer.validated_data["product_id"])
        quantity = serializer.validated_data["quantity"]
        item, created = CartItem.objects.get_or_create(user=request.user, product=product)
        item.quantity = quantity
        item.save()
        return Response({"created": created, "quantity": item.quantity})

    def delete(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = get_object_or_404(Product, pk=serializer.validated_data["product_id"])
        CartItem.objects.filter(user=request.user, product=product).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Use user's cart items to compute total
        items = CartItem.objects.filter(user=request.user).select_related("product")
        if not items.exists():
            return Response({"detail": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        amount_cents = 0
        line_items = []
        for it in items:
            price = int(it.product.price * 100)
            amount_cents += price * it.quantity
            line_items.append({"name": it.product.title, "amount": price, "quantity": it.quantity})

        if not STRIPE_SECRET:
            return Response({"detail": "Stripe not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents, currency="usd", metadata={"user_id": str(request.user.id)}
            )
        except Exception as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"client_secret": intent.client_secret, "amount": amount_cents})
