from django.contrib import admin
from unfold.admin import ModelAdmin
from .models import Product

@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = ("title", "author", "price", "stock", "is_active")
    list_filter = ("is_active", "category")
    search_fields = ("title", "author", "description")
    list_editable = ("price", "stock", "is_active")