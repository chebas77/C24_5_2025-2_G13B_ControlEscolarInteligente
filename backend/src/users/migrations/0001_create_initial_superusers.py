from django.contrib.auth.hashers import make_password
from django.db import migrations


def create_initial_superusers(apps, schema_editor):
    User = apps.get_model("auth", "User")
    users = [
        {
            "username": "msrj743",
            "email": "msrj743@gmail.com",
            "password": "010905",
        },
        {
            "username": "admin",
            "email": "admin@feyalegria39.org.pe",
            "password": "admin39",
        },
    ]

    for data in users:
        user, _ = User.objects.get_or_create(
            username=data["username"],
            defaults={"email": data["email"]},
        )
        user.email = data["email"]
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.password = make_password(data["password"])
        user.save()


def remove_initial_superusers(apps, schema_editor):
    User = apps.get_model("auth", "User")
    User.objects.filter(username__in=["msrj743", "admin"]).delete()


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RunPython(create_initial_superusers, remove_initial_superusers),
    ]
