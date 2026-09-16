import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from products.models import Product

User = get_user_model()


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def product_payload():
    return {
        "title": "CHEM 101 Lab Manual",
        "category": "Textbooks",
        "short_description": "Required lab manual",
        "description": "Core chemistry lab manual for first-year students.",
        "price": "42.50",
        "stock": 14,
        "badge": "Required",
        "format": "Paperback",
        "rating": 4.7,
        "pickup_note": "Ready for same-day campus pickup",
        "delivery_note": "Delivers in 2 business days",
        "highlights": ["Lab-safe layout", "Weekly experiment guides"],
        "cover_gradient": "linear-gradient(135deg, #0f172a 0%, #1d4ed8 55%, #60a5fa 100%)",
    }


@pytest.mark.django_db
def test_product_list_is_public(client):
    Product.objects.create(title="ENG 101 Writing Handbook", price="64.99", stock=5)

    response = client.get("/api/products/")

    assert response.status_code == 200
    assert response.json()[0]["title"] == "ENG 101 Writing Handbook"


@pytest.mark.django_db
def test_product_create_requires_authentication(client, product_payload):
    response = client.post("/api/products/", product_payload, format="json")

    assert response.status_code in {401, 403}


@pytest.mark.django_db
def test_product_create_forbids_non_staff_users(client, product_payload):
    user = User.objects.create_user(
        email="pat@mcneese.edu",
        password="Secretpass1",
        first_name="Pat",
        last_name="Rider",
        is_active=True,
    )
    client.force_authenticate(user=user)

    response = client.post("/api/products/", product_payload, format="json")

    assert response.status_code == 403


@pytest.mark.django_db
def test_product_create_allows_staff_users(client, product_payload):
    staff_user = User.objects.create_user(
        email="staff@mcneese.edu",
        password="Secretpass1",
        first_name="Store",
        last_name="Manager",
        is_active=True,
        is_staff=True,
    )
    client.force_authenticate(user=staff_user)

    response = client.post("/api/products/", product_payload, format="json")

    assert response.status_code == 201
    assert Product.objects.filter(title="CHEM 101 Lab Manual").exists()


@pytest.mark.django_db
def test_checkout_uses_database_prices_and_product_slugs(client, settings):
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    product = Product.objects.create(
        slug="eng-101-writing-handbook",
        title="ENG 101 Writing Handbook",
        category="Textbooks",
        price="64.99",
        stock=4,
    )

    response = client.post(
        "/api/products/orders/checkout/",
        {
            "fulfillment": "pickup",
            "pickupSlot": "Tomorrow, 10:00 AM - 12:00 PM",
            "customer": {
                "fullName": "Pat Rider",
                "email": "pat@mcneese.edu",
                "phone": "3375550100",
            },
            "paymentMethod": "pay-at-pickup",
            "paymentLabel": "Payment at pickup",
            "subtotal": "0.01",
            "tax": "0.00",
            "total": "0.01",
            "items": [
                {
                    "productId": product.slug,
                    "quantity": 1,
                    "unitPrice": "0.01",
                }
            ],
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.json()["subtotal"] == "64.99"
    assert response.json()["tax"] == "5.36"
    assert response.json()["total"] == "70.35"
    assert response.json()["status"] == "pending"
    assert response.json()["payment_method"] == "pay-later"
    assert response.json()["items"][0]["product_slug"] == product.slug

    product.refresh_from_db()
    assert product.stock == 3


@pytest.mark.django_db
def test_checkout_rejects_duplicate_lines_over_available_stock(client):
    product = Product.objects.create(
        slug="limited-notebook",
        title="Limited Notebook",
        price="10.00",
        stock=2,
    )
    response = client.post(
        "/api/products/orders/checkout/",
        {
            "fulfillment": "pickup",
            "customer": {"fullName": "Pat Rider", "email": "pat@mcneese.edu"},
            "items": [
                {"productId": product.slug, "quantity": 2},
                {"productId": product.slug, "quantity": 1},
            ],
        },
        format="json",
    )
    assert response.status_code == 400
    product.refresh_from_db()
    assert product.stock == 2
