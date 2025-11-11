import os
import json
import numpy as np
from deepface import DeepFace
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def generar_embedding(request):
    """
    Genera el embedding facial a partir de una imagen enviada
    y lo almacena en students_embeddings.json
    """
    image_file = request.FILES.get("imagen")
    alumno_id = request.data.get("alumno_id")
    nombre = request.data.get("nombre")

    if not image_file:
        return Response({"error": "Debe enviar una imagen."}, status=400)

    try:
        # Guardar imagen temporalmente
        temp_path = os.path.join(os.path.dirname(__file__), "temp_image.jpg")
        with open(temp_path, "wb+") as temp_file:
            for chunk in image_file.chunks():
                temp_file.write(chunk)

        # Generar embedding (usa Facenet para compatibilidad TF 2.20+)
        result = DeepFace.represent(
            img_path=temp_path,
            model_name="Facenet",
            enforce_detection=False
        )

        # Limpiar imagen temporal
        os.remove(temp_path)

        embedding = np.array(result[0]["embedding"]).tolist()
        facial_area = result[0].get("facial_area", {})

        # Cargar JSON existente
        base_dir = os.path.dirname(__file__)
        json_path = os.path.join(base_dir, "students_embeddings.json")

        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = {"students": []}

        nuevo_alumno = {
            "pk_alumno": len(data["students"]) + 1,
            "codigo_alumno": alumno_id or f"ALUMNO_{len(data['students'])+1}",
            "nombre": nombre or "Desconocido",
            "embedding": embedding,
            "facial_area": facial_area
        }

        data["students"].append(nuevo_alumno)

        # Guardar JSON actualizado
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        return Response({
            "message": "✅ Embedding generado correctamente",
            "alumno": nuevo_alumno
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)
