import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("""
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
    """)
    print("✓ Tabla preferencias_padre creada exitosamente")
