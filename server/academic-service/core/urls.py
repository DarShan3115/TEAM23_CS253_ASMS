from django.urls import path
from .views import MyScheduleView, CourseListView, FacultyLoadView

urlpatterns = [
    # Existing student endpoints
    path('courses/my-schedule/', MyScheduleView.as_view(), name='my-schedule'),
    path('courses/', CourseListView.as_view(), name='course-list'),
    
    # New faculty endpoint
    path('courses/faculty-load/', FacultyLoadView.as_view(), name='faculty-load'),
]