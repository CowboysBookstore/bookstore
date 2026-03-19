from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "price", "inventory", "created_at")
    search_fields = ("title", "sku")
    readonly_fields = ("created_at", "updated_at")
