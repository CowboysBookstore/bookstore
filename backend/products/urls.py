from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import ProductViewSet
from .views import WishlistView, CartView, CheckoutView

router = DefaultRouter()
router.register("", ProductViewSet, basename="product")

urlpatterns = [
    path("", include(router.urls)),
    path("wishlist/", WishlistView.as_view(), name="wishlist"),
    path("cart/", CartView.as_view(), name="cart"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
]
