from __future__ import annotations

import os
from typing import Iterable

from django.conf import settings
from django.core.mail import send_mail

import requests


def _base_html(title: str, body_content: str) -> str:
    return f"""\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Inter',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

<tr>
<td style="background-color:#0033a0;padding:24px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:10px;vertical-align:middle;">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
</td>
<td style="vertical-align:middle;">
<span style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.2px;">Cowboy Bookstore</span>
</td>
</tr></table>
</td>
</tr>

<tr>
<td style="padding:32px;">
{body_content}
</td>
</tr>

<tr>
<td style="padding:0 32px 24px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="border-top:1px solid #e2e8f0;padding-top:16px;">
<p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
&copy; 2026 McNeese State University &middot; Cowboy Bookstore
</p>
</td></tr>
</table>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>"""


def _send_via_brevo(
    *,
    subject: str,
    plain: str,
    html: str,
    to_emails: Iterable[str],
) -> None:
    """Send an email using Brevo's HTTP API (avoids blocked SMTP on Render).

    Enable by setting:
      - BREVO_API_KEY

    Optionally set:
      - BREVO_FROM_EMAIL (defaults to DEFAULT_FROM_EMAIL email part)
      - BREVO_FROM_NAME (defaults to "Cowboy Bookstore")
      - BREVO_TIMEOUT_SECONDS (defaults to 10)
    """

    api_key = os.getenv("BREVO_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("BREVO_API_KEY is not set")

    default_from = settings.DEFAULT_FROM_EMAIL
    # settings.DEFAULT_FROM_EMAIL may be "Name <email>".
    from_email = os.getenv("BREVO_FROM_EMAIL", "").strip()
    if not from_email:
        if "<" in default_from and ">" in default_from:
            from_email = default_from.split("<", 1)[1].split(">", 1)[0].strip()
        else:
            from_email = default_from.strip()

    from_name = os.getenv("BREVO_FROM_NAME", "").strip() or "Cowboy Bookstore"
    timeout = int(os.getenv("BREVO_TIMEOUT_SECONDS", "10"))

    # Brevo v3 transactional email endpoint
    payload = {
        "sender": {"email": from_email, "name": from_name},
        "to": [{"email": e} for e in to_emails],
        "subject": subject,
        "textContent": plain,
        "htmlContent": html,
    }

    resp = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json",
        },
        json=payload,
        timeout=timeout,
    )
    if resp.status_code >= 400:
        raise RuntimeError(f"Brevo API error {resp.status_code}: {resp.text[:500]}")


def _send_email(subject: str, plain: str, html: str, to: list[str]) -> None:
    """Send email using the best available provider.

    Priority:
      1) Gmail API (OAuth) when GMAIL_REFRESH_TOKEN is set
      2) Brevo HTTP API when BREVO_API_KEY is set
      3) Django email backend
    """

    if os.getenv("GMAIL_REFRESH_TOKEN", "").strip():
        # Import lazily so dev/test environments that haven't installed the
        # Google client libraries don't crash just by importing this module.
        from .gmail_sender import send_gmail_message

        default_from = settings.DEFAULT_FROM_EMAIL
        from_email = os.getenv("GMAIL_FROM_EMAIL", "").strip()
        if not from_email:
            if "<" in default_from and ">" in default_from:
                from_email = default_from.split("<", 1)[1].split(">", 1)[0].strip()
            else:
                from_email = default_from.strip()

        from_name = os.getenv("GMAIL_FROM_NAME", "").strip() or "Cowboy Bookstore"
        reply_to = os.getenv("GMAIL_REPLY_TO", "").strip() or None
        send_gmail_message(
            from_email=from_email,
            from_name=from_name,
            to_emails=to,
            subject=subject,
            plain=plain,
            html=html,
            reply_to=reply_to,
        )
        return

    if os.getenv("BREVO_API_KEY", "").strip():
        _send_via_brevo(subject=subject, plain=plain, html=html, to_emails=to)
        return

    send_mail(
        subject,
        plain,
        settings.DEFAULT_FROM_EMAIL,
        to,
        html_message=html,
        fail_silently=False,
    )


def send_activation_email(email: str, code: str) -> None:
    subject = "Cowboy Bookstore — Your verification code"

    plain = (
        f"Welcome to Cowboy Bookstore!\n\n"
        f"Your verification code is: {code}\n\n"
        f"Enter this code on the verification page to activate your account.\n"
        f"This code expires in 24 hours.\n\n"
        f"If you didn't create an account, you can safely ignore this email."
    )

    body = f"""\
<h2 style="margin:0 0 8px 0;font-size:22px;color:#0f172a;">Welcome!</h2>
<p style="margin:0 0 24px 0;font-size:14px;color:#64748b;">
Use the code below to verify your account and get started.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:20px 0;">
<div style="display:inline-block;background-color:#f9c80e;border-radius:12px;padding:16px 40px;">
<span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a;">{code}</span>
</div>
</td></tr>
</table>
<p style="margin:24px 0 0 0;font-size:13px;color:#94a3b8;">
This code expires in 24 hours. If you didn't create an account, ignore this email.
</p>"""

    html = _base_html("Verify your account", body)

    _send_email(subject, plain, html, [email])


