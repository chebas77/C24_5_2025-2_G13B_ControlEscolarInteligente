# Generated migration for preferencias_padre table

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS preferencias_padre (
                pk_preferencia SERIAL PRIMARY KEY,
                fk_padre INTEGER NOT NULL UNIQUE,
                telefono VARCHAR(20),
                direccion VARCHAR(200),
                notificaciones_email BOOLEAN NOT NULL DEFAULT TRUE,
                notificaciones_sms BOOLEAN NOT NULL DEFAULT FALSE,
                notificar_asistencia BOOLEAN NOT NULL DEFAULT TRUE,
                notificar_calificaciones BOOLEAN NOT NULL DEFAULT TRUE,
                notificar_comportamiento BOOLEAN NOT NULL DEFAULT TRUE,
                frecuencia_resumen VARCHAR(20) NOT NULL DEFAULT 'semanal',
                FOREIGN KEY (fk_padre) REFERENCES padre(pk_padre) ON DELETE CASCADE
            );
            """,
            reverse_sql="DROP TABLE IF EXISTS preferencias_padre;"
        ),
    ]
