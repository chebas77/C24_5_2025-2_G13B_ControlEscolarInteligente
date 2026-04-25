from __future__ import annotations

from datetime import date, datetime, timedelta, timezone

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError

from reports.models import (
    Alumno,
    AlumnoMetrics,
    Asistencia,
    AsistenciaDetalle,
    Autorizacion,
    CodigoFamilia,
    Padre,
    PersonalEducativo,
    PreferenciasPadre,
    Rol,
)


DEMO_PASSWORD = "DemoSCEI2026!"
SEED_OBSERVATION = "Seed demo para aulas de profesores principales."

FIRST_NAMES = [
    "Alonso",
    "Bruno",
    "Camila",
    "Daniel",
    "Elena",
    "Fabian",
    "Gisella",
    "Hugo",
    "Isabella",
    "Javier",
    "Kiara",
    "Leonardo",
    "Maite",
    "Nicolas",
    "Olivia",
    "Patricio",
    "Rafaela",
    "Samuel",
    "Tamara",
    "Uriel",
    "Valentina",
    "Ximena",
    "Yahir",
    "Zoe",
    "Abril",
    "Dario",
    "Emilia",
    "Franco",
    "Luciana",
    "Matias",
]

LAST_NAMES = [
    "Alvarez",
    "Benites",
    "Carrasco",
    "Delgado",
    "Espinoza",
    "Fuentes",
    "Gamarra",
    "Herrera",
    "Ibarra",
    "Jara",
    "Linares",
    "Medina",
    "Nunez",
    "Ochoa",
    "Palacios",
    "Quispe",
    "Rivera",
    "Salas",
    "Tello",
    "Ugarte",
    "Valdivia",
    "Wong",
    "Zapata",
    "Arce",
]


TEACHER_CONFIGS = [
    {
        "email": "profesor001@demo.scei.pe",
        "username": "teacher_demo_001",
        "nombre": "Profesor",
        "apellido_paterno": "Silva",
        "apellido_materno": "Demo",
        "dni": "70000001",
        "celular": "920000001",
        "especialidad": "Matematica",
        "salon_asignado": "1ro-A",
        "code": "T001",
    },
    {
        "email": "profesor002@demo.scei.pe",
        "username": "teacher_demo_002",
        "nombre": "Profesor",
        "apellido_paterno": "Martinez",
        "apellido_materno": "Demo",
        "dni": "70000002",
        "celular": "920000002",
        "especialidad": "Comunicacion",
        "salon_asignado": "2do-B",
        "code": "T002",
    },
]


