from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SystemPolicy


def _as_bool(value, default=False):
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in {"1", "true", "t", "yes", "y", "on", "si", "sí"}
    return bool(value)


class SystemPolicyView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        policy = SystemPolicy.load()
        return Response(policy.as_dict())

    def put(self, request):
        policy = SystemPolicy.load()
        threshold = request.data.get("face_match_threshold", request.data.get("threshold", policy.face_match_threshold))
        retention_days = request.data.get("retention_days", policy.retention_days)
        require_liveness = request.data.get("require_liveness", policy.require_liveness)

        try:
            policy.face_match_threshold = max(0.0, min(100.0, float(threshold)))
        except (TypeError, ValueError):
            policy.face_match_threshold = 75.0

        try:
            policy.retention_days = max(1, int(retention_days))
        except (TypeError, ValueError):
            policy.retention_days = 90

        policy.require_liveness = _as_bool(require_liveness, policy.require_liveness)
        policy.save()

        return Response(policy.as_dict())
