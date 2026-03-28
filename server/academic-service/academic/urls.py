from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Prefixing all core app routes with /api/
    path('api/', include('core.urls')),
]