"""Celery tasks: send email, SMS and in-app notifications."""
from __future__ import annotations

import smtplib
from email.mime.text import MIMEText

import structlog

from app.config import settings
from app.workers.celery_app import celery_app

logger = structlog.get_logger()


def _send_email(to: str, subject: str, body: str) -> None:
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM_ADDRESS
    msg["To"] = to
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USERNAME:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_ADDRESS, [to], msg.as_string())
            logger.info("email_sent", to=to, subject=subject)
    except Exception as exc:
        logger.error("email_failed", to=to, error=str(exc))
        raise


def _send_sms(phone: str, message: str) -> None:
    if settings.SMS_GATEWAY_PROVIDER == "sns":
        try:
            import boto3  # type: ignore
            client = boto3.client("sns", region_name=settings.AWS_REGION)
            client.publish(PhoneNumber=phone, Message=message)
            logger.info("sms_sent", phone=phone[:5] + "***")
        except Exception as exc:
            logger.error("sms_failed", error=str(exc))
    else:
        logger.warning("sms_gateway_unsupported", provider=settings.SMS_GATEWAY_PROVIDER)


@celery_app.task(
    name="app.workers.notifications.send_offer_notification",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def send_offer_notification(self, offer_id: str):
    """Notify the recipient's doctor that an organ offer is available."""
    import asyncio

    async def _run():
        from app.db.session import AsyncSessionLocal
        from app.models.models import Offer, AppUser, Recipient

        async with AsyncSessionLocal() as db:
            from sqlalchemy import select

            offer_result = await db.execute(select(Offer).where(Offer.id == offer_id))
            offer = offer_result.scalar_one_or_none()
            if not offer:
                return

            # Find the doctor for the recipient's hospital
            recipient_result = await db.execute(
                select(Recipient).where(Recipient.recipient_code == offer.recipient_code)
            )
            recipient = recipient_result.scalar_one_or_none()
            if not recipient:
                return

            doctor_result = await db.execute(
                select(AppUser)
                .where(AppUser.hospital_id == recipient.hospital_id)
                .where(AppUser.role == "doctor")
                .where(AppUser.is_active == True)
                .limit(1)
            )
            doctor = doctor_result.scalar_one_or_none()
            if not doctor:
                logger.warning("no_doctor_found", hospital_id=str(recipient.hospital_id))
                return

            subject = f"[PraanSetu] Organ Offer - {offer.recipient_code}"
            body = (
                f"An organ offer is available for recipient {offer.recipient_code}.\n"
                f"Offer ID: {offer.id}\n"
                f"Expires at: {offer.expires_at.isoformat()}\n\n"
                f"Please log in to PraanSetu to respond."
            )
            _send_email(doctor.email, subject, body)

    asyncio.new_event_loop().run_until_complete(_run())


@celery_app.task(name="app.workers.notifications.send_generic_notification")
def send_generic_notification(email: str, subject: str, body: str):
    _send_email(email, subject, body)
