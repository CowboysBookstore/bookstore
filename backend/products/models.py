from django.db import models
from django.conf import settings


class Product(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(max_length=500, blank=True)
    category = models.CharField(max_length=100, blank=True)
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.title

    class Meta:
        ordering = ["-created_at"]


class Order(models.Model):
    """Represents a customer order."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed_for_pickup", "Confirmed for pickup"),
        ("packing_for_delivery", "Packing for delivery"),
        ("ready_for_pickup", "Ready for pickup"),
        ("out_for_delivery", "Out for delivery"),
        ("delivered", "Delivered"),
        ("picked_up", "Picked Up"),
        ("cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="The user who placed the order (if authenticated).",
    )
    customer_full_name = models.CharField(max_length=255, blank=True, default="")
    customer_email = models.EmailField(blank=True, default="")
    customer_phone = models.CharField(max_length=20, blank=True, default="")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="pending")
    fulfillment_method = models.CharField(max_length=50)
    pickup_slot = models.CharField(max_length=255, blank=True, null=True)
    delivery_address = models.TextField(blank=True, null=True)
    delivery_instructions = models.TextField(blank=True, null=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    fulfillment_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    promo_code = models.ForeignKey("PromoCode", on_delete=models.SET_NULL, null=True, blank=True)
    payment_method = models.CharField(max_length=50)
    payment_label = models.CharField(max_length=255) # e.g., "Card ending in 1234", "Student ID 000123456"
    placed_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Order {self.id} - {self.user or 'Guest'}"

    class Meta:
        ordering = ["-placed_at"]


class OrderItem(models.Model):
    """Represents a single item within an order."""

    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255) # Store title in case product is deleted
    category = models.CharField(max_length=100) # Store category in case product is deleted
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2) # quantity * unit_price

    def save(self, *args, **kwargs):
        self.line_total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.quantity} x {self.title} in Order {self.order.id}"


class PromoCode(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(
        max_length=20,
        choices=[("percentage", "Percentage"), ("fixed", "Fixed Amount")],
        default="percentage",
    )
    discount_value = models.DecimalField(max_digits=5, decimal_places=2)  # e.g., 10.00 for 10% or $10
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    minimum_cart_total = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    max_uses = models.IntegerField(null=True, blank=True)
    uses_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.code

    class Meta:
        ordering = ["-created_at"]