from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from .models import Enrollment, Course, User
from .serializers import ScheduleSerializer, CourseSerializer, FacultyCourseSerializer
from django.core.exceptions import ValidationError
import uuid
import csv
import io
import os
import random
import string
import smtplib
from email.mime.text import MIMEText
from django.core.files.storage import default_storage

def generate_enrollment_key(length=16):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(length))

class MyScheduleView(APIView):
    """
    Returns the courses a student is currently enrolled in.
    """
    def get(self, request):
        student_id = str(request.user.id)
        enrollments = Enrollment.objects.filter(student_id=student_id, status='enrolled')
        serializer = ScheduleSerializer(enrollments, many=True)
        return Response(serializer.data)

class CourseEnrollView(APIView):
    """
    POST /api/courses/enroll/
    Verifies the course setup tag and enrolls the student.
    """
    def post(self, request):
        student_id = str(request.user.id)
        course_id = request.data.get('course_id')
        provided_key = request.data.get('course_key')

        if not course_id:
            return Response({"error": "Missing course identification"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            course = Course.objects.get(id=course_id)
            if course.enrollment_key and course.enrollment_key != provided_key:
                return Response({"message": "Invalid enrollment key"}, status=status.HTTP_403_FORBIDDEN)
            
            # Check if Already Enrolled
            if Enrollment.objects.filter(student_id=student_id, course_id=course_id).exists():
                return Response({"message": "Already enrolled in this course"}, status=status.HTTP_400_BAD_REQUEST)

            # Create Enrollment
            Enrollment.objects.create(student_id=student_id, course_id=course_id)
            return Response({"message": "Successfully enrolled"}, status=status.HTTP_201_CREATED)

        except Course.DoesNotExist:
            return Response({"message": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

class CourseEnrollByCodeView(APIView):
    """
    POST /api/courses/enroll-by-code/
    Finds course by code (e.g. CS253) and verifies entry key.
    """
    def post(self, request):
        student_id = str(request.user.id)
        course_code = request.data.get('course_code')
        provided_key = request.data.get('enrollment_key')

        if not all([course_code, provided_key]):
            return Response({"message": "Both course code and key are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Case-insensitive match on course code
            course = Course.objects.get(code__iexact=course_code, is_active=True)
            
            # Check Enrollment Key
            if course.enrollment_key and course.enrollment_key != provided_key:
                return Response({"message": "Invalid Enrollment Key for this course."}, status=status.HTTP_403_FORBIDDEN)
            
            # Check for existing enrollment
            if Enrollment.objects.filter(student_id=student_id, course_id=course.id).exists():
                return Response({"message": "You are already enrolled in this course."}, status=status.HTTP_400_BAD_REQUEST)

            # Create Enrollment
            Enrollment.objects.create(student_id=student_id, course_id=course.id)
            return Response({"message": f"Successfully enrolled in {course.code}"}, status=status.HTTP_201_CREATED)

        except Course.DoesNotExist:
            return Response({"message": f"Course code '{course_code}' not found."}, status=status.HTTP_404_NOT_FOUND)

class CourseListView(APIView):
    """
    Returns a list of all active courses available in the system.
    """
    def get(self, request):
        courses = Course.objects.filter(is_active=True)
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Faculty access required to create courses"}, status=status.HTTP_403_FORBIDDEN)
        
        code = request.data.get('code')
        title = request.data.get('title')
        if not code or not title:
            return Response({"error": "code and title required"}, status=status.HTTP_400_BAD_REQUEST)
            
        key = generate_enrollment_key(16)
        
        course = Course.objects.create(
            code=code,
            title=title,
            description=request.data.get('description', ''),
            credits=request.data.get('credits', 3),
            instructor_id=request.user.id,
            semester=request.data.get('semester', 'Fall'),
            max_enrollment=request.data.get('max_enrollment', 60),
            enrollment_key=key
        )
        return Response({
            "message": "Course created successfully",
            "course_id": course.id,
            "enrollment_key": key
        }, status=status.HTTP_201_CREATED)

class FacultyLoadView(APIView):
    """
    Returns the list of courses assigned to the logged-in instructor.
    """
    def get(self, request):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Faculty access required"}, status=status.HTTP_403_FORBIDDEN)

        instructor_id = str(request.user.id)
        courses = Course.objects.filter(instructor_id=instructor_id, is_active=True)
        serializer = FacultyCourseSerializer(courses, many=True)
        return Response(serializer.data)
    
class UpdateFinalGradeView(APIView):
    """
    Endpoint for Faculty to set official letter grades in the academic record.
    PUT /api/enrollments/grade/
    """
    def put(self, request):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Faculty access required"}, status=status.HTTP_403_FORBIDDEN)

        student_id = request.data.get('student_id')
        course_id = request.data.get('course_id')
        grade = request.data.get('grade')

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
    Body: { "course_id": "...", "date": "YYYY-MM-DD", "students": [{"id": "...", "status": "present"}] }
    Uses UPSERT to allow re-submitting attendance for the same date.
    """
    def post(self, request):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Faculty access required"}, status=status.HTTP_403_FORBIDDEN)

        course_id = request.data.get('course_id')
        date = request.data.get('date')
        attendance_data = request.data.get('students', [])

        if not course_id or not attendance_data or not date:
            return Response({"error": "Course ID, date, and student data required"}, status=status.HTTP_400_BAD_REQUEST)

        saved = 0
        with connection.cursor() as cur:
            for entry in attendance_data:
                try:
                    cur.execute("""
                        INSERT INTO attendance (id, course_id, student_id, date, status)
                        VALUES (uuid_generate_v4(), %s, %s, %s, %s)
                        ON CONFLICT (course_id, student_id, date)
                        DO UPDATE SET status = EXCLUDED.status
                    """, [course_id, entry['id'], date, entry.get('status', 'present')])
                    saved += 1
                except Exception:
                    pass

        return Response({"message": f"Attendance saved for {saved} students on {date}"}, status=status.HTTP_201_CREATED)

class MarkAttendanceCSVView(APIView):
    """
    POST /api/attendance/mark/csv/
    Expects form-data with 'course_id', 'date', and 'file' (CSV).
    CSV format must include columns: student_id, status
    """
    def post(self, request):
        course_id = request.data.get('course_id')
        date = request.data.get('date')
        file_obj = request.FILES.get('file')

        if not all([course_id, date, file_obj]):
            return Response({"error": "course_id, date, and file are required"}, status=status.HTTP_400_BAD_REQUEST)

        if not file_obj.name.endswith('.csv'):
            return Response({"error": "File must be a CSV format"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = file_obj.read().decode('utf-8')
            io_string = io.StringIO(decoded_file)
            reader = csv.DictReader(io_string)
            
            saved = 0
            with connection.cursor() as cur:
                for row in reader:
                    student_id = row.get('student_id')
                    status_val = row.get('status', 'present').lower()
                    
                    if not student_id:
                        continue
                        
                    try:
                        cur.execute("""
                            INSERT INTO attendance (id, course_id, student_id, date, status)
                            VALUES (uuid_generate_v4(), %s, %s, %s, %s)
                            ON CONFLICT (course_id, student_id, date)
                            DO UPDATE SET status = EXCLUDED.status
                        """, [course_id, student_id, date, status_val])
                        saved += 1
                    except Exception:
                        pass # Skip invalid rows or invalid UUIDs

            return Response({"message": f"Attendance saved for {saved} students from CSV on {date}"}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": f"Error processing file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


class CourseDetailView(APIView):
    """GET /api/courses/<course_id>/"""
    def get(self, request, course_id):
        course = None
        try:
            # 1. Try fetching by exact UUID
            course = Course.objects.get(id=course_id)
        except (Course.DoesNotExist, ValueError, ValidationError):
            # 2. Fallback: Try fetching by code (like 'CS253') if ID isn't a valid UUID or not found
            course = Course.objects.filter(code__iexact=course_id).first()
        
        if not course:
            return Response({"error": f"Course '{course_id}' not found"}, status=status.HTTP_404_NOT_FOUND)
            
        data = {
            'id': str(course.id),
            'code': course.code,
            'title': course.title,
            'credits': course.credits,
            'semester': course.semester,
            'description': course.description,
            'instructor_name': f"{course.instructor.first_name} {course.instructor.last_name}" if course.instructor else "Staff",
        }
        return Response(data)


class CourseStudentsView(APIView):
    """GET /api/courses/<course_id>/students/ — List enrolled students"""
    def get(self, request, course_id):
        enrollments = Enrollment.objects.filter(course_id=course_id, status='enrolled').select_related()
        students = []
        for e in enrollments:
            try:
                s = User.objects.get(id=e.student_id)
                students.append({'id': str(s.id), 'first_name': s.first_name, 'last_name': s.last_name, 'email': s.email})
            except Exception:
                pass
        return Response(students)


class CourseAnnouncementsView(APIView):
    """GET/POST /api/courses/<course_id>/announcements/"""
    def get(self, request, course_id):
        with connection.cursor() as cur:
            cur.execute("SELECT id, title, body, created_at FROM course_announcements WHERE course_id = %s ORDER BY created_at DESC", [course_id])
            rows = cur.fetchall()
        return Response([{'id': str(r[0]), 'title': r[1], 'body': r[2], 'created_at': r[3]} for r in rows])

    def post(self, request, course_id):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Faculty access required"}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title')
        body = request.data.get('body')
        author_id = str(request.user.id)
        if not title or not body:
            return Response({"error": "Title and body required"}, status=status.HTTP_400_BAD_REQUEST)
        new_id = str(uuid.uuid4())
        with connection.cursor() as cur:
            cur.execute(
                "INSERT INTO course_announcements (id, course_id, title, body, author_id) VALUES (%s, %s, %s, %s, %s) RETURNING id, title, body, created_at",
                [new_id, course_id, title, body, author_id]
            )
            row = cur.fetchone()
        return Response({'id': str(row[0]), 'title': row[1], 'body': row[2], 'created_at': row[3]}, status=status.HTTP_201_CREATED)


class CourseResourcesView(APIView):
    """GET/POST /api/courses/<course_id>/resources/"""
    def get(self, request, course_id):
        with connection.cursor() as cur:
            cur.execute("SELECT id, title, resource_type, file_url, created_at FROM resources WHERE course_id = %s ORDER BY created_at DESC", [course_id])
            rows = cur.fetchall()
        return Response([{'id': str(r[0]), 'title': r[1], 'resource_type': r[2], 'file_url': r[3], 'created_at': r[4]} for r in rows])

    def post(self, request, course_id):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Faculty access required"}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title')
        resource_type = request.data.get('resource_type', 'other')
        file_url = request.data.get('file_url', '')
        
        file_obj = request.FILES.get('file')
        if file_obj:
            ext = file_obj.name.split('.')[-1] if '.' in file_obj.name else ''
            new_file_name = f"{uuid.uuid4()}.{ext}"
            saved_path = default_storage.save(f"resources/{new_file_name}", file_obj)
            file_url = f"http://localhost:8000/media/{saved_path}"

        uploader_id = str(request.user.id)
        new_id = str(uuid.uuid4())
        with connection.cursor() as cur:
            cur.execute(
                "INSERT INTO resources (id, course_id, uploader_id, title, resource_type, file_url) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, title, resource_type, file_url, created_at",
                [new_id, course_id, uploader_id, title, resource_type, file_url]
            )
            row = cur.fetchone()
        return Response({'id': str(row[0]), 'title': row[1], 'resource_type': row[2], 'file_url': row[3], 'created_at': row[4]}, status=status.HTTP_201_CREATED)


class ResourceDeleteView(APIView):
    """DELETE /api/resources/<resource_id>/"""
    def delete(self, request, resource_id):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Faculty access required"}, status=status.HTTP_403_FORBIDDEN)

        with connection.cursor() as cur:
            cur.execute("DELETE FROM resources WHERE id = %s", [resource_id])
        return Response({"message": "Resource deleted"})


class CourseAssignmentsView(APIView):
    """GET/POST /api/courses/<course_id>/assignments/"""
    def get(self, request, course_id):
        with connection.cursor() as cur:
            cur.execute("SELECT id, title, description, due_date, max_marks, weightage, created_at FROM assignments WHERE course_id = %s ORDER BY created_at DESC", [course_id])
            rows = cur.fetchall()
        return Response([{'id': str(r[0]), 'title': r[1], 'description': r[2], 'due_date': r[3], 'max_marks': r[4], 'weightage': r[5], 'created_at': r[6]} for r in rows])

    def post(self, request, course_id):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Faculty access required"}, status=status.HTTP_403_FORBIDDEN)

        title = request.data.get('title')
        description = request.data.get('description', '')
        due_date = request.data.get('due_date')
        max_marks = request.data.get('max_marks', 100)
        weightage = request.data.get('weightage', 10)
        new_id = str(uuid.uuid4())
        with connection.cursor() as cur:
            cur.execute(
                "INSERT INTO assignments (id, course_id, title, description, due_date, max_marks, weightage) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id, title, max_marks, weightage",
                [new_id, course_id, title, description, due_date, max_marks, weightage]
            )
            row = cur.fetchone()
        return Response({'id': str(row[0]), 'title': row[1], 'max_marks': row[2], 'weightage': row[3]}, status=status.HTTP_201_CREATED)

class MyTimetableView(APIView):
    """GET /api/timetable/"""
    def get(self, request):
        user_id = str(request.user.id)
        role = request.user.role
        with connection.cursor() as cur:
            if role == 'student':
                cur.execute("""
                    SELECT cs.id, cs.day_of_week, cs.start_time, cs.end_time, cs.class_type, c.code, c.title
                    FROM course_schedules cs
                    JOIN courses c ON cs.course_id = c.id
                    JOIN enrollments e ON e.course_id = c.id
                    WHERE e.student_id = %s AND e.status = 'enrolled'
                """, [user_id])
            else:
                cur.execute("""
                    SELECT cs.id, cs.day_of_week, cs.start_time, cs.end_time, cs.class_type, c.code, c.title
                    FROM course_schedules cs
                    JOIN courses c ON cs.course_id = c.id
                    WHERE c.instructor_id = %s
                """, [user_id])
            rows = cur.fetchall()
        
        schedule = []
        for r in rows:
            schedule.append({
                'id': str(r[0]),
                'day': r[1],
                'start_time': str(r[2]),
                'end_time': str(r[3]),
                'type': r[4],
                'course_code': r[5],
                'course_title': r[6]
            })
        return Response(schedule)

class CourseScheduleManageView(APIView):
    """GET/POST/DELETE /api/courses/<course_id>/schedule/"""
    def get(self, request, course_id):
        with connection.cursor() as cur:
            cur.execute("SELECT id, day_of_week, start_time, end_time, class_type FROM course_schedules WHERE course_id = %s", [course_id])
            rows = cur.fetchall()
        return Response([{'id': str(r[0]), 'day': r[1], 'start_time': str(r[2]), 'end_time': str(r[3]), 'type': r[4]} for r in rows])

    def post(self, request, course_id):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Unauthorized"}, status=403)
        day = request.data.get('day')
        start = request.data.get('start_time')
        end = request.data.get('end_time')
        ctype = request.data.get('class_type', 'Lec')
        if not all([day, start, end]):
            return Response({"error": "Missing fields"}, status=400)
        new_id = str(uuid.uuid4())
        with connection.cursor() as cur:
            cur.execute(
                "INSERT INTO course_schedules (id, course_id, day_of_week, start_time, end_time, class_type) VALUES (%s, %s, %s, %s, %s, %s)",
                [new_id, course_id, day, start, end, ctype]
            )
        return Response({"message": "Added", "id": new_id}, status=201)

    def delete(self, request, course_id):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Unauthorized"}, status=403)
        schedule_id = request.data.get('schedule_id') or request.query_params.get('schedule_id')
        with connection.cursor() as cur:
            cur.execute("DELETE FROM course_schedules WHERE id = %s AND course_id = %s", [schedule_id, course_id])
        return Response({"message": "Deleted"})

class CourseInviteView(APIView):
    """POST /api/academic/courses/<course_id>/invite/"""
    def post(self, request, course_id):
        if request.user.role not in ('faculty', 'admin'):
            return Response({"error": "Faculty access required"}, status=status.HTTP_403_FORBIDDEN)
            
        emails = request.data.get('emails', [])
        if not emails or not isinstance(emails, list):
            return Response({"error": "Provide a list of emails"}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            course = Course.objects.get(id=course_id)
        except Exception:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
            
        key = course.enrollment_key
        
        sender = os.environ.get('SMTP_USER', '')
        password = os.environ.get('SMTP_PASS', '')
        
        # We will mock the email sending if credentials aren't provided
        if not sender or not password:
            print(f"[MOCK EMAIL] To: {emails} | Subj: Course Invitation - {course.code} | Body: The enrollment key is {key}")
            return Response({"message": f"Platform configured to mock email. Mock dispatch sent to {len(emails)} students with key {key}"})
            
        try:
            msg = MIMEText(f"Hello,\n\nYou have been officially invited to enroll in {course.code} - {course.title}.\nPlease use the following 16-character secure enrollment key to join the course workspace on ASMS:\n\nKey: {key}\n\nWelcome to ASMS!")
            msg['Subject'] = f"ASMS Course Invitation: {course.code}"
            msg['From'] = sender
            msg['To'] = ", ".join(emails)
            
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(sender, password)
            server.send_message(msg)
            server.quit()
        except Exception as e:
            print(f"SMTP Error: {e}")
            return Response({"error": f"Failed to send raw emails. Please check SMTP settings. Local error: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({"message": f"Emails successfully dispatched to {len(emails)} students."})


class AssignmentSubmitView(APIView):
    """
    POST /api/academic/courses/<course_id>/assignments/<assignment_id>/submit/
    Accepts multipart file upload(s) + optional text content.
    Stores files and records the submission in the submissions table.
    """
    def post(self, request, course_id, assignment_id):
        student_id = str(request.user.id)
        content = request.data.get('content', '')
        files = request.FILES.getlist('files')

        # Build a text summary of submitted files (file storage is optional here)
        file_names = []
        for f in files:
            try:
                save_path = f'submissions/{student_id}/{assignment_id}/{f.name}'
                default_storage.save(save_path, f)
                file_names.append(f.name)
            except Exception as e:
                print(f'[WARN] Could not save file {f.name}: {e}')
                file_names.append(f.name)  # still record the name

        submission_content = content
        if file_names:
            submission_content = f"{content}\n\n[Attached files: {', '.join(file_names)}]".strip()

        with connection.cursor() as cursor:
            # Upsert — update if already submitted, insert if first time
            cursor.execute("""
                INSERT INTO submissions (assignment_id, student_id, content)
                VALUES (%s, %s, %s)
                ON CONFLICT (assignment_id, student_id)
                DO UPDATE SET content = EXCLUDED.content, submitted_at = NOW()
                RETURNING id
            """, [assignment_id, student_id, submission_content])
            row = cursor.fetchone()

        return Response({"message": "Submission received.", "submission_id": str(row[0]) if row else None}, status=status.HTTP_201_CREATED)