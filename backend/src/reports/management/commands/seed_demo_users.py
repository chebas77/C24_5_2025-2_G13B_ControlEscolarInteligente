from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from itertools import cycle
from typing import Iterable

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


FIRST_NAMES = [
    "Juan",
    "Maria",
    "Luis",
    "Ana",
    "Carlos",
    "Lucia",
    "Pedro",
    "Sofia",
    "Diego",
    "Valeria",
    "Mateo",
    "Camila",
    "Jose",
    "Daniela",
    "Andres",
    "Gabriela",
    "Miguel",
    "Fernanda",
    "Sebastian",
    "Alessandra",
    "Joaquin",
    "Renata",
    "Adrian",
    "Fiorella",
]

LAST_NAMES = [
    "Garcia",
    "Rodriguez",
    "Torres",
    "Silva",
    "Lopez",
    "Martinez",
    "Vargas",
    "Mendoza",
    "Rojas",
    "Fernandez",
    "Castillo",
    "Sanchez",
    "Paredes",
    "Navarro",
    "Vega",
    "Salazar",
    "Ramos",
    "Campos",
    "Reyes",
    "Cruz",
    "Flores",
    "Morales",
    "Aguilar",
    "Ortega",
]

TEACHER_SPECIALTIES = [
    "Matematica",
    "Comunicacion",
    "Ciencia y Tecnologia",
    "Historia",
    "Ingles",
    "Arte",
    "Educacion Fisica",
    "Tutoria",
]

GRADES = ["1ro", "2do", "3ro", "4to", "5to"]
SECTIONS = ["A", "B", "C", "D"]


