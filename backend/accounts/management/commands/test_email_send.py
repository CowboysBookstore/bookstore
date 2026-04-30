from __future__ import annotations

from django.core.management.base import BaseCommand, CommandError

from accounts.emails import send_activation_email


class Command(BaseCommand):
    help = "Send a test activation email using the currently configured provider."

    def add_arguments(self, parser):
        parser.add_argument("email", help="Recipient email address")

    def handle(self, *args, **options):
        email = options["email"]
        if not email:
            raise CommandError("email is required")

        # Dummy code for testing.
        send_activation_email(email, "123456")
        self.stdout.write(self.style.SUCCESS(f"Sent test email to {email}"))
