from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Padre, Alumno

class PadreLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        dni_hijo = request.data.get('dni_hijo')
        # Busca padre y su hijo por email y dni del hijo
        padre = Padre.objects.filter(email=email).first()
        if not padre:
            return Response({"error": "Padre no encontrado"}, status=status.HTTP_401_UNAUTHORIZED)
        alumno = Alumno.objects.filter(fk_codigo_familia=padre.fk_codigo_familia, dni=dni_hijo).first()
        if not alumno:
            return Response({"error": "DNI de hijo inválido"}, status=status.HTTP_401_UNAUTHORIZED)
        # Si existe, genera JWT
        refresh = RefreshToken.for_user(padre)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "padre_id": padre.id,
            "alumno_id": alumno.id,
            "email": padre.email
        })