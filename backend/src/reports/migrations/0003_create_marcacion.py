from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0002_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                    CREATE TABLE IF NOT EXISTS marcacion (
                        pk_marcacion SERIAL PRIMARY KEY,
                        dni VARCHAR(12) NOT NULL,
                        hora_marcacion TIMESTAMP WITH TIME ZONE NOT NULL,
                        tipo_marcacion VARCHAR(30) NOT NULL
                    );
                    """,
                    reverse_sql="""
                    DROP TABLE IF EXISTS marcacion;
                    """,
                ),
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
