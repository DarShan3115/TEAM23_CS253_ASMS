import os
import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser


JWT_SECRET = os.environ.get('JWT_SECRET', '')


class JWTUser:
    """Minimal user-like object populated from JWT claims."""
    def __init__(self, payload):
        # auth-service signs tokens with 'id' (not 'userId')
        self.id = payload.get('id') or payload.get('userId')
        self.role = payload.get('role', 'student')
        self.email = payload.get('email', '')
        self.is_authenticated = True  # Required by DRF permission checks

    def __str__(self):
        return f"JWTUser(id={self.id}, role={self.role})"


class JWTAuthentication(BaseAuthentication):
    """
    Validates the JWT access token issued by auth-service.
    Attaches a JWTUser to request.user so views can read role/id without
    trusting raw x-user-id headers.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return None  # Let DRF fall through to permission check

        token = auth_header.split(' ', 1)[1].strip()

        if not JWT_SECRET:
            raise AuthenticationFailed('Server configuration error: JWT_SECRET not set.')

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Access token has expired.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid access token.')

        user = JWTUser(payload)
        return (user, token)
