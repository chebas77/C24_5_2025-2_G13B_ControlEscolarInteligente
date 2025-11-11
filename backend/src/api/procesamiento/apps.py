import os
import json
from django.apps import AppConfig


class ProcesamientoConfig(AppConfig):
    """
    Configuración de la app de procesamiento facial.
    Carga los embeddings de los alumnos desde el JSON al iniciar el servidor.
    """
    default_auto_field = "django.db.models.BigAutoField"
    name = "api.procesamiento"
    students_embeddings = []  # Memoria temporal para embeddings cargados

    def ready(self):
        """
        Se ejecuta automáticamente cuando Django levanta la app.
        Carga el archivo students_embeddings.json en memoria.
        """
        base_dir = os.path.dirname(__file__)
        path = os.path.join(base_dir, "students_embeddings.json")

        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.students_embeddings = data.get("students", [])
                    print(f"✅ {len(self.students_embeddings)} embeddings cargados correctamente desde {path}")
            except Exception as e:
                print(f"⚠️ Error al cargar embeddings: {e}")
        else:
            print(f"⚠️ No se encontró el archivo {path}")
