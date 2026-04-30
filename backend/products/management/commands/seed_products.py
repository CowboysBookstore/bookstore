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


"""
lets go back to bookstore. let's reduce ambiguity on checkout. 
1. remove the contact info card 
2. remove pre-filled content in card place. ensure it's a standard card ui card that would work and not allow bad input. only allow valid input. 
3. for student id: remove the pre-filled one. make sure users enter 9 digits with the first 3 beign 0. 
4. for delivery address, use a standard delivery adddress ui in us. like with street, city, zip code, the works. 
5. make sure the promo codes actually do work. put them in the database i.e. create a model(so there can be way for admin to set them with a certain validity). and make sure they actuallty reduce prices. 
7. check anything else inconsistent with the payment workflow. 
8. check the code for inconsistencies, redundancies, bad patterns, bugs, ai commends (remove those and only keep or put human-like comments that are readable and useful). make sure the codebase follows DRY e.g. reusing react ui components, email sending logic, etc. 
10. make sure we're following best practices and there's no bug at all. 
11. most importantly, make sure your changes don't break anything already working. 
12. take as long as you need 13. keep things simple.
"""