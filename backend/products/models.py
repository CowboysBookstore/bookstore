from __future__ import annotations

from django.db import models
from django.conf import settings


def _user_foreign_key():
    return models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="+"
    )


class Product(models.Model):
    """Simple product model used by the frontend store pages.

    Keep it intentionally small: title, description, price, inventory and image url.
    """

    slug = models.SlugField(max_length=255, unique=True, blank=True, null=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=64, blank=True, default="Textbooks")
    short_description = models.CharField(max_length=512, blank=True, default="")
    description = models.TextField(blank=True)
    badge = models.CharField(max_length=64, blank=True, default="")
    course = models.CharField(max_length=64, blank=True, default="")
    format = models.CharField(max_length=64, blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    inventory = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=64, blank=True, default="")
    image_url = models.URLField(blank=True, default="")
    rating = models.FloatField(default=4.5)
    pickup_note = models.CharField(max_length=255, blank=True, default="")
    delivery_note = models.CharField(max_length=255, blank=True, default="")
    highlights = models.JSONField(default=list, blank=True)
    cover_gradient = models.CharField(max_length=255, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.title} (${self.price})"

    def save(self, *args, **kwargs):
        """Auto-generate a slug from the title when not provided and ensure uniqueness."""
        from django.utils.text import slugify

        if not self.slug:
            base = slugify(self.title)[:200]
            slug = base
            counter = 1
            # ensure uniqueness
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{counter}"
                counter += 1
            self.slug = slug

        super().save(*args, **kwargs)


class WishlistItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist"
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="wishlisted")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")

    def __str__(self) -> str:
        return f"WishlistItem(user={self.user_id}, product={self.product_id})"


class CartItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart_items"
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="in_carts")
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "product")

    def __str__(self) -> str:
        return f"CartItem(user={self.user_id}, product={self.product_id}, qty={self.quantity})"
