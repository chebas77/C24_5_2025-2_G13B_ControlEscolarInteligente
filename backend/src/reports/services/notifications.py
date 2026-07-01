from __future__ import annotations

import base64
from dataclasses import dataclass
from datetime import date, datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.cache import cache
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils import timezone

from reports.models import Alumno, Asistencia, AsistenciaDetalle, NotificacionPadre, Padre, PreferenciasPadre


EVENT_LABELS = {
    "entrada": "Entrada registrada",
    "salida": "Salida registrada",
    "tardanza": "Tardanza detectada",
    "ausencia": "Ausencia detectada",
}


@dataclass
class NotificationTarget:
    email: str | None
    phone: str | None
    preference: PreferenciasPadre | None


def _localize(moment: datetime | None) -> datetime:
    return timezone.localtime(moment or timezone.now())


def _student_label(alumno: Alumno) -> str:
    return f"{alumno.apellido_paterno} {alumno.apellido_materno}, {alumno.nombre}"


def _resolve_notification_context(alumno: Alumno, occurred_at: datetime | None) -> dict[str, object | None]:
    local_moment = _localize(occurred_at)
    attendance = (
        AsistenciaDetalle.objects.select_related("fk_asistencia")
        .filter(fk_alumno=alumno, fk_asistencia__fecha=local_moment.date())
        .order_by("-pk_asistencia_detalle")
        .first()
    )
    fk_asistencia = attendance.fk_asistencia if attendance else None
    return {
        "fk_codigo_familia": alumno.fk_codigo_familia,
        "fk_asistencia": fk_asistencia,
        "event_date": local_moment.date(),
    }


def _recipient_targets(alumno: Alumno) -> list[NotificationTarget]:
    targets: list[NotificationTarget] = []
    family_id = alumno.fk_codigo_familia_id

    parents = Padre.objects.filter(fk_codigo_familia_id=family_id, email__isnull=False).exclude(email__exact="")
    for parent in parents:
        try:
            preferences = parent.preferencias
        except PreferenciasPadre.DoesNotExist:
            preferences = None
        phone = ""
        if preferences and preferences.telefono:
            phone = preferences.telefono.strip()
        elif parent.celular:
            phone = parent.celular.strip()
        targets.append(NotificationTarget(email=parent.email, phone=phone or None, preference=preferences))

    if not targets and alumno.email:
        targets.append(NotificationTarget(email=alumno.email, phone=None, preference=None))

    return targets


def can_send_event_email(preference: PreferenciasPadre | None, event_type: str) -> bool:
    if not preference:
        return True

    if not preference.notificaciones_email:
        return False

    event_flag_map = {
        "entrada": "notificar_entrada",
        "salida": "notificar_salida",
        "tardanza": "notificar_tardanza",
        "ausencia": "notificar_ausencia",
    }
    flag_name = event_flag_map.get(event_type)
    if not flag_name:
        return preference.notificar_asistencia

    return bool(getattr(preference, flag_name, preference.notificar_asistencia))


def can_send_event_sms(preference: PreferenciasPadre | None, event_type: str) -> bool:
    if not preference:
        return True

    if not preference.notificaciones_sms:
        return False

    event_flag_map = {
        "entrada": "notificar_entrada",
        "salida": "notificar_salida",
        "tardanza": "notificar_tardanza",
        "ausencia": "notificar_ausencia",
    }
    flag_name = event_flag_map.get(event_type)
    if not flag_name:
        return preference.notificar_asistencia

    return bool(getattr(preference, flag_name, preference.notificar_asistencia))


def build_attendance_event_payload(
    *,
    alumno: Alumno,
    event_type: str,
    occurred_at: datetime | None,
    device_label: str | None = None,
    extra_message: str | None = None,
) -> dict[str, str]:
    local_moment = _localize(occurred_at)
    event_label = EVENT_LABELS.get(event_type, event_type.capitalize())
    student_name = _student_label(alumno)
    grade_section = "Sin grado asignado"
    if alumno.grado or alumno.seccion:
        grade_section = f"{alumno.grado or ''} {alumno.seccion or ''}".strip()

    subject = f"{event_label} - {student_name}"
    lines = [
        f"Alumno: {student_name}",
        f"Grado y seccion: {grade_section}",
        f"Fecha: {local_moment.strftime('%d/%m/%Y')}",
        f"Hora: {local_moment.strftime('%H:%M:%S')}",
    ]
    if device_label:
        lines.append(f"Dispositivo: {device_label}")
    if extra_message:
        lines.append(f"Detalle: {extra_message}")

    body = "\n".join(lines)
    html_lines = "".join(f"<p>{line}</p>" for line in lines)

    return {
        "subject": subject,
        "body": body,
        "html_body": html_lines,
        "event_label": event_label,
        "event_date": local_moment.date().isoformat(),
        "event_time": local_moment.strftime('%H:%M:%S'),
    }


