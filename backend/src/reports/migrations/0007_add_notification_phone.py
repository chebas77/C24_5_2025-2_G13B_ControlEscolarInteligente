from django.db import migrations, models


def add_phone_field(apps, schema_editor):
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        notification_columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, "notificacion_padre")
        }

    if "destinatario_telefono" not in notification_columns:
        schema_editor.execute("ALTER TABLE notificacion_padre ADD destinatario_telefono VARCHAR(20) NULL")


def remove_phone_field(apps, schema_editor):
    try:
        schema_editor.execute("ALTER TABLE notificacion_padre DROP COLUMN destinatario_telefono")
    except Exception:
        pass


class Migration(migrations.Migration):
    dependencies = [
        ("reports", "0006_notifications_email_fields"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_phone_field, remove_phone_field),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="notificacionpadre",
                    name="destinatario_telefono",
                    field=models.CharField(blank=True, null=True, max_length=20),
                ),
            ],
        ),
    ]
