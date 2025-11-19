from django.urls import path
from .views import (
    PadreLoginView, 
    PadreAlumnosView,
    AlumnoCalificacionesView,
    AlumnoComportamientoView,
    AlumnoComunicadosView,
    ExportarAsistenciaView,
    PadrePreferenciasView
)

urlpatterns = [
    path('padres/login/', PadreLoginView.as_view(), name='padre-login'),
    path('padres/<str:email>/alumnos/', PadreAlumnosView.as_view(), name='padre-alumnos'),
    path('padres/<str:email>/preferencias/', PadrePreferenciasView.as_view(), name='padre-preferencias'),
    path('alumnos/<int:alumno_id>/calificaciones/', AlumnoCalificacionesView.as_view(), name='alumno-calificaciones'),
    path('alumnos/<int:alumno_id>/comportamiento/', AlumnoComportamientoView.as_view(), name='alumno-comportamiento'),
    path('alumnos/<int:alumno_id>/comunicados/', AlumnoComunicadosView.as_view(), name='alumno-comunicados'),
    path('alumnos/<int:alumno_id>/exportar-asistencia/', ExportarAsistenciaView.as_view(), name='exportar-asistencia'),
]