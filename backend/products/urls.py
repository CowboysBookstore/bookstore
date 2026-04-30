from django.urls import path
from .views import ProductListView, ProductDetailView, PromoCodeValidateView, OrderCheckoutView, OrderListView, OrderDetailView

urlpatterns = [
    path("", ProductListView.as_view(), name="product-list"),
    path("<int:pk>/", ProductDetailView.as_view(), name="product-detail"),
    path("promocodes/validate/", PromoCodeValidateView.as_view(), name="promocode-validate"),
    path("orders/checkout/", OrderCheckoutView.as_view(), name="order-checkout"),
    path("orders/", OrderListView.as_view(), name="order-list"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
]