def build_attendance_sms_payload(
    *,
    alumno: Alumno,
    event_type: str,
    occurred_at: datetime | None,
    device_label: str | None = None,
    extra_message: str | None = None,
) -> dict[str, str]:
    local_moment = _localize(occurred_at)
    event_label = EVENT_LABELS.get(event_type, event_type.capitalize())
    student_name = _student_label(alumno)
    grade_section = "Sin grado asignado"
    if alumno.grado or alumno.seccion:
        grade_section = f"{alumno.grado or ''} {alumno.seccion or ''}".strip()

    parts = [
        f"{event_label}",
        student_name,
        grade_section,
        local_moment.strftime('%d/%m/%Y %H:%M:%S'),
    ]
    if device_label:
        parts.append(device_label)
    if extra_message:
        parts.append(extra_message)

    body = " | ".join(part for part in parts if part)
    return {
        "subject": f"{event_label} - {student_name}",
        "body": body[:450],
        "event_label": event_label,
        "event_date": local_moment.date().isoformat(),
        "event_time": local_moment.strftime('%H:%M:%S'),
    }


def _email_notification_exists(alumno: Alumno, event_type: str, event_date: date, email: str) -> bool:
    return NotificacionPadre.objects.filter(
        fk_alumno=alumno,
        tipo_evento=event_type,
        fecha_evento=event_date,
        medio_envio="email",
        estado_envio="enviada",
        destinatario_email__iexact=email,
    ).exists()


def _email_rate_limit_exceeded(email: str) -> bool:
    limit = getattr(settings, "EMAIL_RATE_LIMIT_PER_HOUR", 10)
    cache_key = f"email_rate:{email.lower()}"
    count = cache.get(cache_key, 0)
    if count >= limit:
        return True
    cache.set(cache_key, count + 1, timeout=3600)
    return False


def send_attendance_email_notification(
    *,
    alumno: Alumno,
    event_type: str,
    occurred_at: datetime | None,
    device_label: str | None = None,
    extra_message: str | None = None,
) -> list[NotificacionPadre]:
    payload = build_attendance_event_payload(
        alumno=alumno,
        event_type=event_type,
        occurred_at=occurred_at,
        device_label=device_label,
        extra_message=extra_message,
    )

    recipients = _recipient_targets(alumno)
    if not recipients:
        return []

    saved_notifications: list[NotificacionPadre] = []
    context = _resolve_notification_context(alumno, occurred_at)
    event_date = context["event_date"]

    for target in recipients:
        if not target.email:
            continue

        if _email_notification_exists(alumno, event_type, event_date, target.email):
            continue

        notification = NotificacionPadre.objects.create(
            fk_alumno=alumno,
            fk_codigo_familia=context["fk_codigo_familia"],
            fk_asistencia=context["fk_asistencia"],
            destinatario_email=target.email,
            asunto=payload["subject"],
            mensaje=payload["body"][:200],
            tipo_evento=event_type,
            estado_envio='pendiente',
            medio_envio='email',
            fecha_evento=event_date,
            intentos=0,
        )

        if not can_send_event_email(target.preference, event_type):
            notification.estado_envio = 'omitida'
            notification.detalle_error = 'Las preferencias del destinatario no permiten este evento.'
            notification.save(update_fields=['estado_envio', 'detalle_error'])
            saved_notifications.append(notification)
            continue

        if _email_rate_limit_exceeded(target.email):
            notification.estado_envio = 'omitida'
            notification.detalle_error = f'Límite de {getattr(settings, "EMAIL_RATE_LIMIT_PER_HOUR", 10)} emails/hora alcanzado.'
            notification.save(update_fields=['estado_envio', 'detalle_error'])
            saved_notifications.append(notification)
            continue

        try:
            email_message = EmailMultiAlternatives(
                subject=payload["subject"],
                body=payload["body"],
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None) or getattr(settings, 'EMAIL_HOST_USER', None),
                to=[target.email],
            )
            email_message.attach_alternative(
                render_to_string(
                    'email/attendance_notification.html',
                    {
                        'subject': payload['subject'],
                        'body_lines': payload['body'].splitlines(),
                        'student_name': _student_label(alumno),
                        'event_label': payload['event_label'],
                        'event_date': payload['event_date'],
                        'event_time': payload['event_time'],
                        'device_label': device_label or '',
                    },
                ),
                'text/html',
            )
            email_message.send(fail_silently=False)

            notification.estado_envio = 'enviada'
            notification.fecha_envio = timezone.now()
            notification.intentos = 1
            notification.save(update_fields=['estado_envio', 'fecha_envio', 'intentos'])
        except Exception as exc:
            notification.estado_envio = 'fallida'
            notification.detalle_error = str(exc)[:255]
            notification.intentos = 1
            notification.save(update_fields=['estado_envio', 'detalle_error', 'intentos'])

        saved_notifications.append(notification)

    return saved_notifications


