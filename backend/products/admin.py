from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Product, PromoCode, Order, OrderItem

@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = ("title", "author", "price", "stock", "is_active")
    list_filter = ("is_active", "category")
    search_fields = ("title", "author", "description")
    list_editable = ("price", "stock", "is_active")


@admin.register(PromoCode)
class PromoCodeAdmin(ModelAdmin):
    list_display = (
        "code",
        "discount_type",
        "discount_value",
        "is_active",
        "valid_from",
        "valid_until",
        "uses_count",
    )
    list_filter = ("is_active", "discount_type")
    search_fields = ("code",)
    list_editable = ("is_active", "discount_value", "discount_type")
    readonly_fields = ("uses_count", "created_at", "updated_at")


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ("product", "title", "quantity", "unit_price", "line_total")
    readonly_fields = ("title", "unit_price", "line_total")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product')

@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_display = ("id", "user", "status", "total", "fulfillment_method", "placed_at")
    list_filter = ("status", "fulfillment_method", "payment_method", "placed_at")
    search_fields = ("user__email", "user__first_name", "user__last_name", "delivery_address")
    readonly_fields = ("placed_at", "updated_at", "user", "subtotal", "discount", "tax", "fulfillment_fee", "total", "promo_code", "payment_method", "payment_label")
    inlines = [OrderItemInline]
    fieldsets = (
        (None, {"fields": ("user", "status", "fulfillment_method", "pickup_slot", "delivery_address", "delivery_instructions")}),
        ("Pricing", {"fields": ("subtotal", "discount", "tax", "fulfillment_fee", "total", "promo_code")}),
        ("Payment", {"fields": ("payment_method", "payment_label")}),
        ("Timestamps", {"fields": ("placed_at", "updated_at")}),
    )