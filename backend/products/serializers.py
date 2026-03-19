from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "slug",
            "title",
            "category",
            "short_description",
            "description",
            "price",
            "inventory",
            "sku",
            "image_url",
            "badge",
            "course",
            "format",
            "rating",
            "pickup_note",
            "delivery_note",
            "highlights",
            "cover_gradient",
            "created_at",
            "updated_at",
        ]



class WishlistItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()


class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

