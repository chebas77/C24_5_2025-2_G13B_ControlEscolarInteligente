import json
import os
from django.http import JsonResponse
from django.conf import settings

DATA_PATH = os.path.join(settings.BASE_DIR, "api", "data")

def load_json(filename):
    with open(os.path.join(DATA_PATH, filename), "r", encoding="utf-8") as f:
        return json.load(f)

def get_students(request):
    data = load_json("students.json")
    return JsonResponse(data, safe=False)

def get_devices(request):
    data = load_json("devices.json")
    return JsonResponse(data, safe=False)

def get_policies(request):
    data = load_json("policies.json")
    return JsonResponse(data, safe=False)

def get_reports(request):
    data = load_json("reports.json")
    return JsonResponse(data, safe=False)

def get_captures(request):
    data = load_json("capture_records.json")
    return JsonResponse(data, safe=False)
