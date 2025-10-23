from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def test_attendance(request):
    return Response({"message": "Backend Django funcionando correctamente ✅"})
