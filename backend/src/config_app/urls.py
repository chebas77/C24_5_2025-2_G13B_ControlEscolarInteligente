from django.urls import path

from .views import SystemPolicyView

urlpatterns = [
    path("policies/", SystemPolicyView.as_view(), name="system-policies"),
]
