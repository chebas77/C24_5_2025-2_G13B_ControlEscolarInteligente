from django.urls import path
from .views import test_attendance

urlpatterns = [
    path('test/', test_attendance),
]
