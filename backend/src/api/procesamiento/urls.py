from django.urls import path
from .views_embeddings import generar_embedding
from .views_recognition import reconocer_alumno

urlpatterns = [
    path("generar_embedding/", generar_embedding, name="generar_embedding"),
    path("reconocer/", reconocer_alumno, name="reconocer_alumno"),
]
