from datetime import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from reports.models import Alumno, AsistenciaDetalle, Marcacion
from reports.services import send_attendance_email_notification, send_attendance_sms_notification


class Command(BaseCommand):
    help = "Envía notificaciones por email a los alumnos que no registraron asistencia en la fecha indicada."

    def add_arguments(self, parser):
        parser.add_argument(
            "--date",
            type=str,
            default=None,
            help="Fecha en formato YYYY-MM-DD. Si no se indica, usa hoy.",
        )

    def handle(self, *args, **options):
        selected_date = self._parse_date(options.get("date")) or timezone.localdate()
        students = Alumno.objects.all().select_related("fk_codigo_familia")

        sent_email = 0
        sent_sms = 0
        skipped = 0

        for alumno in students:
            has_facial_mark = Marcacion.objects.filter(
                dni=alumno.dni,
                hora_marcacion__date=selected_date,
                tipo_marcacion__startswith="facial:",
            ).exists()

            has_attendance_detail = AsistenciaDetalle.objects.filter(
                fk_alumno=alumno,
                fk_asistencia__fecha=selected_date,
            ).exists()

            if has_facial_mark or has_attendance_detail:
                skipped += 1
                continue

            notifications = send_attendance_email_notification(
                alumno=alumno,
                event_type="ausencia",
                occurred_at=timezone.make_aware(datetime.combine(selected_date, datetime.min.time())),
                extra_message="No se registro asistencia en la fecha seleccionada.",
            )
            sms_notifications = send_attendance_sms_notification(
                alumno=alumno,
                event_type="ausencia",
                occurred_at=timezone.make_aware(datetime.combine(selected_date, datetime.min.time())),
                extra_message="No se registro asistencia en la fecha seleccionada.",
            )
            sent_email += len([item for item in notifications if item.estado_envio == "enviada"])
            sent_sms += len([item for item in sms_notifications if item.estado_envio == "enviada"])

        self.stdout.write(
            self.style.SUCCESS(
                f"Notificaciones de ausencia procesadas para {selected_date}: email_enviadas={sent_email}, sms_enviados={sent_sms}, omitidas={skipped}."
            )
        )

    def _parse_date(self, value):
        if not value:
            return None
        try:
            return datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("--date debe tener formato YYYY-MM-DD")
