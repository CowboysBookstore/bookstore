from __future__ import annotations

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from products.models import Product


CATALOG_PATH = (
    Path(__file__).resolve().parents[4]
    / "frontend"
    / "src"
    / "storefront"
    / "catalog.json"
)


class Command(BaseCommand):
    help = "Seed the shared bookstore catalog into the database"

    def handle(self, *args, **options):
        if not CATALOG_PATH.exists():
            raise CommandError(f"Catalog file not found: {CATALOG_PATH}")

        catalog_products = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
        created = 0

        for product in catalog_products:
            defaults = {
                "title": product.get("title"),
                "category": product.get("category", "Textbooks"),
                "short_description": product.get("short_description", ""),
                "description": product.get("description", ""),
                "badge": product.get("badge", ""),
                "course": product.get("course", ""),
                "format": product.get("format", ""),
                "price": product.get("price"),
                "inventory": product.get("inventory", 0),
                "sku": product.get("sku", ""),
                "image_url": product.get("image_url", ""),
                "rating": product.get("rating", 4.5),
                "pickup_note": product.get("pickup_note", ""),
                "delivery_note": product.get("delivery_note", ""),
                "highlights": product.get("highlights", []),
                "cover_gradient": product.get("cover_gradient", ""),
            }
            _, was_created = Product.objects.update_or_create(
                slug=product.get("slug"), defaults=defaults
            )
            if was_created:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(catalog_products)} catalog products ({created} newly created)"
            )
        )
