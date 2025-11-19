from django.db import models

class CodigoFamilia(models.Model):
    pk_codigo_familia = models.AutoField(primary_key=True, db_column='pk_codigo_familia')
    codigo = models.CharField(max_length=20, unique=True)
    direccion = models.CharField(max_length=100, null=True, blank=True)
    estado = models.CharField(max_length=20, null=True, blank=True)
    
    class Meta:
        db_table = 'codigo_familia'
        managed = False

class Rol(models.Model):
    pk_rol = models.AutoField(primary_key=True, db_column='pk_rol')
    nombre_rol = models.CharField(max_length=50)
    descripcion = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
        db_table = 'rol'
        managed = False

class Padre(models.Model):
    pk_padre = models.AutoField(primary_key=True, db_column='pk_padre')
    nombre = models.CharField(max_length=50)
    apellido_paterno = models.CharField(max_length=50)
    apellido_materno = models.CharField(max_length=50)
    dni = models.CharField(max_length=12)
    email = models.EmailField(max_length=100, unique=True, null=True, blank=True)
    celular = models.CharField(max_length=20, null=True, blank=True)
    fk_codigo_familia = models.ForeignKey(CodigoFamilia, on_delete=models.CASCADE, db_column='fk_codigo_familia', null=True, blank=True)
    
    class Meta:
        db_table = 'padre'
        managed = False

class Autorizacion(models.Model):
    pk_autorizacion = models.AutoField(primary_key=True, db_column='pk_autorizacion')
    fk_codigo_familia = models.ForeignKey(CodigoFamilia, on_delete=models.CASCADE, db_column='fk_codigo_familia', null=True, blank=True)
    estado_autorizacion = models.CharField(max_length=20, null=True, blank=True)
    observacion = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
        db_table = 'autorizacion'
        managed = False

class Alumno(models.Model):
    pk_alumno = models.AutoField(primary_key=True, db_column='pk_alumno')
    codigo_alumno = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=50)
    apellido_paterno = models.CharField(max_length=50)
    apellido_materno = models.CharField(max_length=50)
    dni = models.CharField(max_length=12)
    grado = models.CharField(max_length=10, null=True, blank=True)
    seccion = models.CharField(max_length=5, null=True, blank=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=10, null=True, blank=True)
    fk_codigo_familia = models.ForeignKey(CodigoFamilia, on_delete=models.CASCADE, db_column='fk_codigo_familia', null=True, blank=True)
    fk_rol = models.ForeignKey(Rol, on_delete=models.CASCADE, db_column='fk_rol', null=True, blank=True)
    
    class Meta:
        db_table = 'alumno'
        managed = False

class AlumnoMetrics(models.Model):
    pk_alumno_metrics = models.AutoField(primary_key=True, db_column='pk_alumno_metrics')
    fk_alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE, db_column='fk_alumno', null=True, blank=True)
    embedding = models.JSONField(null=True, blank=True)
    facial_area = models.JSONField(null=True, blank=True)
    porcentaje_similitud = models.FloatField(null=True, blank=True)
    ultima_captura = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'alumno_metrics'
        managed = False

class PersonalEducativo(models.Model):
    pk_personal = models.AutoField(primary_key=True, db_column='pk_personal')
    nombre = models.CharField(max_length=50)
    apellido_paterno = models.CharField(max_length=50)
    apellido_materno = models.CharField(max_length=50)
    dni = models.CharField(max_length=12)
    email = models.EmailField(max_length=100, unique=True, null=True, blank=True)
    celular = models.CharField(max_length=20, null=True, blank=True)
    especialidad = models.CharField(max_length=50, null=True, blank=True)
    salon_asignado = models.CharField(max_length=10, null=True, blank=True)
    estado = models.CharField(max_length=20, null=True, blank=True)
    fk_rol = models.ForeignKey(Rol, on_delete=models.CASCADE, db_column='fk_rol', null=True, blank=True)
    
    class Meta:
        db_table = 'personal_educativo'
        managed = False

