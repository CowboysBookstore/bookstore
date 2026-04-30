from rest_framework import serializers
from .models import Product, PromoCode, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class PromoCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromoCode
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for individual items within an order."""
    class Meta:
        model = OrderItem
        fields = ["product", "title", "category", "quantity", "unit_price", "line_total"]
        read_only_fields = ["title", "category", "unit_price", "line_total"] # These are set from product at order creation


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for a complete order, including its items."""
    items = OrderItemSerializer(many=True, read_only=True)
    promo_code_details = PromoCodeSerializer(source='promo_code', read_only=True) # Expose promo code details

    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ["user", "subtotal", "discount", "tax", "fulfillment_fee", "total", "placed_at", "updated_at"]