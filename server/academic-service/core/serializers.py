from rest_framework import serializers
from .models import Course, Enrollment, User

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'code', 'title', 'instructor_name', 'semester', 'credits']

    def get_instructor_name(self, obj):
        if obj.instructor:
            return f"{obj.instructor.first_name} {obj.instructor.last_name}"
        return "Staff"

class ScheduleSerializer(serializers.ModelSerializer):
    """
    Custom serializer to format data for the 'Today's Classes' 
    section on the React Dashboard.
    """
    id = serializers.ReadOnlyField(source='course.id') # Maps to the actual Course UUID
    code = serializers.ReadOnlyField(source='course.code')
    credits = serializers.ReadOnlyField(source='course.credits')
    semester = serializers.ReadOnlyField(source='course.semester')
    title = serializers.ReadOnlyField(source='course.title')
    instructor = serializers.SerializerMethodField()
    room = serializers.CharField(default="TBD") 
    time = serializers.CharField(default="09:00 AM - 10:30 AM")

    class Meta:
        model = Enrollment
        fields = ['id', 'code', 'title', 'instructor', 'room', 'time', 'credits', 'semester']

    def get_instructor(self, obj):
        instr = obj.course.instructor
        return f"{instr.first_name} {instr.last_name}" if instr else "Staff"
    
class FacultyCourseSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for the Faculty Dashboard.
    Includes enrollment counts and placeholders for analytics.
    """
    students_count = serializers.SerializerMethodField()
    avg_attendance = serializers.IntegerField(default=85)  # Placeholder for Analytics Service link
    avg_grade      = serializers.CharField(default='B+')   # Placeholder for Analytics Service link
    enrollment_key = serializers.CharField(read_only=True)

    class Meta:
        model = Course
        fields = [
            'id', 'code', 'title', 'credits', 'semester',
            'students_count', 'avg_attendance', 'avg_grade', 'enrollment_key'
        ]

    def get_students_count(self, obj):
        # Count only active enrollments for this specific course
        return Enrollment.objects.filter(course=obj, status='enrolled').count()