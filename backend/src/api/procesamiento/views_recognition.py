import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.apps import apps
from datetime import datetime

@api_view(["POST"])
def reconocer_alumno(request):
    embedding = request.data.get("embedding")
    device_id = request.data.get("device_id", "DESCONOCIDO")

    if not embedding:
        return Response({"error": "Falta el vector facial"}, status=400)

    app = apps.get_app_config("api.procesamiento")
    base = app.students_embeddings
    query_vec = np.array(embedding).reshape(1, -1)

    best_match, best_score = None, -1
    for alumno in base:
        db_vec = np.array(alumno["embedding"]).reshape(1, -1)
        sim = cosine_similarity(query_vec, db_vec)[0][0]
        if sim > best_score:
            best_match, best_score = alumno, sim

    if best_score > 0.7:
        return Response({
            "match": True,
            "confidence": float(best_score),
            "alumno": {
                "id": best_match["pk_alumno"],
                "nombre": best_match["nombre"],
                "codigo": best_match["codigo_alumno"]
            },
            "timestamp": datetime.now().isoformat()
        })
    else:
        return Response({
            "match": False,
            "confidence": float(best_score),
            "mensaje": "No se detectó coincidencia"
        })