def _send_sms_via_twilio(*, to_number: str, body: str) -> None:
    account_sid = getattr(settings, "TWILIO_ACCOUNT_SID", "")
    auth_token = getattr(settings, "TWILIO_AUTH_TOKEN", "")
    from_number = getattr(settings, "TWILIO_FROM_NUMBER", "") or getattr(settings, "SMS_FROM_NUMBER", "")

    if not account_sid or not auth_token or not from_number:
        raise RuntimeError("SMS provider no configurado.")

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    payload = urlencode({
        "From": from_number,
        "To": to_number,
        "Body": body[:1600],
    }).encode("utf-8")
    request = Request(url, data=payload, method="POST")
    credentials = base64.b64encode(f"{account_sid}:{auth_token}".encode("utf-8")).decode("utf-8")
    request.add_header("Authorization", f"Basic {credentials}")
    request.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urlopen(request, timeout=15) as response:
            response.read()
    except HTTPError as exc:
        raise RuntimeError(f"Error enviando SMS: {exc.code} {exc.reason}") from exc
    except URLError as exc:
        raise RuntimeError(f"Error de red enviando SMS: {exc.reason}") from exc


def send_attendance_sms_notification(
    *,
    alumno: Alumno,
    event_type: str,
    occurred_at: datetime | None,
    device_label: str | None = None,
    extra_message: str | None = None,
) -> list[NotificacionPadre]:
    payload = build_attendance_sms_payload(
        alumno=alumno,
        event_type=event_type,
        occurred_at=occurred_at,
        device_label=device_label,
        extra_message=extra_message,
    )

    recipients = _recipient_targets(alumno)
    if not recipients:
        return []

    saved_notifications: list[NotificacionPadre] = []
    context = _resolve_notification_context(alumno, occurred_at)
    event_date = context["event_date"]
    sms_backend = getattr(settings, "SMS_BACKEND", "console").lower()

    for target in recipients:
        if not target.phone:
            notification = NotificacionPadre.objects.create(
                fk_alumno=alumno,
                fk_codigo_familia=context["fk_codigo_familia"],
                fk_asistencia=context["fk_asistencia"],
                destinatario_email=target.email,
                destinatario_telefono=None,
                asunto=payload["subject"],
                mensaje=payload["body"][:200],
                tipo_evento=event_type,
                estado_envio='omitida',
                medio_envio='sms',
                fecha_evento=event_date,
                intentos=0,
                detalle_error='No hay numero de telefono configurado.',
            )
            saved_notifications.append(notification)
            continue

        notification = NotificacionPadre.objects.create(
            fk_alumno=alumno,
            fk_codigo_familia=context["fk_codigo_familia"],
            fk_asistencia=context["fk_asistencia"],
            destinatario_email=target.email,
            destinatario_telefono=target.phone,
            asunto=payload["subject"],
            mensaje=payload["body"][:200],
            tipo_evento=event_type,
            estado_envio='pendiente',
            medio_envio='sms',
            fecha_evento=event_date,
            intentos=0,
        )

        try:
            if sms_backend == "twilio":
                _send_sms_via_twilio(to_number=target.phone, body=payload["body"])
            else:
                print(f"[SMS:{sms_backend}] To={target.phone} | {payload['body']}")

            notification.estado_envio = 'enviada'
            notification.fecha_envio = timezone.now()
            notification.intentos = 1
            notification.save(update_fields=['estado_envio', 'fecha_envio', 'intentos'])
        except Exception as exc:
            notification.estado_envio = 'fallida'
            notification.detalle_error = str(exc)[:255]
            notification.intentos = 1
            notification.save(update_fields=['estado_envio', 'detalle_error', 'intentos'])

        saved_notifications.append(notification)

    return saved_notifications
