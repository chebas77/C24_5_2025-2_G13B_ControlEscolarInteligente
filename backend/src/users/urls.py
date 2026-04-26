from django.urls import path
from .views import GoogleRegisterView

urlpatterns = [
    path('google/register/', GoogleRegisterView.as_view(), name='google-register'),
]
