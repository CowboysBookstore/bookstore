from django.core.management.base import BaseCommand
from products.models import Product
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
                title=product_data.get("title"),  # Use title as the unique lookup
                defaults={
                    "category": product_data.get("category", ""),
                    "description": product_data.get("description", ""),
                    "price": product_data.get("price", "0.00"),
                    "image_url": product_data.get("image_url", ""),
                    "stock": product_data.get("inventory", 0),
                    "is_active": True,
                },
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"✓ Created: {product.title}"))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f"⟳ Updated: {product.title}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"\n✓ Seeding complete! Created: {created_count}, Updated: {updated_count}"
            )
        )
