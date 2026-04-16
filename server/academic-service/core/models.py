import uuid
import random
import string
from django.db import models

def generate_random_enrollment_key():
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(16))

class User(models.Model):
    """
    Reference to the 'users' table managed by the Node.js auth-service.
    We use 'managed = False' so Django doesn't try to create this table.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'users'

class Department(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=10, unique=True)
    head = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column='head_id')

    class Meta:
        managed = False
        db_table = 'departments'

class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True)
    credits = models.IntegerField(default=3)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, db_column='department_id')
    instructor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column='instructor_id')
    semester = models.CharField(max_length=20)
    max_enrollment = models.IntegerField(default=60)
    is_active = models.BooleanField(default=True)
    enrollment_key = models.CharField(max_length=50, default=generate_random_enrollment_key)

    class Meta:
        managed = False
        db_table = 'courses'

class Enrollment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, db_column='student_id')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='course_id')
    status = models.CharField(max_length=20, default='enrolled')
    grade = models.CharField(max_length=5, null=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'enrollments'
        unique_together = (('student', 'course'),)

class CourseSchedule(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='course_id')
    day_of_week = models.CharField(max_length=15)
    start_time = models.TimeField()
    end_time = models.TimeField()
    class_type = models.CharField(max_length=20, default='Lec')

    class Meta:
        managed = False
        db_table = 'course_schedules'