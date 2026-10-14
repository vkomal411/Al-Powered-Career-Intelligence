import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.config import settings

logger = logging.getLogger("email_service")


class EmailService:
    """
    Enterprise Email Service for CareerPilot.AI.
    Dispatches transactional emails via SMTP (TLS/SSL) when configured,
    or falls back gracefully to structured console logging in development/testing.
    """

    def __init__(self):
        self.host = settings.smtp_host
        self.port = settings.smtp_port
        self.user = settings.smtp_user
        self.password = settings.smtp_password
        self.from_email = settings.smtp_from_email or "noreply@careerpilot.ai"
        self.use_tls = settings.smtp_tls

    @property
    def is_smtp_configured(self) -> bool:
        return bool(self.host and self.port and self.user and self.password)

    def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        reset_url = f"{settings.frontend_origin.rstrip('/')}/reset-password?token={reset_token}"
        subject = "CareerPilot.AI — Reset Your Password"

        text_content = (
            f"Hello,\n\n"
            f"You requested to reset your password for your CareerPilot.AI account.\n"
            f"Please click or copy the link below to set a new password:\n\n"
            f"{reset_url}\n\n"
            f"This link will expire in 15 minutes for security reasons.\n"
            f"If you did not request this, please ignore this email and your password will remain unchanged.\n\n"
            f"— The CareerPilot.AI Team"
        )

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0b1220; color: #f8fafc; margin: 0; padding: 30px; }}
            .container {{ max-width: 540px; margin: 0 auto; background: #111726; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
            .logo {{ font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 24px; display: inline-block; text-decoration: none; }}
            .logo span {{ color: #6366f1; }}
            h1 {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; }}
            p {{ font-size: 14px; line-height: 1.6; color: #94a3b8; }}
            .btn {{ display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; margin: 20px 0; }}
            .btn:hover {{ background: #4338ca; }}
            .note {{ font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 18px; margin-top: 24px; }}
            .link-alt {{ font-size: 11px; word-break: break-all; color: #6366f1; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">CareerPilot<span>.AI</span></div>
            <h1>Reset Your Password</h1>
            <p>We received a request to reset the password associated with your account (<strong>{to_email}</strong>).</p>
            <p>Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong> and can only be used once.</p>
            <div>
              <a href="{reset_url}" class="btn" target="_blank">Reset Password</a>
            </div>
            <p>If you're having trouble with the button, copy and paste this URL into your web browser:</p>
            <p class="link-alt">{reset_url}</p>
            <div class="note">
              If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
            </div>
          </div>
        </body>
        </html>
        """

        if self.is_smtp_configured:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = self.from_email
                msg["To"] = to_email

                msg.attach(MIMEText(text_content, "plain"))
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                    if self.use_tls:
                        server.starttls()
                    server.login(self.user, self.password)
                    server.sendmail(self.from_email, [to_email], msg.as_string())

                logger.info("Successfully dispatched password reset email via SMTP to %s", to_email)
                return True
            except Exception as e:
                logger.error("Failed to send password reset email via SMTP: %s", e)
                # Fallback to logging so reset is still recoverable
                self._log_fallback(to_email, reset_url)
                return False
        else:
            self._log_fallback(to_email, reset_url)
            return True

    def _log_fallback(self, to_email: str, reset_url: str):
        logger.info(
            "\n"
            "======================================================================\n"
            " [EMAIL SERVICE SIMULATOR - DEV/TEST MODE]\n"
            " To: %s\n"
            " Subject: CareerPilot.AI — Reset Your Password\n"
            " Reset URL: %s\n"
            " Expiry: 15 minutes\n"
            "======================================================================",
            to_email,
            reset_url,
        )


email_service = EmailService()
