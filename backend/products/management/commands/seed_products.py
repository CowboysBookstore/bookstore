from django.core.management.base import BaseCommand
from products.models import Product, PromoCode
import json
from pathlib import Path


class Command(BaseCommand):
    """
    Django management command to seed the database with products from frontend catalog.json.
    Uses update_or_create to ensure idempotency.
    """

    def handle(self, *args, **options):
        # Find catalog.json in the frontend directory
        catalog_path = (
            Path(__file__).parent.parent.parent.parent.parent
            / "frontend"
            / "src"
            / "storefront"
            / "catalog.json"
        )

        if not catalog_path.exists():
            self.stdout.write(
                self.style.ERROR(f"Catalog file not found at {catalog_path}")
            )
            return

        with open(catalog_path, "r") as f:
            products_data = json.load(f)

        created_count = 0
        updated_count = 0

        for product_data in products_data:
            product, created = Product.objects.update_or_create(
                slug=product_data["slug"],
                defaults={
                    "title": product_data["title"],
                    "category": product_data.get("category", ""),
                    "short_description": product_data.get("short_description", ""),
                    "description": product_data.get("description", ""),
                    "badge": product_data.get("badge", ""),
                    "course": product_data.get("course", ""),
                    "format": product_data.get("format", ""),
                    "price": product_data.get("price", "0.00"),
                    "image_url": product_data.get("image_url", ""),
                    "stock": product_data.get("inventory", 0),
                    "rating": product_data.get("rating", 4.5),
                    "pickup_note": product_data.get("pickup_note", ""),
                    "delivery_note": product_data.get("delivery_note", ""),
                    "highlights": product_data.get("highlights", []),
                    "cover_gradient": product_data.get("cover_gradient", ""),
                    "is_active": True,
                },
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {product.title}"))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f"Updated: {product.title}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSeeding complete. Created: {created_count}, Updated: {updated_count}"
            )
        )

        promo_codes = [
            {
                "code": "WELCOME5",
                "discount_type": "fixed",
                "discount_value": "5.00",
                "minimum_cart_total": "25.00",
            },
            {
                "code": "COWBOY10",
                "discount_type": "percentage",
                "discount_value": "10.00",
                "minimum_cart_total": "75.00",
            },
        ]

        for promo in promo_codes:
            PromoCode.objects.update_or_create(
                code=promo["code"],
                defaults={**promo, "is_active": True},
            )

        self.stdout.write(self.style.SUCCESS("Promo codes are ready"))
