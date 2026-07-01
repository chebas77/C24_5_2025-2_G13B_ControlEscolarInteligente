from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="SystemPolicy",
            fields=[
                ("pk_policy", models.AutoField(db_column="pk_policy", primary_key=True, serialize=False)),
                ("face_match_threshold", models.FloatField(default=75.0)),
                ("require_liveness", models.BooleanField(default=True)),
                ("retention_days", models.PositiveIntegerField(default=90)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "system_policy",
            },
        ),
    ]