class Asistencia(models.Model):
    pk_asistencia = models.AutoField(primary_key=True, db_column='pk_asistencia')
    fk_personal = models.ForeignKey(PersonalEducativo, on_delete=models.CASCADE, db_column='fk_personal', null=True, blank=True)
    fecha = models.DateField(null=True, blank=True)
    curso = models.CharField(max_length=50, null=True, blank=True)
    aula = models.CharField(max_length=10, null=True, blank=True)
    hora_inicio = models.TimeField(null=True, blank=True)
    hora_fin = models.TimeField(null=True, blank=True)
    observacion = models.CharField(max_length=200, null=True, blank=True)
    estado = models.CharField(max_length=20, null=True, blank=True)
    
    class Meta:
        db_table = 'asistencia'
        managed = False

class AsistenciaDetalle(models.Model):
    pk_asistencia_detalle = models.AutoField(primary_key=True, db_column='pk_asistencia_detalle')
    fk_asistencia = models.ForeignKey(Asistencia, on_delete=models.CASCADE, db_column='fk_asistencia')
    fk_alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE, db_column='fk_alumno')
    porcentaje_similitud = models.FloatField(null=True, blank=True)
    hora_entrada = models.TimeField(null=True, blank=True)
    estado_asistencia = models.CharField(max_length=20, null=True, blank=True)
    imagen_capturada = models.CharField(max_length=200, null=True, blank=True)
    dispositivo = models.CharField(max_length=50, null=True, blank=True)
    observacion = models.CharField(max_length=200, null=True, blank=True)
    
    class Meta:
        db_table = 'asistencia_detalle'
        managed = False

class NotificacionPadre(models.Model):
    pk_notificacion = models.AutoField(primary_key=True, db_column='pk_notificacion')
    fk_asistencia = models.ForeignKey(Asistencia, on_delete=models.CASCADE, db_column='fk_asistencia', null=True, blank=True)
    fk_codigo_familia = models.ForeignKey(CodigoFamilia, on_delete=models.CASCADE, db_column='fk_codigo_familia', null=True, blank=True)
    mensaje = models.CharField(max_length=200, null=True, blank=True)
    estado_envio = models.CharField(max_length=20, null=True, blank=True)
    medio_envio = models.CharField(max_length=20, null=True, blank=True)
    
    class Meta:
        db_table = 'notificacion_padre'
        managed = False

class Comunicado(models.Model):
    pk_comunicado = models.AutoField(primary_key=True, db_column='pk_comunicado')
    titulo = models.CharField(max_length=100)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=20, default='info', null=True, blank=True)  # 'info', 'success', 'warning', 'urgent'
    fecha_publicacion = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    fecha_evento = models.DateField(null=True, blank=True)
    dirigido_a = models.CharField(max_length=50, null=True, blank=True)  # 'todos', 'grado_especifico', 'familia_especifica'
    grado = models.CharField(max_length=10, null=True, blank=True)
    fk_codigo_familia = models.ForeignKey(CodigoFamilia, on_delete=models.CASCADE, db_column='fk_codigo_familia', null=True, blank=True)
    fk_personal = models.ForeignKey(PersonalEducativo, on_delete=models.CASCADE, db_column='fk_personal', null=True, blank=True)
    estado = models.CharField(max_length=20, default='activo', null=True, blank=True)
    prioridad = models.IntegerField(default=1, null=True, blank=True)
    
    class Meta:
        db_table = 'comunicado'
        managed = False

class PreferenciasPadre(models.Model):
    pk_preferencia = models.AutoField(primary_key=True, db_column='pk_preferencia')
    fk_padre = models.OneToOneField(Padre, on_delete=models.CASCADE, db_column='fk_padre', related_name='preferencias')
    telefono = models.CharField(max_length=20, null=True, blank=True)
    direccion = models.CharField(max_length=200, null=True, blank=True)
    notificaciones_email = models.BooleanField(default=True)
    notificaciones_sms = models.BooleanField(default=False)
    notificar_asistencia = models.BooleanField(default=True)
    notificar_calificaciones = models.BooleanField(default=True)
    notificar_comportamiento = models.BooleanField(default=True)
    frecuencia_resumen = models.CharField(max_length=20, default='semanal')  # 'diario', 'semanal', 'mensual'
    
    class Meta:
        db_table = 'preferencias_padre'
        managed = False