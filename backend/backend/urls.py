from django.contrib import admin
from django.db import connection
from django.http import JsonResponse
from django.urls import include, path


def health(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        cursor.fetchone()
    return JsonResponse({"status": "ok", "service": "cowboy-bookstore-api"})


urlpatterns = [
    path("", health, name="health-root"),
    path("api/health/", health, name="health"),
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/products/", include("products.urls")),
]
