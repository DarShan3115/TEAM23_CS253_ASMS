from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Prefixing all core app routes to match frontend expectations
    path('api/academic/', include('core.urls')),
]