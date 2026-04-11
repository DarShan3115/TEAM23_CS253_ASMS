from django.urls import path
from .views import (
    MyScheduleView, CourseListView, FacultyLoadView, CourseEnrollView,
    CourseDetailView, CourseStudentsView,
    CourseAnnouncementsView, CourseResourcesView, ResourceDeleteView,
    CourseAssignmentsView, MarkAttendanceView, UpdateFinalGradeView
)

urlpatterns = [
    # Student
    path('courses/my-schedule/', MyScheduleView.as_view(), name='my-schedule'),
    path('courses/enroll/', CourseEnrollView.as_view(), name='enroll'),
    path('courses/', CourseListView.as_view(), name='course-list'),

    # Faculty
    path('courses/faculty-load/', FacultyLoadView.as_view(), name='faculty-load'),
    path('courses/<str:course_id>/', CourseDetailView.as_view(), name='course-detail'),
    path('courses/<str:course_id>/students/', CourseStudentsView.as_view(), name='course-students'),
    path('courses/<str:course_id>/announcements/', CourseAnnouncementsView.as_view(), name='course-announcements'),
    path('courses/<str:course_id>/resources/', CourseResourcesView.as_view(), name='course-resources'),
    path('courses/<str:course_id>/assignments/', CourseAssignmentsView.as_view(), name='course-assignments'),
    path('resources/<str:resource_id>/', ResourceDeleteView.as_view(), name='resource-delete'),
    path('attendance/mark/', MarkAttendanceView.as_view(), name='mark-attendance'),
    path('enrollments/grade/', UpdateFinalGradeView.as_view(), name='update-grade'),
]