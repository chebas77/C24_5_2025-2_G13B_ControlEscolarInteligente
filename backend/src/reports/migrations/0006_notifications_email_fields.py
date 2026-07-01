from django.db import migrations, models


def _vendor(schema_editor):
    engine = (schema_editor.connection.settings_dict.get("ENGINE") or "").lower()
    vendor = (schema_editor.connection.vendor or "").lower()
    if "mssql" in engine or "sql_server" in engine or vendor in {"mssql", "microsoft"}:
        return "mssql"
    if vendor == "postgresql":
        return "postgresql"
    return vendor  # mysql, sqlite, etc.


def add_fields(apps, schema_editor):
    connection = schema_editor.connection
    db = _vendor(schema_editor)

    with connection.cursor() as cursor:
        alumno_columns = {column.name for column in connection.introspection.get_table_description(cursor, "notificacion_padre")}
        preferencias_columns = {column.name for column in connection.introspection.get_table_description(cursor, "preferencias_padre")}

    if "fk_alumno" not in alumno_columns:
        schema_editor.execute("ALTER TABLE notificacion_padre ADD fk_alumno INTEGER NULL")
    if "destinatario_email" not in alumno_columns:
        schema_editor.execute("ALTER TABLE notificacion_padre ADD destinatario_email VARCHAR(100) NULL")
    if "asunto" not in alumno_columns:
        schema_editor.execute("ALTER TABLE notificacion_padre ADD asunto VARCHAR(150) NULL")
    if "tipo_evento" not in alumno_columns:
        schema_editor.execute("ALTER TABLE notificacion_padre ADD tipo_evento VARCHAR(30) NULL")
    if "fecha_evento" not in alumno_columns:
        schema_editor.execute("ALTER TABLE notificacion_padre ADD fecha_evento DATE NULL")
    if "fecha_envio" not in alumno_columns:
        if db == "mssql":
            schema_editor.execute("ALTER TABLE notificacion_padre ADD fecha_envio DATETIME2 NULL")
        elif db == "postgresql":
            schema_editor.execute("ALTER TABLE notificacion_padre ADD fecha_envio TIMESTAMP WITH TIME ZONE NULL")
        else:
            schema_editor.execute("ALTER TABLE notificacion_padre ADD fecha_envio DATETIME NULL")
    if "intentos" not in alumno_columns:
        schema_editor.execute("ALTER TABLE notificacion_padre ADD intentos INTEGER NOT NULL DEFAULT 0")
    if "detalle_error" not in alumno_columns:
        schema_editor.execute("ALTER TABLE notificacion_padre ADD detalle_error VARCHAR(255) NULL")

    preference_flags = [
        "notificar_entrada",
        "notificar_salida",
        "notificar_tardanza",
        "notificar_ausencia",
    ]
    for field_name in preference_flags:
        if field_name not in preferencias_columns:
            if db == "mssql":
                schema_editor.execute(f"ALTER TABLE preferencias_padre ADD {field_name} BIT NOT NULL DEFAULT 1")
            else:
                schema_editor.execute(f"ALTER TABLE preferencias_padre ADD {field_name} BOOLEAN NOT NULL DEFAULT TRUE")


def remove_fields(apps, schema_editor):
    if is_sql_server(schema_editor):
        schema_editor.execute(
            "IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_notificacion_padre_fk_alumno') "
            "ALTER TABLE notificacion_padre DROP CONSTRAINT FK_notificacion_padre_fk_alumno"
        )

    for field_name in [
        "detalle_error",
        "intentos",
        "fecha_envio",
        "fecha_evento",
        "tipo_evento",
        "asunto",
        "destinatario_email",
        "fk_alumno",
    ]:
        try:
            schema_editor.execute(f"ALTER TABLE notificacion_padre DROP COLUMN {field_name}")
        except Exception:
            pass

    for field_name in [
        "notificar_ausencia",
        "notificar_tardanza",
        "notificar_salida",
        "notificar_entrada",
    ]:
        try:
            schema_editor.execute(f"ALTER TABLE preferencias_padre DROP COLUMN {field_name}")
        except Exception:
            pass


class Migration(migrations.Migration):
    dependencies = [
        ("reports", "0005_add_alumno_email_photo"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_fields, remove_fields),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="notificacionpadre",
                    name="fk_alumno",
                    field=models.ForeignKey(blank=True, null=True, on_delete=models.deletion.CASCADE, to="reports.alumno", db_column="fk_alumno"),
                ),
                migrations.AddField(
                    model_name="notificacionpadre",
                    name="destinatario_email",
                    field=models.EmailField(blank=True, null=True, max_length=100),
                ),
                migrations.AddField(
                    model_name="notificacionpadre",
                    name="asunto",
                    field=models.CharField(blank=True, null=True, max_length=150),
                ),
                migrations.AddField(
                    model_name="notificacionpadre",
                    name="tipo_evento",
                    field=models.CharField(blank=True, null=True, max_length=30),
                ),
                migrations.AddField(
                    model_name="notificacionpadre",
                    name="fecha_evento",
                    field=models.DateField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name="notificacionpadre",
                    name="fecha_envio",
                    field=models.DateTimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name="notificacionpadre",
                    name="intentos",
                    field=models.IntegerField(default=0),
                ),
                migrations.AddField(
                    model_name="notificacionpadre",
                    name="detalle_error",
                    field=models.CharField(blank=True, null=True, max_length=255),
                ),
                migrations.AddField(
                    model_name="preferenciaspadre",
                    name="notificar_entrada",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="preferenciaspadre",
                    name="notificar_salida",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="preferenciaspadre",
                    name="notificar_tardanza",
                    field=models.BooleanField(default=True),
                ),
                migrations.AddField(
                    model_name="preferenciaspadre",
                    name="notificar_ausencia",
                    field=models.BooleanField(default=True),
                ),
            ],
        ),
    ]
