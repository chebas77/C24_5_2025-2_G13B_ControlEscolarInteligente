from django.urls import path
from .views import (
    AdminEnrollmentStudentsView,
    AdminEnrollmentTemplateView,
    AdminFaceMatchView,
    AdminAttendanceDashboardView,
    AdminTodayCaptureRecordsView,
    PadreLoginView, 
    PadreAlumnosView,
    ProfesorPanelView,
    AlumnoCalificacionesView,
    AlumnoComportamientoView,
    AlumnoComunicadosView,
    ExportarAsistenciaView,
    ExportarProfesorAsistenciaView,
    PadrePreferenciasView
)

urlpatterns = [
    path('admin/enrollment/students/', AdminEnrollmentStudentsView.as_view(), name='admin-enrollment-students'),
    path('admin/enrollment/students/<int:alumno_id>/template/', AdminEnrollmentTemplateView.as_view(), name='admin-enrollment-template'),
    path('admin/attendance/dashboard/', AdminAttendanceDashboardView.as_view(), name='admin-attendance-dashboard'),
    path('admin/capture/match/', AdminFaceMatchView.as_view(), name='admin-capture-match'),
    path('admin/capture/today/', AdminTodayCaptureRecordsView.as_view(), name='admin-capture-today'),
    path('padres/login/', PadreLoginView.as_view(), name='padre-login'),
    path('padres/<str:email>/alumnos/', PadreAlumnosView.as_view(), name='padre-alumnos'),
    path('padres/<str:email>/preferencias/', PadrePreferenciasView.as_view(), name='padre-preferencias'),
    path('profesores/<str:email>/panel/', ProfesorPanelView.as_view(), name='profesor-panel'),
    path('profesores/<str:email>/exportar-asistencia/', ExportarProfesorAsistenciaView.as_view(), name='profesor-exportar-asistencia'),
    path('alumnos/<int:alumno_id>/calificaciones/', AlumnoCalificacionesView.as_view(), name='alumno-calificaciones'),
    path('alumnos/<int:alumno_id>/comportamiento/', AlumnoComportamientoView.as_view(), name='alumno-comportamiento'),
    path('alumnos/<int:alumno_id>/comunicados/', AlumnoComunicadosView.as_view(), name='alumno-comunicados'),
    path('alumnos/<int:alumno_id>/exportar-asistencia/', ExportarAsistenciaView.as_view(), name='exportar-asistencia'),
]
