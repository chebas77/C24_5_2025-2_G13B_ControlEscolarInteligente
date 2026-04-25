from django.db import migrations


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE TABLE IF NOT EXISTS codigo_familia (
                pk_codigo_familia SERIAL PRIMARY KEY,
                codigo VARCHAR(20) NOT NULL UNIQUE,
                direccion VARCHAR(100),
                estado VARCHAR(20)
            );

            CREATE TABLE IF NOT EXISTS rol (
                pk_rol SERIAL PRIMARY KEY,
                nombre_rol VARCHAR(50) NOT NULL,
                descripcion VARCHAR(100)
            );

            CREATE TABLE IF NOT EXISTS padre (
                pk_padre SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                apellido_paterno VARCHAR(50) NOT NULL,
                apellido_materno VARCHAR(50) NOT NULL,
                dni VARCHAR(12) NOT NULL,
                email VARCHAR(100) UNIQUE,
                celular VARCHAR(20),
                fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS autorizacion (
                pk_autorizacion SERIAL PRIMARY KEY,
                fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia) ON DELETE CASCADE,
                estado_autorizacion VARCHAR(20),
                observacion VARCHAR(100)
            );

            CREATE TABLE IF NOT EXISTS alumno (
                pk_alumno SERIAL PRIMARY KEY,
                codigo_alumno VARCHAR(20) NOT NULL UNIQUE,
                nombre VARCHAR(50) NOT NULL,
                apellido_paterno VARCHAR(50) NOT NULL,
                apellido_materno VARCHAR(50) NOT NULL,
                dni VARCHAR(12) NOT NULL,
                grado VARCHAR(10),
                seccion VARCHAR(5),
                fecha_nacimiento DATE,
                estado VARCHAR(10),
                fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia) ON DELETE CASCADE,
                fk_rol INTEGER REFERENCES rol(pk_rol) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS alumno_metrics (
                pk_alumno_metrics SERIAL PRIMARY KEY,
                fk_alumno INTEGER REFERENCES alumno(pk_alumno) ON DELETE CASCADE,
                embedding JSONB,
                facial_area JSONB,
                porcentaje_similitud DOUBLE PRECISION,
                ultima_captura TIMESTAMP WITH TIME ZONE
            );

            CREATE TABLE IF NOT EXISTS personal_educativo (
                pk_personal SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                apellido_paterno VARCHAR(50) NOT NULL,
                apellido_materno VARCHAR(50) NOT NULL,
                dni VARCHAR(12) NOT NULL,
                email VARCHAR(100) UNIQUE,
                celular VARCHAR(20),
                especialidad VARCHAR(50),
                salon_asignado VARCHAR(10),
                estado VARCHAR(20),
                fk_rol INTEGER REFERENCES rol(pk_rol) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS asistencia (
                pk_asistencia SERIAL PRIMARY KEY,
                fk_personal INTEGER REFERENCES personal_educativo(pk_personal) ON DELETE CASCADE,
                fecha DATE,
                curso VARCHAR(50),
                aula VARCHAR(10),
                hora_inicio TIME,
                hora_fin TIME,
                observacion VARCHAR(200),
                estado VARCHAR(20)
            );

            CREATE TABLE IF NOT EXISTS asistencia_detalle (
                pk_asistencia_detalle SERIAL PRIMARY KEY,
                fk_asistencia INTEGER NOT NULL REFERENCES asistencia(pk_asistencia) ON DELETE CASCADE,
                fk_alumno INTEGER NOT NULL REFERENCES alumno(pk_alumno) ON DELETE CASCADE,
                porcentaje_similitud DOUBLE PRECISION,
                hora_entrada TIME,
                estado_asistencia VARCHAR(20),
                imagen_capturada VARCHAR(200),
                dispositivo VARCHAR(50),
                observacion VARCHAR(200)
            );

            CREATE TABLE IF NOT EXISTS notificacion_padre (
                pk_notificacion SERIAL PRIMARY KEY,
                fk_asistencia INTEGER REFERENCES asistencia(pk_asistencia) ON DELETE CASCADE,
                fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia) ON DELETE CASCADE,
                mensaje VARCHAR(200),
                estado_envio VARCHAR(20),
                medio_envio VARCHAR(20)
            );

            CREATE TABLE IF NOT EXISTS comunicado (
                pk_comunicado SERIAL PRIMARY KEY,
                titulo VARCHAR(100) NOT NULL,
                mensaje TEXT NOT NULL,
                tipo VARCHAR(20) DEFAULT 'info',
                fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                fecha_evento DATE,
                dirigido_a VARCHAR(50),
                grado VARCHAR(10),
                fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia) ON DELETE CASCADE,
                fk_personal INTEGER REFERENCES personal_educativo(pk_personal) ON DELETE CASCADE,
                estado VARCHAR(20) DEFAULT 'activo',
                prioridad INTEGER DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS preferencias_padre (
                pk_preferencia SERIAL PRIMARY KEY,
                fk_padre INTEGER NOT NULL UNIQUE REFERENCES padre(pk_padre) ON DELETE CASCADE,
                telefono VARCHAR(20),
                direccion VARCHAR(200),
                notificaciones_email BOOLEAN NOT NULL DEFAULT TRUE,
                notificaciones_sms BOOLEAN NOT NULL DEFAULT FALSE,
                notificar_asistencia BOOLEAN NOT NULL DEFAULT TRUE,
                notificar_calificaciones BOOLEAN NOT NULL DEFAULT TRUE,
                notificar_comportamiento BOOLEAN NOT NULL DEFAULT TRUE,
                frecuencia_resumen VARCHAR(20) NOT NULL DEFAULT 'semanal'
            );
            """,
            reverse_sql="""
            DROP TABLE IF EXISTS preferencias_padre;
            DROP TABLE IF EXISTS comunicado;
            DROP TABLE IF EXISTS notificacion_padre;
            DROP TABLE IF EXISTS asistencia_detalle;
            DROP TABLE IF EXISTS asistencia;
            DROP TABLE IF EXISTS personal_educativo;
            DROP TABLE IF EXISTS alumno_metrics;
            DROP TABLE IF EXISTS alumno;
            DROP TABLE IF EXISTS autorizacion;
            DROP TABLE IF EXISTS padre;
            DROP TABLE IF EXISTS rol;
            DROP TABLE IF EXISTS codigo_familia;
            """,
        ),
    ]
