from __future__ import annotations

import os

from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    ActivationVerifySerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
)


class RegisterView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        auto_activate = os.getenv("AUTO_ACTIVATE_ACCOUNTS", "false").lower() in {
            "1", "true", "yes", "on"
        }
        if (
            not auto_activate
            and settings.EMAIL_BACKEND == "django.core.mail.backends.console.EmailBackend"
        ):
            return Response(
                {"detail": "Account creation is temporarily unavailable while email verification is being set up."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        activation_required = getattr(serializer, "activation_required", True)
        response_data = {
            "activation_required": activation_required,
            "detail": (
                "Account created. You can sign in now."
                if not activation_required
                else "Account created. Check your email for the verification code."
            ),
        }
        return Response(response_data, status=status.HTTP_201_CREATED)


class ActivationVerifyView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        serializer = ActivationVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Account activated."}, status=status.HTTP_200_OK)


class LoginView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tokens = serializer.save()
        return Response(tokens, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        if settings.EMAIL_BACKEND == "django.core.mail.backends.console.EmailBackend":
            return Response(
                {"detail": "Password recovery is temporarily unavailable while email delivery is being set up."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response_data = serializer.save()
        return Response(response_data, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    authentication_classes: list = []
    permission_classes: list = []

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password updated."}, status=status.HTTP_200_OK)
