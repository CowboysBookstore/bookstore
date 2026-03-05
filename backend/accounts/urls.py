from django.urls import path

from .views import (
    ActivationVerifyView,
    ForgotPasswordView,
    LoginView,
    RegisterView,
    ResetPasswordView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify/", ActivationVerifyView.as_view(), name="verify"),
    path("login/", LoginView.as_view(), name="login"),
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]
