from sqlalchemy.orm import Session
import models
# Standard GPA mapping
GRADE_POINTS = {
    'A+': 10.0, 'A': 10.0, 'B+': 9.0, 'B': 8.0, 
    'C+': 7.0, 'C': 6.0, 'D+': 5.0, 'D': 4.0, 
    'E': 0.0, 'F': 0.0
}

def calculate_gpa(enrollments, db):
    total_points = 0
    total_credits = 0
    
    for enr in enrollments:
        if enr.grade in GRADE_POINTS:
            course = db.query(models.Course).filter(models.Course.id == enr.course_id).first()
            if course:
                credits = course.credits
                total_points += (GRADE_POINTS[enr.grade] * credits)
                total_credits += credits
                
    return total_points / total_credits if total_credits > 0 else 0.0

def calculate_subject_attendance(db, student_id, course_id):
    logs = db.query(models.AttendanceLog).filter(
        models.AttendanceLog.student_id == student_id,
        models.AttendanceLog.course_id == course_id
    ).all()
    
    if not logs:
        return 0
        
    present_count = len([l for l in logs if l.status == 'Present'])
    return int((present_count / len(logs)) * 100)

def get_risk_level(attendance, grade):
    """Determines risk level based on academic thresholds"""
    if attendance < 65 or grade == 'F':
        return "Critical"
    if attendance < 75 or grade == 'D':
        return "Warning"
    return "Stable"

def identify_at_risk_students(db: Session, instructor_id: str):
    """
    Finds students in an instructor's classes who are performing poorly.
    """
    # 1. Get all courses taught by this instructor
    instructor_courses = db.query(models.Course).filter(models.Course.instructor_id == instructor_id).all()
    course_ids = [c.id for c in instructor_courses]
    
    if not course_ids:
        return []

    # 2. Get all enrollments for these courses
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.course_id.in_(course_ids)).all()
    
    risk_alerts = []
    
    for enr in enrollments:
        # Calculate attendance for this student in this course
        attendance = calculate_subject_attendance(db, str(enr.student_id), str(enr.course_id))
        level = get_risk_level(attendance, enr.grade)
        
        if level != "Stable":
            # Fetch student name for the alert
            student = db.query(models.User).filter(models.User.id == enr.student_id).first()
            course = db.query(models.Course).filter(models.Course.id == enr.course_id).first()
            
            reason = f"Low Attendance ({attendance}%)" if attendance < 75 else f"Low Grade ({enr.grade})"
            
            risk_alerts.append({
                "name": f"{student.first_name} {student.last_name}",
                "course": course.code if course else "Unknown",
                "reason": reason,
                "level": level
            })
            
    return risk_alerts
