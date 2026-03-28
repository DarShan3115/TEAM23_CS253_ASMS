from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Enrollment, Course
from .serializers import ScheduleSerializer, CourseSerializer

class MyScheduleView(APIView):
    """
    Returns the courses a student is currently enrolled in.
    """
    def get(self, request):
        # Note: In the future, we'll extract the user ID from the JWT.
        # For now, we return all active enrollments for testing.
        enrollments = Enrollment.objects.filter(status='enrolled')[:5]
        serializer = ScheduleSerializer(enrollments, many=True)
        return Response(serializer.data)

class CourseListView(APIView):
    """
    Returns a list of all active courses available in the system.
    """
    def get(self, request):
        courses = Course.objects.filter(is_active=True)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

class FacultyLoadView(APIView):
    """
    Returns the list of courses assigned to the logged-in instructor.
    Expected Header: x-user-id (containing the Faculty's UUID)
    """
    def get(self, request):
        # In our current setup, we pass the user ID in the header from the frontend
        instructor_id = request.headers.get('x-user-id')
        
        if not instructor_id:
            return Response(
                {"error": "Instructor ID header missing"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Filter courses where the instructor matches the ID provided
        courses = Course.objects.filter(instructor_id=instructor_id, is_active=True)
        serializer = FacultyCourseSerializer(courses, many=True)
        
        return Response(serializer.data)
    
class UpdateFinalGradeView(APIView):
    """
    Endpoint for Faculty to set official letter grades in the academic record.
    PUT /api/enrollments/grade/
    """
    def put(self, request):
        student_id = request.data.get('student_id')
        course_id = request.data.get('course_id')
        grade = request.data.get('grade') # e.g., 'A', 'B+'

        if not all([student_id, course_id, grade]):
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            enrollment = Enrollment.objects.get(student_id=student_id, course_id=course_id)
            enrollment.grade = grade
            enrollment.save()
            return Response({"message": "Official academic grade updated successfully"})
        except Enrollment.DoesNotExist:
            return Response({"error": "Enrollment record not found"}, status=status.HTTP_404_NOT_FOUND)

class MarkAttendanceView(APIView):
    """
    POST /api/attendance/mark/
    Body: { "course_id": "...", "students": [{"id": "...", "status": "Present"}] }
    """
    def post(self, request):
        course_id = request.data.get('course_id')
        attendance_data = request.data.get('students', [])

        if not course_id or not attendance_data:
            return Response({"error": "Course ID and Student data required"}, status=status.HTTP_400_BAD_REQUEST)

        logs = []
        for entry in attendance_data:
            # In a real system, you'd save this to an AttendanceLog table
            # For this MVP, we acknowledge the receipt of data
            logs.append({
                "student_id": entry['id'],
                "course_id": course_id,
                "status": entry['status']
            })
            
        return Response({"message": f"Attendance marked for {len(logs)} students"}, status=status.HTTP_201_CREATED)