from django.db import migrations


def is_sql_server(schema_editor):
    engine = (schema_editor.connection.settings_dict.get("ENGINE") or "").lower()
    vendor = (schema_editor.connection.vendor or "").lower()
    return "mssql" in engine or "sql_server" in engine or vendor in {"mssql", "microsoft"}


def table_exists(schema_editor, table_name):
    with schema_editor.connection.cursor() as cursor:
        existing_tables = schema_editor.connection.introspection.table_names(cursor)
    return table_name in existing_tables


def create_table_if_missing(schema_editor, table_name, sql):
    if table_exists(schema_editor, table_name):
        return
    schema_editor.execute(sql)


def create_reports_schema(apps, schema_editor):
    vendor = schema_editor.connection.vendor

    if vendor == "postgresql":
        pk_sql = "SERIAL PRIMARY KEY"
        json_sql = "JSONB"
        datetime_sql = "TIMESTAMP WITH TIME ZONE"
        bool_sql = "BOOLEAN"
        float_sql = "DOUBLE PRECISION"
        current_timestamp_sql = "CURRENT_TIMESTAMP"
    elif vendor == "mysql":
        pk_sql = "INTEGER PRIMARY KEY AUTO_INCREMENT"
        json_sql = "JSON"
        datetime_sql = "DATETIME(6)"
        bool_sql = "BOOLEAN"
        float_sql = "DOUBLE PRECISION"
        current_timestamp_sql = "CURRENT_TIMESTAMP(6)"
    elif is_sql_server(schema_editor):
        pk_sql = "INT IDENTITY(1,1) PRIMARY KEY"
        json_sql = "NVARCHAR(MAX)"
        datetime_sql = "DATETIME2"
        bool_sql = "BIT"
        float_sql = "FLOAT"
        current_timestamp_sql = "SYSDATETIME()"
    else:
        pk_sql = "INTEGER PRIMARY KEY AUTOINCREMENT"
        json_sql = "TEXT"
        datetime_sql = "DATETIME"
        bool_sql = "BOOLEAN"
        float_sql = "DOUBLE PRECISION"
        current_timestamp_sql = "CURRENT_TIMESTAMP"

    true_default = "1" if is_sql_server(schema_editor) else "TRUE"
    false_default = "0" if is_sql_server(schema_editor) else "FALSE"
    cascade_sql = " ON DELETE NO ACTION" if is_sql_server(schema_editor) else " ON DELETE CASCADE"

    create_table_if_missing(schema_editor, "codigo_familia", f"""
        CREATE TABLE codigo_familia (
            pk_codigo_familia {pk_sql},
            codigo VARCHAR(20) NOT NULL UNIQUE,
            direccion VARCHAR(100),
            estado VARCHAR(20)
        )
    """)

    create_table_if_missing(schema_editor, "rol", f"""
        CREATE TABLE rol (
            pk_rol {pk_sql},
            nombre_rol VARCHAR(50) NOT NULL,
            descripcion VARCHAR(100)
        )
    """)

    create_table_if_missing(schema_editor, "padre", f"""
        CREATE TABLE padre (
            pk_padre {pk_sql},
            nombre VARCHAR(50) NOT NULL,
            apellido_paterno VARCHAR(50) NOT NULL,
            apellido_materno VARCHAR(50) NOT NULL,
            dni VARCHAR(12) NOT NULL,
            email VARCHAR(100) UNIQUE,
            celular VARCHAR(20),
            fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia){cascade_sql}
        )
    """)

    create_table_if_missing(schema_editor, "autorizacion", f"""
        CREATE TABLE autorizacion (
            pk_autorizacion {pk_sql},
            fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia){cascade_sql},
            estado_autorizacion VARCHAR(20),
            observacion VARCHAR(100)
        )
    """)

    create_table_if_missing(schema_editor, "alumno", f"""
        CREATE TABLE alumno (
            pk_alumno {pk_sql},
            codigo_alumno VARCHAR(20) NOT NULL UNIQUE,
            nombre VARCHAR(50) NOT NULL,
            apellido_paterno VARCHAR(50) NOT NULL,
            apellido_materno VARCHAR(50) NOT NULL,
            dni VARCHAR(12) NOT NULL,
            grado VARCHAR(10),
            seccion VARCHAR(5),
            fecha_nacimiento DATE,
            estado VARCHAR(10),
            fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia){cascade_sql},
            fk_rol INTEGER REFERENCES rol(pk_rol){cascade_sql}
        )
    """)

    create_table_if_missing(schema_editor, "alumno_metrics", f"""
        CREATE TABLE alumno_metrics (
            pk_alumno_metrics {pk_sql},
            fk_alumno INTEGER REFERENCES alumno(pk_alumno){cascade_sql},
            embedding {json_sql},
            facial_area {json_sql},
            porcentaje_similitud {float_sql},
            ultima_captura {datetime_sql}
        )
    """)

    create_table_if_missing(schema_editor, "personal_educativo", f"""
        CREATE TABLE personal_educativo (
            pk_personal {pk_sql},
            nombre VARCHAR(50) NOT NULL,
            apellido_paterno VARCHAR(50) NOT NULL,
            apellido_materno VARCHAR(50) NOT NULL,
            dni VARCHAR(12) NOT NULL,
            email VARCHAR(100) UNIQUE,
            celular VARCHAR(20),
            especialidad VARCHAR(50),
            salon_asignado VARCHAR(10),
            estado VARCHAR(20),
            fk_rol INTEGER REFERENCES rol(pk_rol){cascade_sql}
        )
    """)

    create_table_if_missing(schema_editor, "asistencia", f"""
        CREATE TABLE asistencia (
            pk_asistencia {pk_sql},
            fk_personal INTEGER REFERENCES personal_educativo(pk_personal){cascade_sql},
            fecha DATE,
            curso VARCHAR(50),
            aula VARCHAR(10),
            hora_inicio TIME,
            hora_fin TIME,
            observacion VARCHAR(200),
            estado VARCHAR(20)
        )
    """)

    create_table_if_missing(schema_editor, "asistencia_detalle", f"""
        CREATE TABLE asistencia_detalle (
            pk_asistencia_detalle {pk_sql},
            fk_asistencia INTEGER NOT NULL REFERENCES asistencia(pk_asistencia){cascade_sql},
            fk_alumno INTEGER NOT NULL REFERENCES alumno(pk_alumno){cascade_sql},
            porcentaje_similitud {float_sql},
            hora_entrada TIME,
            estado_asistencia VARCHAR(20),
            imagen_capturada VARCHAR(200),
            dispositivo VARCHAR(50),
            observacion VARCHAR(200)
        )
    """)

    create_table_if_missing(schema_editor, "notificacion_padre", f"""
        CREATE TABLE notificacion_padre (
            pk_notificacion {pk_sql},
            fk_asistencia INTEGER REFERENCES asistencia(pk_asistencia){cascade_sql},
            fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia){cascade_sql},
            mensaje VARCHAR(200),
            estado_envio VARCHAR(20),
            medio_envio VARCHAR(20)
        )
    """)

    create_table_if_missing(schema_editor, "comunicado", f"""
        CREATE TABLE comunicado (
            pk_comunicado {pk_sql},
            titulo VARCHAR(100) NOT NULL,
            mensaje TEXT NOT NULL,
            tipo VARCHAR(20) DEFAULT 'info',
            fecha_publicacion {datetime_sql} DEFAULT {current_timestamp_sql},
            fecha_evento DATE,
            dirigido_a VARCHAR(50),
            grado VARCHAR(10),
            fk_codigo_familia INTEGER REFERENCES codigo_familia(pk_codigo_familia){cascade_sql},
            fk_personal INTEGER REFERENCES personal_educativo(pk_personal){cascade_sql},
            estado VARCHAR(20) DEFAULT 'activo',
            prioridad INTEGER DEFAULT 1
        )
    """)

    create_table_if_missing(schema_editor, "preferencias_padre", f"""
        CREATE TABLE preferencias_padre (
            pk_preferencia {pk_sql},
            fk_padre INTEGER NOT NULL UNIQUE REFERENCES padre(pk_padre){cascade_sql},
            telefono VARCHAR(20),
            direccion VARCHAR(200),
            notificaciones_email {bool_sql} NOT NULL DEFAULT {true_default},
            notificaciones_sms {bool_sql} NOT NULL DEFAULT {false_default},
            notificar_asistencia {bool_sql} NOT NULL DEFAULT {true_default},
            notificar_calificaciones {bool_sql} NOT NULL DEFAULT {true_default},
            notificar_comportamiento {bool_sql} NOT NULL DEFAULT {true_default},
            frecuencia_resumen VARCHAR(20) NOT NULL DEFAULT 'semanal'
        )
    """)


def drop_reports_schema(apps, schema_editor):
    tables = [
        "preferencias_padre",
        "comunicado",
        "notificacion_padre",
        "asistencia_detalle",
        "asistencia",
        "personal_educativo",
        "alumno_metrics",
        "alumno",
        "autorizacion",
        "padre",
        "rol",
        "codigo_familia",
    ]
    for table in tables:
        if is_sql_server(schema_editor):
            schema_editor.execute(f"IF OBJECT_ID('{table}', 'U') IS NOT NULL DROP TABLE {table}")
        else:
            schema_editor.execute(f"DROP TABLE IF EXISTS {table}")


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.RunPython(create_reports_schema, drop_reports_schema),
    ]