class Command(BaseCommand):
    help = (
        "Crea datos demo para administradores, profesores, padres y alumnos, "
        "incluyendo familias, asistencias y metricas faciales simuladas."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=20,
            help="Cantidad minima de registros por tipo (default: 20).",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Elimina los datos demo previos antes de recrearlos.",
        )

    def handle(self, *args, **options):
        count = options["count"]
        reset = options["reset"]

        if count < 1:
            raise CommandError("--count debe ser mayor a 0.")

        if reset:
            self._log("Limpiando datos demo previos...")
            self._reset_demo_data()

        self._log("Creando roles base...")
        roles = self._ensure_roles()
        self._log("Creando familias y autorizaciones...")
        families = self._ensure_families(count)
        self._log("Creando administradores demo...")
        self._ensure_admins(count, roles["Administrador"])
        self._log("Creando profesores demo...")
        teachers = self._ensure_teachers(count, roles["Profesor"])
        self._log("Creando padres demo...")
        parents = self._ensure_parents(families)
        self._log("Creando alumnos demo...")
        students = self._ensure_students(families, roles["Alumno"])
        self._log("Creando preferencias de padres...")
        self._ensure_parent_preferences(parents)
        self._log("Creando asistencias demo...")
        self._ensure_attendance(students, teachers)
        self._log("Creando metricas faciales demo...")
        metrics_summary = self._ensure_student_metrics(students)

        self.stdout.write(self.style.SUCCESS("Seed demo completado."))
        self.stdout.write(
            f"Administradores: {count}, Profesores: {count}, "
            f"Padres: {len(parents)}, Alumnos: {len(students)}"
        )
        self.stdout.write(
            "Metricas faciales: "
            f"{metrics_summary['complete']} completas, "
            f"{metrics_summary['incomplete']} incompletas, "
            f"{metrics_summary['pending']} pendientes"
        )
        self.stdout.write(
            "Credenciales demo de padres: email `padre001@demo.scei.pe` a "
            f"`padre{count:03d}@demo.scei.pe`, DNI del hijo correspondiente."
        )
        self.stdout.write("Password demo para usuarios auth: DemoSCEI2026!")

    def _reset_demo_data(self) -> None:
        demo_students = Alumno.objects.filter(codigo_alumno__startswith="ALU-")
        demo_parents = Padre.objects.filter(email__endswith="@demo.scei.pe")
        demo_staff = PersonalEducativo.objects.filter(email__endswith="@demo.scei.pe")
        demo_families = CodigoFamilia.objects.filter(codigo__startswith="FAM-")

        AsistenciaDetalle.objects.filter(fk_alumno__in=demo_students).delete()
        AsistenciaDetalle.objects.filter(fk_asistencia__fk_personal__in=demo_staff).delete()
        Asistencia.objects.filter(fk_personal__in=demo_staff).delete()
        AlumnoMetrics.objects.filter(fk_alumno__in=demo_students).delete()
        PreferenciasPadre.objects.filter(fk_padre__in=demo_parents).delete()
        Autorizacion.objects.filter(fk_codigo_familia__in=demo_families).delete()
        demo_students.delete()
        demo_parents.delete()
        demo_staff.delete()
        demo_families.delete()
        User.objects.filter(email__endswith="@demo.scei.pe").delete()

    def _ensure_roles(self) -> dict[str, Rol]:
        role_descriptions = {
            "Administrador": "Gestiona configuracion, enrolamiento y reportes.",
            "Profesor": "Personal docente para control de asistencia.",
            "Padre": "Responsable de familia con acceso al seguimiento.",
            "Alumno": "Estudiante para asistencia y reconocimiento facial.",
        }

        roles: dict[str, Rol] = {}
        for name, description in role_descriptions.items():
            role, _ = Rol.objects.get_or_create(
                nombre_rol=name,
                defaults={"descripcion": description},
            )
            if role.descripcion != description:
                role.descripcion = description
                role.save(update_fields=["descripcion"])
            roles[name] = role
        return roles

    def _ensure_families(self, count: int) -> list[CodigoFamilia]:
        families: list[CodigoFamilia] = []
        for index in range(1, count + 1):
            family, _ = CodigoFamilia.objects.get_or_create(
                codigo=f"FAM-{index:03d}",
                defaults={
                    "direccion": f"Av. Demo {100 + index}, Lima",
                    "estado": "activo",
                },
            )
            family.direccion = family.direccion or f"Av. Demo {100 + index}, Lima"
            family.estado = "activo"
            family.save(update_fields=["direccion", "estado"])
            families.append(family)

            Autorizacion.objects.get_or_create(
                fk_codigo_familia=family,
                defaults={
                    "estado_autorizacion": "aprobada",
                    "observacion": "Autorizacion demo para simulacion.",
                },
            )
        return families

    def _ensure_admins(self, count: int, role: Rol) -> None:
        for index in range(1, count + 1):
            first_name = FIRST_NAMES[(index - 1) % len(FIRST_NAMES)]
            last_name = LAST_NAMES[(index + 2) % len(LAST_NAMES)]
            mother_last_name = LAST_NAMES[(index + 9) % len(LAST_NAMES)]
            email = f"admin{index:03d}@demo.scei.pe"

            PersonalEducativo.objects.update_or_create(
                email=email,
                defaults={
                    "nombre": first_name,
                    "apellido_paterno": last_name,
                    "apellido_materno": mother_last_name,
                    "dni": self._dni("8", index),
                    "celular": self._phone("91", index),
                    "especialidad": "Gestion Escolar",
                    "salon_asignado": "ADM",
                    "estado": "activo",
                    "fk_rol": role,
                },
            )

            user, _ = User.objects.get_or_create(
                username=f"admin_demo_{index:03d}",
                defaults={"email": email},
            )
            user.email = email
            user.first_name = first_name
            user.last_name = f"{last_name} {mother_last_name}"
            user.is_staff = True
            user.is_superuser = False
            user.is_active = True
            user.set_password("DemoSCEI2026!")
            user.save()

    def _ensure_teachers(self, count: int, role: Rol) -> list[PersonalEducativo]:
        teachers: list[PersonalEducativo] = []
        for index in range(1, count + 1):
            first_name = FIRST_NAMES[(index + 4) % len(FIRST_NAMES)]
            last_name = LAST_NAMES[(index + 6) % len(LAST_NAMES)]
            mother_last_name = LAST_NAMES[(index + 13) % len(LAST_NAMES)]
            email = f"profesor{index:03d}@demo.scei.pe"

            teacher, _ = PersonalEducativo.objects.update_or_create(
                email=email,
                defaults={
                    "nombre": first_name,
                    "apellido_paterno": last_name,
                    "apellido_materno": mother_last_name,
                    "dni": self._dni("7", index),
                    "celular": self._phone("92", index),
                    "especialidad": TEACHER_SPECIALTIES[(index - 1) % len(TEACHER_SPECIALTIES)],
                    "salon_asignado": f"{GRADES[(index - 1) % len(GRADES)]}-{SECTIONS[(index - 1) % len(SECTIONS)]}",
                    "estado": "activo",
                    "fk_rol": role,
                },
            )
            teachers.append(teacher)

            user, _ = User.objects.get_or_create(
                username=f"teacher_demo_{index:03d}",
                defaults={"email": email},
            )
            user.email = email
            user.first_name = first_name
            user.last_name = f"{last_name} {mother_last_name}"
            user.is_staff = False
            user.is_superuser = False
            user.is_active = True
            user.set_password("DemoSCEI2026!")
            user.save()

        return teachers

    def _ensure_parents(self, families: Iterable[CodigoFamilia]) -> list[Padre]:
        parents: list[Padre] = []
        for index, family in enumerate(families, start=1):
            first_name = FIRST_NAMES[(index + 7) % len(FIRST_NAMES)]
            last_name = LAST_NAMES[(index + 10) % len(LAST_NAMES)]
            mother_last_name = LAST_NAMES[(index + 17) % len(LAST_NAMES)]
            email = f"padre{index:03d}@demo.scei.pe"

            parent, _ = Padre.objects.update_or_create(
                email=email,
                defaults={
                    "nombre": first_name,
                    "apellido_paterno": last_name,
                    "apellido_materno": mother_last_name,
                    "dni": self._dni("6", index),
                    "celular": self._phone("93", index),
                    "fk_codigo_familia": family,
                },
            )
            parents.append(parent)

            user, _ = User.objects.get_or_create(
                username=f"parent_demo_{index:03d}",
                defaults={"email": email},
            )
            user.email = email
            user.first_name = first_name
            user.last_name = f"{last_name} {mother_last_name}"
            user.is_staff = False
            user.is_superuser = False
            user.is_active = True
            user.set_password("DemoSCEI2026!")
            user.save()

        return parents

    def _ensure_students(self, families: list[CodigoFamilia], role: Rol) -> list[Alumno]:
        students: list[Alumno] = []
        for index, family in enumerate(families, start=1):
            first_name = FIRST_NAMES[(index + 11) % len(FIRST_NAMES)]
            last_name = LAST_NAMES[(index + 3) % len(LAST_NAMES)]
            mother_last_name = LAST_NAMES[(index + 15) % len(LAST_NAMES)]
            birth_date = date(2010 + (index % 5), ((index - 1) % 12) + 1, ((index - 1) % 27) + 1)

            student, _ = Alumno.objects.update_or_create(
                codigo_alumno=f"ALU-{index:03d}",
                defaults={
                    "nombre": first_name,
                    "apellido_paterno": last_name,
                    "apellido_materno": mother_last_name,
                    "dni": self._dni("5", index),
                    "grado": GRADES[(index - 1) % len(GRADES)],
                    "seccion": SECTIONS[(index - 1) % len(SECTIONS)],
                    "fecha_nacimiento": birth_date,
                    "estado": "activo",
                    "fk_codigo_familia": family,
                    "fk_rol": role,
                },
            )
            students.append(student)
        return students

    def _ensure_parent_preferences(self, parents: Iterable[Padre]) -> None:
        for index, parent in enumerate(parents, start=1):
            PreferenciasPadre.objects.update_or_create(
                fk_padre=parent,
                defaults={
                    "telefono": parent.celular,
                    "direccion": f"Av. Familia {200 + index}, Lima",
                    "notificaciones_email": True,
                    "notificaciones_sms": index % 3 == 0,
                    "notificar_asistencia": True,
                    "notificar_calificaciones": True,
                    "notificar_comportamiento": True,
                    "frecuencia_resumen": "semanal" if index % 2 else "diario",
                },
            )

    def _ensure_attendance(
        self,
        students: list[Alumno],
        teachers: list[PersonalEducativo],
    ) -> None:
        teacher_cycle = cycle(teachers)
        for index, student in enumerate(students, start=1):
            teacher = next(teacher_cycle)
            attendance_date = date.today() - timedelta(days=index % 10)
            attendance, _ = Asistencia.objects.update_or_create(
                fk_personal=teacher,
                fecha=attendance_date,
                curso=teacher.especialidad or "Curso Demo",
                aula=teacher.salon_asignado or "A-1",
                defaults={
                    "hora_inicio": "07:30",
                    "hora_fin": "13:30",
                    "observacion": "Registro demo generado automaticamente.",
                    "estado": "cerrada",
                },
            )

            status = "Presente" if index % 5 else "Tardanza"
            AsistenciaDetalle.objects.update_or_create(
                fk_asistencia=attendance,
                fk_alumno=student,
                defaults={
                    "porcentaje_similitud": 98.2 if status == "Presente" else 91.4,
                    "hora_entrada": "07:32" if status == "Presente" else "07:48",
                    "estado_asistencia": status,
                    "imagen_capturada": f"/captures/demo/alumno-{student.pk_alumno}.jpg",
                    "dispositivo": f"CAM-{((index - 1) % 4) + 1:02d}",
                    "observacion": "Demo para seguimiento y reportes.",
                },
            )

    def _ensure_student_metrics(self, students: list[Alumno]) -> dict[str, int]:
        summary = {"complete": 0, "incomplete": 0, "pending": 0}

        for index, student in enumerate(students, start=1):
            if index % 5 == 0:
                AlumnoMetrics.objects.filter(fk_alumno=student).delete()
                summary["pending"] += 1
                continue

            facial_area = {
                "x": 90 + index,
                "y": 70 + index,
                "w": 180,
                "h": 180,
                "left_eye": [130 + index, 135],
                "right_eye": [210 + index, 136],
            }

            defaults = {
                "facial_area": facial_area,
                "porcentaje_similitud": round(87.5 + (index % 10), 2),
                "ultima_captura": datetime.now(timezone.utc) - timedelta(hours=index),
            }

            if index % 4 == 0:
                defaults["embedding"] = None
                summary["incomplete"] += 1
            else:
                defaults["embedding"] = self._build_embedding(index)
                summary["complete"] += 1

            AlumnoMetrics.objects.update_or_create(
                fk_alumno=student,
                defaults=defaults,
            )

        return summary

    def _build_embedding(self, seed: int) -> list[float]:
        return [round((((seed * 17) + position) % 200) / 100 - 1, 6) for position in range(128)]

    def _log(self, message: str) -> None:
        self.stdout.write(self.style.NOTICE(message))
        self.stdout.flush()

    def _dni(self, prefix: str, index: int) -> str:
        return f"{prefix}{index:07d}"

    def _phone(self, prefix: str, index: int) -> str:
        return f"{prefix}{index:07d}"
