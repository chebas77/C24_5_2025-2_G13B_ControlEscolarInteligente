from django.db import migrations, models


def is_sql_server(schema_editor):
    engine = (schema_editor.connection.settings_dict.get("ENGINE") or "").lower()
    vendor = (schema_editor.connection.vendor or "").lower()
    return "mssql" in engine or "sql_server" in engine or vendor in {"mssql", "microsoft"}


def create_marcacion_table(apps, schema_editor):
    vendor = schema_editor.connection.vendor

    if vendor == "postgresql":
        pk_sql = "SERIAL PRIMARY KEY"
        datetime_sql = "TIMESTAMP WITH TIME ZONE"
    elif vendor == "mysql":
        pk_sql = "INTEGER PRIMARY KEY AUTO_INCREMENT"
        datetime_sql = "DATETIME(6)"
    elif is_sql_server(schema_editor):
        pk_sql = "INT IDENTITY(1,1) PRIMARY KEY"
        datetime_sql = "DATETIME2"
    else:
        pk_sql = "INTEGER PRIMARY KEY AUTOINCREMENT"
        datetime_sql = "DATETIME"

    with schema_editor.connection.cursor() as cursor:
        existing_tables = schema_editor.connection.introspection.table_names(cursor)
    if "marcacion" in existing_tables:
        return

    schema_editor.execute(f"""
        CREATE TABLE marcacion (
            pk_marcacion {pk_sql},
            dni VARCHAR(12) NOT NULL,
            hora_marcacion {datetime_sql} NOT NULL,
            tipo_marcacion VARCHAR(30) NOT NULL
        )
    """)


def drop_marcacion_table(apps, schema_editor):
    if is_sql_server(schema_editor):
        schema_editor.execute("IF OBJECT_ID('marcacion', 'U') IS NOT NULL DROP TABLE marcacion")
    else:
        schema_editor.execute("DROP TABLE IF EXISTS marcacion")


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0002_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(create_marcacion_table, drop_marcacion_table),
            ],
            state_operations=[
                migrations.CreateModel(
                    name='Marcacion',
                    fields=[
                        ('pk_marcacion', models.AutoField(db_column='pk_marcacion', primary_key=True, serialize=False)),
                        ('dni', models.CharField(max_length=12)),
                        ('hora_marcacion', models.DateTimeField()),
                        ('tipo_marcacion', models.CharField(max_length=30)),
                    ],
                    options={
                        'db_table': 'marcacion',
                        'managed': False,
                    },
                ),
            ],
        ),
    ]
