import os
import json
from deepface import DeepFace

# Ruta absoluta del archivo actual
BASE_DIR = os.path.dirname(__file__)
JSON_PATH = os.path.join(BASE_DIR, "students_embeddings.json")

# Imagen de ejemplo
IMAGE_PATH = os.path.join(BASE_DIR, "test.jpg")  # puedes cambiarla luego

# Crear estructura inicial si no existe
if not os.path.exists(JSON_PATH):
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump({"students": []}, f, indent=2)

try:
    print("🔍 Procesando imagen:", IMAGE_PATH)

    # Procesar imagen y generar embedding
    result = DeepFace.represent(img_path=IMAGE_PATH, model_name="Facenet", enforce_detection=False)

    embedding = result[0]["embedding"]
    facial_area = result[0]["facial_area"]

    # Cargar datos existentes
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    nuevo_registro = {
        "pk_alumno": len(data["students"]) + 1,
        "codigo_alumno": f"TEST-{len(data['students']) + 1}",
        "nombre": f"Alumno Test {len(data['students']) + 1}",
        "embedding": embedding,
        "facial_area": facial_area
    }

    # Agregar y guardar
    data["students"].append(nuevo_registro)
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print("✅ Embedding generado y guardado correctamente.")
    print("📄 Total de registros:", len(data["students"]))

except Exception as e:
    print("❌ Error durante el procesamiento:", str(e))
