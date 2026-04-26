from django.urls import path
from .views import (
    MyScheduleView, CourseListView, FacultyLoadView, CourseEnrollView,
    CourseDetailView, CourseStudentsView,
    CourseAnnouncementsView, CourseResourcesView, ResourceDeleteView,
    CourseAssignmentsView, AssignmentDetailView, StudentSubmissionStatusView,
    MarkAttendanceView, UpdateFinalGradeView, MarkAttendanceCSVView, BiometricAttendanceView,
    AssignmentSubmitView, CourseAdminView, CourseExamsView,
    CourseEnrollByCodeView, MyTimetableView, CourseScheduleManageView, CourseInviteView,
    BulkUpdateFinalGradeView, StudentGradesheetView
)

urlpatterns = [
    # Admin
    path('admin/courses/', CourseAdminView.as_view(), name='admin-courses'),
    path('students/<str:student_id>/gradesheet/', StudentGradesheetView.as_view(), name='student-gradesheet'),

    # Student
    path('courses/my-schedule/', MyScheduleView.as_view(), name='my-schedule'),
    path('courses/enroll/', CourseEnrollView.as_view(), name='enroll'),
    path('courses/enroll-by-code/', CourseEnrollByCodeView.as_view(), name='enroll-by-code'),
    path('courses/', CourseListView.as_view(), name='course-list'),

    # Faculty & Common
    path('courses/faculty-load/', FacultyLoadView.as_view(), name='faculty-load'),
    path('courses/<str:course_id>/', CourseDetailView.as_view(), name='course-detail'),
    path('courses/<str:course_id>/students/', CourseStudentsView.as_view(), name='course-students'),
    path('courses/<str:course_id>/announcements/', CourseAnnouncementsView.as_view(), name='course-announcements'),
    path('courses/<str:course_id>/resources/', CourseResourcesView.as_view(), name='course-resources'),
    path('courses/<str:course_id>/assignments/', CourseAssignmentsView.as_view(), name='course-assignments'),
    path('courses/<str:course_id>/assignments/<str:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    path('courses/<str:course_id>/assignments/<str:assignment_id>/submit/', AssignmentSubmitView.as_view(), name='assignment-submit'),
    path('courses/<str:course_id>/assignments/<str:assignment_id>/my-submission/', StudentSubmissionStatusView.as_view(), name='my-submission'),
    path('courses/<str:course_id>/exams/', CourseExamsView.as_view(), name='course-exams'),
    path('courses/<str:course_id>/invite/', CourseInviteView.as_view(), name='course-invite'),
    path('resources/<str:resource_id>/', ResourceDeleteView.as_view(), name='resource-delete'),
    path('attendance/mark/', MarkAttendanceView.as_view(), name='mark-attendance'),
    path('attendance/mark/csv/', MarkAttendanceCSVView.as_view(), name='mark-attendance-csv'),
    path('attendance/mark/biometric/', BiometricAttendanceView.as_view(), name='mark-attendance-biometric'),
    path('enrollments/grade/', UpdateFinalGradeView.as_view(), name='update-grade'),
    path('courses/<str:course_id>/grades/csv/', BulkUpdateFinalGradeView.as_view(), name='bulk-update-grade'),
    path('timetable/', MyTimetableView.as_view(), name='my-timetable'),
    path('courses/<str:course_id>/schedule/', CourseScheduleManageView.as_view(), name='course-schedule-manage'),
]