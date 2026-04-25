from django.db import migrations


SQLITE_REBUILD_SQL = """
PRAGMA foreign_keys = OFF;

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
DROP TABLE IF EXISTS marcacion;

CREATE TABLE codigo_familia (
    pk_codigo_familia INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    direccion VARCHAR(100),
    estado VARCHAR(20)
);

CREATE TABLE rol (
    pk_rol INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_rol VARCHAR(50) NOT NULL,
    descripcion VARCHAR(100)
);

CREATE TABLE padre (
    pk_padre INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50) NOT NULL,
    dni VARCHAR(12) NOT NULL,
    email VARCHAR(100) UNIQUE,
    celular VARCHAR(20),
    fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia) ON DELETE CASCADE
);

CREATE TABLE autorizacion (
    pk_autorizacion INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia) ON DELETE CASCADE,
    estado_autorizacion VARCHAR(20),
    observacion VARCHAR(100)
);

CREATE TABLE alumno (
    pk_alumno INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE alumno_metrics (
    pk_alumno_metrics INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_alumno INTEGER REFERENCES alumno(pk_alumno) ON DELETE CASCADE,
    embedding TEXT,
    facial_area TEXT,
    porcentaje_similitud REAL,
    ultima_captura DATETIME
);

CREATE TABLE personal_educativo (
    pk_personal INTEGER PRIMARY KEY AUTOINCREMENT,
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

CREATE TABLE asistencia (
    pk_asistencia INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_personal INTEGER REFERENCES personal_educativo(pk_personal) ON DELETE CASCADE,
    fecha DATE,
    curso VARCHAR(50),
    aula VARCHAR(10),
    hora_inicio TIME,
    hora_fin TIME,
    observacion VARCHAR(200),
    estado VARCHAR(20)
);

CREATE TABLE asistencia_detalle (
    pk_asistencia_detalle INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_asistencia INTEGER NOT NULL REFERENCES asistencia(pk_asistencia) ON DELETE CASCADE,
    fk_alumno INTEGER NOT NULL REFERENCES alumno(pk_alumno) ON DELETE CASCADE,
    porcentaje_similitud REAL,
    hora_entrada TIME,
    estado_asistencia VARCHAR(20),
    imagen_capturada VARCHAR(200),
    dispositivo VARCHAR(50),
    observacion VARCHAR(200)
);

CREATE TABLE notificacion_padre (
    pk_notificacion INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_asistencia INTEGER REFERENCES asistencia(pk_asistencia) ON DELETE CASCADE,
    fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia) ON DELETE CASCADE,
    mensaje VARCHAR(200),
    estado_envio VARCHAR(20),
    medio_envio VARCHAR(20)
);

CREATE TABLE comunicado (
    pk_comunicado INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'info',
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_evento DATE,
    dirigido_a VARCHAR(50),
    grado VARCHAR(10),
    fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia) ON DELETE CASCADE,
    fk_personal INTEGER REFERENCES personal_educativo(pk_personal) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'activo',
    prioridad INTEGER DEFAULT 1
);

CREATE TABLE preferencias_padre (
    pk_preferencia INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_padre INTEGER NOT NULL UNIQUE REFERENCES padre(pk_padre) ON DELETE CASCADE,
    telefono VARCHAR(20),
    direccion VARCHAR(200),
    notificaciones_email BOOLEAN NOT NULL DEFAULT 1,
    notificaciones_sms BOOLEAN NOT NULL DEFAULT 0,
    notificar_asistencia BOOLEAN NOT NULL DEFAULT 1,
    notificar_calificaciones BOOLEAN NOT NULL DEFAULT 1,
    notificar_comportamiento BOOLEAN NOT NULL DEFAULT 1,
    frecuencia_resumen VARCHAR(20) NOT NULL DEFAULT 'semanal'
);

CREATE TABLE marcacion (
    pk_marcacion INTEGER PRIMARY KEY AUTOINCREMENT,
    dni VARCHAR(12) NOT NULL,
    hora_marcacion DATETIME NOT NULL,
    tipo_marcacion VARCHAR(30) NOT NULL
);

PRAGMA foreign_keys = ON;
"""


def rebuild_sqlite_reports_schema(apps, schema_editor):
    if schema_editor.connection.vendor != "sqlite":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.executescript(SQLITE_REBUILD_SQL)


class Migration(migrations.Migration):

    dependencies = [
        ("reports", "0003_create_marcacion"),
    ]

    operations = [
        migrations.RunPython(
            rebuild_sqlite_reports_schema,
            migrations.RunPython.noop,
        ),
    ]