def send_password_reset_email(email: str, code: str) -> None:
    subject = "Cowboy Bookstore — Your password reset code"

    plain = (
        f"We received a request to reset your password.\n\n"
        f"Your reset code is: {code}\n\n"
        f"Enter this code on the reset page to set a new password.\n"
        f"This code expires in 24 hours.\n\n"
        f"If you didn't request this, you can safely ignore this email."
    )

    body = f"""\
<h2 style="margin:0 0 8px 0;font-size:22px;color:#0f172a;">Password reset</h2>
<p style="margin:0 0 24px 0;font-size:14px;color:#64748b;">
We received a request to reset your password. Use the code below to continue.
</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:20px 0;">
<div style="display:inline-block;background-color:#f9c80e;border-radius:12px;padding:16px 40px;">
<span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a;">{code}</span>
</div>
</td></tr>
</table>
<p style="margin:24px 0 0 0;font-size:13px;color:#94a3b8;">
This code expires in 24 hours. If you didn't request this, ignore this email.
</p>"""

    html = _base_html("Reset your password", body)

    _send_email(subject, plain, html, [email])


def send_order_confirmation_email(email: str, order) -> None:
    """Send order confirmation email to customer."""
    from django.utils.dateformat import format as dateformat
    
    subject = f"Cowboy Bookstore — Order #{order.id} confirmed"

    # Format order items for plain text
    items_text = ""
    for item in order.items.all():
        items_text += f"  • {item.title} (x{item.quantity}) @ ${item.unit_price:.2f} = ${item.unit_price * item.quantity:.2f}\n"

    fulfillment_text = (
        f"Pickup: {order.pickup_slot}" 
        if order.fulfillment_method == "pickup" 
        else f"Delivery to: {order.delivery_address}"
    )

    plain = f"""\
Thank you for your order!

Order #{order.id}
Placed: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}

Items:
{items_text}
Subtotal: ${order.subtotal:.2f}
Discount: -${order.discount:.2f}
Tax: ${order.tax:.2f}
Fulfillment fee: ${order.fulfillment_fee:.2f}
Total: ${order.total:.2f}

{fulfillment_text}
Payment method: {order.payment_label}

Your order is being prepared. You'll receive a shipping update soon.

Questions? Reply to this email or visit Cowboy Bookstore.
"""

    # Format order items for HTML
    items_html = ""
    for item in order.items.all():
        items_html += f"""
<tr>
  <td style="padding:12px;border-bottom:1px solid #e2e8f0;">
    <p style="margin:0 0 4px 0;font-weight:600;color:#0f172a;">{item.title}</p>
    <p style="margin:0;font-size:13px;color:#64748b;">Qty: {item.quantity} @ ${item.unit_price:.2f}</p>
  </td>
  <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#0f172a;font-weight:600;">
    ${item.unit_price * item.quantity:.2f}
  </td>
</tr>
"""

    fulfillment_html = (
        f"<strong>Pickup:</strong> {order.pickup_slot}" 
        if order.fulfillment_method == "pickup" 
        else f"<strong>Delivery to:</strong> {order.delivery_address}"
    )

    body = f"""\
<h2 style="margin:0 0 8px 0;font-size:22px;color:#0f172a;">Order confirmed!</h2>
<p style="margin:0 0 24px 0;font-size:14px;color:#64748b;">
Thank you for shopping at Cowboy Bookstore. Your order has been received and is being prepared.
</p>

<div style="background-color:#f1f5f9;border-radius:12px;padding:16px;margin:0 0 24px 0;">
<p style="margin:0 0 8px 0;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Order #</p>
<p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">{order.id}</p>
</div>

<p style="margin:0 0 12px 0;font-size:13px;color:#94a3b8;">
<strong>Placed:</strong> {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
{items_html}
<tr>
  <td style="padding:12px;text-align:right;color:#64748b;">Subtotal</td>
  <td style="padding:12px;text-align:right;color:#0f172a;font-weight:600;">${order.subtotal:.2f}</td>
</tr>
<tr>
  <td style="padding:12px;text-align:right;color:#64748b;">Discount</td>
  <td style="padding:12px;text-align:right;color:#10b981;font-weight:600;">-${order.discount:.2f}</td>
</tr>
<tr>
  <td style="padding:12px;text-align:right;color:#64748b;">Tax</td>
  <td style="padding:12px;text-align:right;color:#0f172a;font-weight:600;">${order.tax:.2f}</td>
</tr>
<tr>
  <td style="padding:12px;text-align:right;color:#64748b;">Fulfillment</td>
  <td style="padding:12px;text-align:right;color:#0f172a;font-weight:600;">${order.fulfillment_fee:.2f}</td>
</tr>
<tr style="background-color:#f1f5f9;">
  <td style="padding:12px;text-align:right;color:#64748b;font-weight:600;">Total</td>
  <td style="padding:12px;text-align:right;color:#0f172a;font-weight:700;font-size:16px;">${order.total:.2f}</td>
</tr>
</table>

<div style="background-color:#f9f3e6;border-radius:12px;padding:16px;margin:0 0 24px 0;">
<p style="margin:0 0 8px 0;font-size:13px;color:#92400e;font-weight:600;">Fulfillment Details</p>
<p style="margin:0;font-size:14px;color:#78350f;">
{fulfillment_html}
</p>
</div>

<div style="background-color:#f3f4f6;border-radius:12px;padding:16px;">
<p style="margin:0 0 8px 0;font-size:13px;color:#374151;font-weight:600;">Payment Method</p>
<p style="margin:0;font-size:14px;color:#4b5563;">
{order.payment_label}
</p>
</div>

<p style="margin:32px 0 0 0;font-size:13px;color:#94a3b8;">
Your order is being prepared and will ship soon. You'll receive a tracking update via email.
</p>
"""

    html = _base_html("Order confirmed", body)

    _send_email(subject, plain, html, [email])