class Command(BaseCommand):
    help = (
        "Crea alumnos demo adicionales para los profesores principales "
        "profesor001@demo.scei.pe y profesor002@demo.scei.pe."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=30,
            help="Cantidad total de alumnos a crear entre ambos profesores (default: 30).",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Elimina solo los alumnos/familias/asistencias de este seed antes de recrearlos.",
        )
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="Cantidad de dias recientes para generar asistencia variada (default: 30).",
        )

    def handle(self, *args, **options):
        count = options["count"]
        reset = options["reset"]
        days = options["days"]

        if count < len(TEACHER_CONFIGS):
            raise CommandError(f"--count debe ser al menos {len(TEACHER_CONFIGS)}.")
        if days < 1:
            raise CommandError("--days debe ser mayor a 0.")

        if reset:
            self._log("Limpiando datos de seed_teacher_students...")
            self._reset_seed_data()

        roles = self._ensure_roles()
        teachers = [self._ensure_teacher(config, roles["Profesor"]) for config in TEACHER_CONFIGS]

        created_students: list[Alumno] = []
        for teacher_index, teacher in enumerate(teachers):
            teacher_count = self._count_for_teacher(count, teacher_index)
            created_students.extend(
                self._ensure_students_for_teacher(
                    teacher=teacher,
                    config=TEACHER_CONFIGS[teacher_index],
                    role=roles["Alumno"],
                    count=teacher_count,
                )
            )

        self._ensure_attendance(teachers, days)
        self._ensure_student_metrics(created_students)

        self.stdout.write(self.style.SUCCESS("Seed de alumnos por profesor completado."))
        for teacher in teachers:
            classroom = (teacher.salon_asignado or "").strip()
            classroom_count = Alumno.objects.filter(
                grado=classroom.split("-", 1)[0],
                seccion=classroom.split("-", 1)[1],
            ).count()
            self.stdout.write(
                f"{teacher.email} ({classroom}): {classroom_count} alumnos visibles en el panel."
            )
        self.stdout.write(f"Asistencias variadas generadas para los ultimos {days} dias.")
        self.stdout.write("Password demo para usuarios auth creados: DemoSCEI2026!")

    def _reset_seed_data(self) -> None:
        seed_students = Alumno.objects.filter(codigo_alumno__startswith="ALU-T")
        seed_families = CodigoFamilia.objects.filter(codigo__startswith="FAM-T")
        seed_parents = Padre.objects.filter(email__startswith="padre.t", email__endswith="@demo.scei.pe")

        seed_attendance = Asistencia.objects.filter(observacion=SEED_OBSERVATION)
        AsistenciaDetalle.objects.filter(fk_asistencia__in=seed_attendance).delete()
        AsistenciaDetalle.objects.filter(fk_alumno__in=seed_students).delete()
        Asistencia.objects.filter(observacion=SEED_OBSERVATION).delete()
        AlumnoMetrics.objects.filter(fk_alumno__in=seed_students).delete()
        PreferenciasPadre.objects.filter(fk_padre__in=seed_parents).delete()
        Autorizacion.objects.filter(fk_codigo_familia__in=seed_families).delete()
        seed_students.delete()
        seed_parents.delete()
        seed_families.delete()
        User.objects.filter(username__startswith="parent_teacher_seed_").delete()

    def _ensure_roles(self) -> dict[str, Rol]:
        descriptions = {
            "Profesor": "Personal docente para control de asistencia.",
            "Padre": "Responsable de familia con acceso al seguimiento.",
            "Alumno": "Estudiante para asistencia y reconocimiento facial.",
        }
        roles: dict[str, Rol] = {}
        for name, description in descriptions.items():
            role, _ = Rol.objects.update_or_create(
                nombre_rol=name,
                defaults={"descripcion": description},
            )
            roles[name] = role
        return roles

    def _ensure_teacher(self, config: dict[str, str], role: Rol) -> PersonalEducativo:
        teacher, _ = PersonalEducativo.objects.update_or_create(
            email=config["email"],
            defaults={
                "nombre": config["nombre"],
                "apellido_paterno": config["apellido_paterno"],
                "apellido_materno": config["apellido_materno"],
                "dni": config["dni"],
                "celular": config["celular"],
                "especialidad": config["especialidad"],
                "salon_asignado": config["salon_asignado"],
                "estado": "activo",
                "fk_rol": role,
            },
        )

        user, _ = User.objects.get_or_create(
            username=config["username"],
            defaults={"email": config["email"]},
        )
        user.email = config["email"]
        user.first_name = config["nombre"]
        user.last_name = f"{config['apellido_paterno']} {config['apellido_materno']}"
        user.is_staff = False
        user.is_superuser = False
        user.is_active = True
        user.set_password(DEMO_PASSWORD)
        user.save()
        return teacher

    def _ensure_students_for_teacher(
        self,
        teacher: PersonalEducativo,
        config: dict[str, str],
        role: Rol,
        count: int,
    ) -> list[Alumno]:
        grade, section = [part.strip() for part in (teacher.salon_asignado or "1ro-A").split("-", 1)]
        students: list[Alumno] = []

        for index in range(1, count + 1):
            global_index = self._global_student_index(config["code"], index)
            family = self._ensure_family(config["code"], index)
            parent = self._ensure_parent(config["code"], index, family)
            first_name = FIRST_NAMES[(global_index - 1) % len(FIRST_NAMES)]
            last_name = LAST_NAMES[(global_index + 3) % len(LAST_NAMES)]
            mother_last_name = LAST_NAMES[(global_index + 11) % len(LAST_NAMES)]

            student, _ = Alumno.objects.update_or_create(
                codigo_alumno=f"ALU-{config['code']}-{index:03d}",
                defaults={
                    "nombre": first_name,
                    "apellido_paterno": last_name,
                    "apellido_materno": mother_last_name,
                    "dni": self._dni("5", global_index),
                    "grado": grade,
                    "seccion": section,
                    "fecha_nacimiento": date(2012 + (index % 4), ((index - 1) % 12) + 1, ((index - 1) % 27) + 1),
                    "estado": "activo",
                    "fk_codigo_familia": family,
                    "fk_rol": role,
                },
            )
            self._ensure_parent_preferences(parent, index)
            students.append(student)

        return students

    def _ensure_family(self, teacher_code: str, index: int) -> CodigoFamilia:
        family, _ = CodigoFamilia.objects.update_or_create(
            codigo=f"FAM-{teacher_code}-{index:03d}",
            defaults={
                "direccion": f"Av. Aula {teacher_code} {100 + index}, Lima",
                "estado": "activo",
            },
        )
        Autorizacion.objects.update_or_create(
            fk_codigo_familia=family,
            defaults={
                "estado_autorizacion": "aprobada",
                "observacion": "Autorizacion demo para alumno de aula principal.",
            },
        )
        return family

    def _ensure_parent(self, teacher_code: str, index: int, family: CodigoFamilia) -> Padre:
        global_index = self._global_student_index(teacher_code, index)
        first_name = FIRST_NAMES[(global_index + 5) % len(FIRST_NAMES)]
        last_name = LAST_NAMES[(global_index + 7) % len(LAST_NAMES)]
        mother_last_name = LAST_NAMES[(global_index + 13) % len(LAST_NAMES)]
        email = f"padre.{teacher_code.lower()}.{index:03d}@demo.scei.pe"

        parent, _ = Padre.objects.update_or_create(
            email=email,
            defaults={
                "nombre": first_name,
                "apellido_paterno": last_name,
                "apellido_materno": mother_last_name,
                "dni": self._dni("6", global_index),
                "celular": self._phone("93", global_index),
                "fk_codigo_familia": family,
            },
        )

        user, _ = User.objects.get_or_create(
            username=f"parent_teacher_seed_{teacher_code.lower()}_{index:03d}",
            defaults={"email": email},
        )
        user.email = email
        user.first_name = first_name
        user.last_name = f"{last_name} {mother_last_name}"
        user.is_staff = False
        user.is_superuser = False
        user.is_active = True
        user.set_password(DEMO_PASSWORD)
        user.save()
        return parent

    def _ensure_parent_preferences(self, parent: Padre, index: int) -> None:
        PreferenciasPadre.objects.update_or_create(
            fk_padre=parent,
            defaults={
                "telefono": parent.celular,
                "direccion": f"Av. Familia Docente {300 + index}, Lima",
                "notificaciones_email": True,
                "notificaciones_sms": index % 4 == 0,
                "notificar_asistencia": True,
                "notificar_calificaciones": True,
                "notificar_comportamiento": True,
                "frecuencia_resumen": "semanal",
            },
        )

    def _ensure_attendance(self, teachers: list[PersonalEducativo], days: int) -> None:
        for teacher in teachers:
            classroom = (teacher.salon_asignado or "").strip()
            if "-" not in classroom:
                continue

            grade, section = [part.strip() for part in classroom.split("-", 1)]
            classroom_students = list(
                Alumno.objects.filter(
                    grado=grade,
                    seccion=section,
                    estado="activo",
                ).order_by("apellido_paterno", "apellido_materno", "nombre")
            )

            for day_offset in range(days):
                attendance_date = date.today() - timedelta(days=day_offset)
                attendance, _ = Asistencia.objects.update_or_create(
                    fk_personal=teacher,
                    fecha=attendance_date,
                    curso=teacher.especialidad or "Curso Demo",
                    aula=classroom,
                    defaults={
                        "hora_inicio": "07:30",
                        "hora_fin": "13:30",
                        "observacion": SEED_OBSERVATION,
                        "estado": "cerrada",
                    },
                )

                for index, student in enumerate(classroom_students, start=1):
                    status, check_in_time, similarity, observation = self._attendance_pattern(
                        student_index=index,
                        day_offset=day_offset,
                    )

                    AsistenciaDetalle.objects.update_or_create(
                        fk_asistencia=attendance,
                        fk_alumno=student,
                        defaults={
                            "porcentaje_similitud": similarity,
                            "hora_entrada": check_in_time,
                            "estado_asistencia": status,
                            "imagen_capturada": (
                                f"/captures/demo/{student.codigo_alumno.lower()}.jpg"
                                if status != "Ausente"
                                else None
                            ),
                            "dispositivo": f"CAM-{((index - 1) % 4) + 1:02d}",
                            "observacion": observation,
                        },
                    )

    def _attendance_pattern(self, student_index: int, day_offset: int):
        pattern = (student_index * 3 + day_offset * 5) % 17

        if pattern in {0, 11, 14}:
            return (
                "Ausente",
                None,
                None,
                "Falta registrada para el seguimiento mensual.",
            )

        if pattern in {3, 7, 13}:
            late_offset = (student_index + day_offset) % 20
            hour = 7 if late_offset < 14 else 8
            minute = 46 + late_offset if hour == 7 else late_offset - 14
            return (
                "Tardanza",
                f"{hour:02d}:{minute:02d}",
                92.0 + ((student_index + day_offset) % 5),
                "Ingreso fuera del horario regular.",
            )

        minute = 25 + ((student_index + day_offset) % 16)
        return (
            "Presente",
            f"07:{minute:02d}",
            96.0 + ((student_index + day_offset) % 4),
            "Marcacion registrada correctamente.",
        )

    def _ensure_student_metrics(self, students: list[Alumno]) -> None:
        for index, student in enumerate(students, start=1):
            embedding = None if index % 6 == 0 else self._build_embedding(index)
            AlumnoMetrics.objects.update_or_create(
                fk_alumno=student,
                defaults={
                    "embedding": embedding,
                    "facial_area": {
                        "x": 92 + index,
                        "y": 72 + index,
                        "w": 180,
                        "h": 180,
                        "left_eye": [132 + index, 135],
                        "right_eye": [210 + index, 136],
                    },
                    "porcentaje_similitud": None if embedding is None else round(88.0 + (index % 10), 2),
                    "ultima_captura": datetime.now(timezone.utc) - timedelta(hours=index),
                },
            )

    def _count_for_teacher(self, total_count: int, teacher_index: int) -> int:
        base = total_count // len(TEACHER_CONFIGS)
        remainder = total_count % len(TEACHER_CONFIGS)
        return base + (1 if teacher_index < remainder else 0)

    def _global_student_index(self, teacher_code: str, index: int) -> int:
        teacher_offset = 0 if teacher_code == "T001" else 100
        return teacher_offset + index

    def _build_embedding(self, seed: int) -> list[float]:
        return [round((((seed * 19) + position) % 200) / 100 - 1, 6) for position in range(128)]

    def _dni(self, prefix: str, index: int) -> str:
        return f"{prefix}{index:07d}"

    def _phone(self, prefix: str, index: int) -> str:
        return f"{prefix}{index:07d}"

    def _log(self, message: str) -> None:
        self.stdout.write(self.style.NOTICE(message))
        self.stdout.flush()
