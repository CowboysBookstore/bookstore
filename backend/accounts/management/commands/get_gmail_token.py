import os
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Generates a GMAIL_REFRESH_TOKEN by opening the Google OAuth browser flow."

    def handle(self, *args, **options):
        client_id = os.getenv("GMAIL_CLIENT_ID")
        client_secret = os.getenv("GMAIL_CLIENT_SECRET")

        if not client_id or not client_secret:
            self.stderr.write(self.style.ERROR("Error: GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET must be set in your .env file."))
            return

        client_config = {
            "installed": {
                "client_id": client_id.strip(),
                "client_secret": client_secret.strip(),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        }

        scopes = ["https://www.googleapis.com/auth/gmail.send"]
        
        try:
            from google_auth_oauthlib.flow import InstalledAppFlow
            flow = InstalledAppFlow.from_client_config(client_config, scopes=scopes)
            self.stdout.write(self.style.WARNING("Opening your browser to Google's login page..."))
            
            # This opens the browser and starts the local server to catch the callback
            creds = flow.run_local_server(port=0)
            
            self.stdout.write(self.style.SUCCESS("\nSuccess! Copy the token below into your .env file:\n"))
            self.stdout.write(f"GMAIL_REFRESH_TOKEN={creds.refresh_token}\n")
        except ImportError:
            self.stderr.write(self.style.ERROR("Missing required package. Please run: pip install google-auth-oauthlib"))
