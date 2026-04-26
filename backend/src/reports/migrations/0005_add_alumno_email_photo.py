from django.db import migrations


def add_alumno_email_and_photo(apps, schema_editor):
    connection = schema_editor.connection
    vendor = connection.vendor
    engine = (connection.settings_dict.get("ENGINE") or "").lower()
    is_sql_server = "mssql" in engine or "sql_server" in engine or vendor in {"mssql", "microsoft"}
    table_name = 'alumno'

    with connection.cursor() as cursor:
        columns = {
            column.name for column in connection.introspection.get_table_description(cursor, table_name)
        }
        constraints = connection.introspection.get_constraints(cursor, table_name)

    if 'email' not in columns:
        if is_sql_server:
            schema_editor.execute("ALTER TABLE alumno ADD email VARCHAR(100)")
        else:
            schema_editor.execute("ALTER TABLE alumno ADD COLUMN email VARCHAR(100)")

    if 'foto_perfil' not in columns:
        if is_sql_server:
            schema_editor.execute("ALTER TABLE alumno ADD foto_perfil VARCHAR(500)")
        else:
            schema_editor.execute("ALTER TABLE alumno ADD COLUMN foto_perfil VARCHAR(500)")

    if 'alumno_email_unique_idx' in constraints:
        return

    if connection.vendor == 'postgresql':
        schema_editor.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS alumno_email_unique_idx ON alumno(email)"
        )
    elif connection.vendor == 'mysql':
        schema_editor.execute(
            "CREATE UNIQUE INDEX alumno_email_unique_idx ON alumno(email)"
        )
    elif is_sql_server:
        schema_editor.execute(
            "CREATE UNIQUE INDEX alumno_email_unique_idx ON alumno(email) WHERE email IS NOT NULL"
        )
    else:
        schema_editor.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS alumno_email_unique_idx ON alumno(email)"
        )


def remove_alumno_email_index(apps, schema_editor):
    connection = schema_editor.connection
    vendor = connection.vendor
    engine = (connection.settings_dict.get("ENGINE") or "").lower()
    is_sql_server = "mssql" in engine or "sql_server" in engine or vendor in {"mssql", "microsoft"}

    if vendor == 'mysql':
        schema_editor.execute("DROP INDEX alumno_email_unique_idx ON alumno")
    elif is_sql_server:
        schema_editor.execute(
            "IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'alumno_email_unique_idx' AND object_id = OBJECT_ID('alumno')) "
            "DROP INDEX alumno_email_unique_idx ON alumno"
        )
    else:
        schema_editor.execute("DROP INDEX IF EXISTS alumno_email_unique_idx")


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0004_fix_sqlite_primary_keys'),
    ]

    operations = [
        migrations.RunPython(add_alumno_email_and_photo, remove_alumno_email_index),
    ]
