from django.urls import path
from . import views_data

urlpatterns = [
    path("students/", views_data.get_students, name="students"),
    path("devices/", views_data.get_devices, name="devices"),
    path("policies/", views_data.get_policies, name="policies"),
    path("reports/", views_data.get_reports, name="reports"),
    path("captures/", views_data.get_captures, name="captures"),
]
