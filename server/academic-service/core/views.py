from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    return Response({'status': 'ok', 'service': 'academic-service'})

@api_view(['GET'])
def courses_list(request):
    return Response({'courses': [], 'message': 'Connect your models here'})
