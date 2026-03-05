"""Django admin registration for accounts models."""

from __future__ import annotations

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from unfold.admin import ModelAdmin
from unfold.decorators import display

from .models import ActivationCode, PasswordResetCode, User


@admin.register(User)
class UserAdmin(BaseUserAdmin, ModelAdmin):
    """Custom admin for the email-based User model."""

    ordering = ("email",)
    list_display = (
        "email",
        "first_name",
        "last_name",
        "show_active_status",
        "is_staff",
    )
    list_filter = ("is_active", "is_staff", "is_superuser")
    search_fields = ("email", "first_name", "last_name")
    list_filter_submit = True

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                ),
            },
        ),
    )

    @display(
        description="Status",
        label={True: "success", False: "danger"},
    )
    def show_active_status(self, obj):
        return obj.is_active


@admin.register(ActivationCode)
class ActivationCodeAdmin(ModelAdmin):
    list_display = (
        "user",
        "short_code",
        "expires_at",
        "show_used_status",
        "created_at",
    )
    list_filter = ("used",)
    search_fields = ("user__email", "code")
    raw_id_fields = ("user",)
    list_filter_submit = True
    readonly_fields = ("code", "created_at")

    @display(description="Code")
    def short_code(self, obj):
        return obj.code

    @display(
        description="Used",
        label={True: "warning", False: "success"},
    )
    def show_used_status(self, obj):
        return obj.used


@admin.register(PasswordResetCode)
class PasswordResetCodeAdmin(ModelAdmin):
    list_display = (
        "user",
        "short_code",
        "expires_at",
        "show_used_status",
        "created_at",
    )
    list_filter = ("used",)
    search_fields = ("user__email", "code")
    raw_id_fields = ("user",)
    list_filter_submit = True
    readonly_fields = ("code", "created_at")

    @display(description="Code")
    def short_code(self, obj):
        return obj.code

    @display(
        description="Used",
        label={True: "warning", False: "success"},
    )
    def show_used_status(self, obj):
        return obj.used
