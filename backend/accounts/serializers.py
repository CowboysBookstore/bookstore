from __future__ import annotations

from datetime import timedelta

from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from rest_framework import serializers

from .emails import send_activation_email, send_password_reset_email
from .models import ActivationCode, PasswordResetCode
from .utils import generate_jwt_pair, validate_mcneese_email

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value: str) -> str:
        if not validate_mcneese_email(value):
            raise serializers.ValidationError(
                "Registration is restricted to @mcneese.edu emails."
            )
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.is_active = False
        user.set_password(password)
        user.save()
        activation = ActivationCode.create_for_user(user, lifetime=timedelta(hours=24))
        send_activation_email(user.email, activation.code)
        return user


class ActivationVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()

    def validate(self, attrs):
        email = attrs["email"].lower()
        code = attrs["code"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or code.")
        try:
            activation = ActivationCode.objects.get(user=user, code=code)
        except ActivationCode.DoesNotExist:
            raise serializers.ValidationError("Invalid email or code.")
        if not activation.is_valid():
            raise serializers.ValidationError("Code is expired or already used.")
        attrs["user"] = user
        attrs["activation"] = activation
        return attrs

    def save(self, **kwargs):
        activation: ActivationCode = self.validated_data["activation"]
        user: User = self.validated_data["user"]
        activation.mark_used()
        user.is_active = True
        user.save(update_fields=["is_active"])
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email").lower()
        password = attrs.get("password")
        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account not activated.")
        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        user: User = validated_data["user"]
        access, refresh = generate_jwt_pair(str(user.id))
        return {"access": access, "refresh": refresh}


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        try:
            self.user = User.objects.get(email=value.lower())
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email.")
        if not self.user.is_active:
            raise serializers.ValidationError("Account not activated.")
        return value.lower()

    def create(self, validated_data):
        reset = PasswordResetCode.create_for_user(
            self.user, lifetime=timedelta(hours=24)
        )
        send_password_reset_email(self.user.email, reset.code)
        return {"detail": "Password reset code sent."}


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        email = attrs["email"].lower()
        code = attrs["code"]
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or code.")
        try:
            reset_code = PasswordResetCode.objects.get(user=user, code=code)
        except PasswordResetCode.DoesNotExist:
            raise serializers.ValidationError("Invalid email or code.")
        if not reset_code.is_valid():
            raise serializers.ValidationError("Code is expired or already used.")
        attrs["user"] = user
        attrs["reset_code"] = reset_code
        return attrs

    def save(self, **kwargs):
        user: User = self.validated_data["user"]
        reset_code: PasswordResetCode = self.validated_data["reset_code"]
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        reset_code.mark_used()
        return {"detail": "Password updated."}
