from django.db import models

class LogProcesamiento(models.Model):
    tipo = models.CharField(max_length=50)
    mensaje = models.TextField()
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.tipo}] {self.fecha.strftime('%H:%M:%S')}"
