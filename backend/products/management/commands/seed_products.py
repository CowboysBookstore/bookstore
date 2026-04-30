from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    """
    Django management command to seed the database with initial placeholder products.
    Uses get_or_create to ensure idempotency.
    """

    def handle(self, *args, **options):
        products = [
            {
                "title": "Introduction to Algorithms",
                "author": "Thomas H. Cormen",
                "description": "A comprehensive update of the leading algorithms text.",
                "price": "89.99",
                "image_url": "https://images.unsplash.com/photo-1512820200504-0f227dc5b4dc?auto=format&fit=crop&w=500&q=60",
                "category": "Computer Science",
                "stock": 50,
            },
            {
                "title": "University Physics",
                "author": "Hugh D. Young",
                "description": "Broad, rigorous overview of physics principles.",
                "price": "119.50",
                "image_url": "https://images.unsplash.com/photo-1633613286848-e6f43bbafb84?auto=format&fit=crop&w=500&q=60",
                "category": "Physics",
                "stock": 30,
            },
            {
                "title": "Cowboy Bookstore Hoodie",
                "author": "McNeese Apparel",
                "description": "Premium comfort hoodie with the McNeese State University logo.",
                "price": "45.00",
                "image_url": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=60",
                "category": "Apparel",
                "stock": 100,
            },
        ]

        for product_data in products:
            Product.objects.get_or_create(title=product_data["title"], defaults=product_data)

        self.stdout.write(self.style.SUCCESS("Successfully seeded products!"))
