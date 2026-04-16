from fastapi import FastAPI, Header, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os, jwt
from database import SessionLocal, engine
import models, calculations

# ── JWT Verification ─────────────────────────────────────────────────────────
JWT_SECRET = os.getenv("JWT_SECRET", "")
http_bearer = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(http_bearer)) -> dict:
    """Validates the Bearer token and returns the payload."""
    if not JWT_SECRET:
        raise HTTPException(status_code=500, detail="Server misconfiguration: JWT_SECRET not set")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Access token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid access token")

# Analytics service is READ-ONLY — schema is managed by init.sql, not SQLAlchemy.

app = FastAPI(
    title="ASMS Analytics Service",
    description="Computational engine for GPA, Attendance, and Risk Analytics",
    version="1.0.0"
)

# --- CORS CONFIGURATION ---
# Allows the React frontend (port 3000) to communicate with this service
allowed_origins = ["http://localhost:3000", "http://localhost:5173"]

# Add Codespaces frontend URL if running in Codespaces
codespace_name = os.getenv("CODESPACE_NAME")
if codespace_name:
    allowed_origins.append(f"https://{codespace_name}-3000.app.github.dev")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE DEPENDENCY ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- HEALTH CHECK ---
@app.get("/health")
def health_check():
    return {
        "status": "operational", 
        "service": "analytics-service",
        "database": "connected"
    }

# --- STUDENT ANALYTICS ENDPOINT ---
@app.get("/api/analytics/student/overview")
def get_student_overview(payload: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """
    Returns GPA and subject-wise attendance for the logged-in student.
    Used by: Student Dashboard & Academic Progress Page.
    """
    # Identity from verified JWT — not a forgeable header
    x_user_id = payload.get("id") or payload.get("userId")
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Token missing user identity")

    # Fetch all enrollments for the student
    enrollments = db.query(models.Enrollment).filter(models.Enrollment.student_id == x_user_id).all()
    
    if not enrollments:
        return {
            "gpa": 0.0, 
            "attendance_avg": 0, 
            "subjects": [],
            "message": "No enrollment data found for this user."
        }

    subjects_stats = []
    total_attendance = 0
    
    for enr in enrollments:
        # Fetch course metadata for titles and credits
        course = db.query(models.Course).filter(models.Course.id == str(enr.course_id)).first()
        
        # Calculate real-time attendance for this subject
        att_percentage = calculations.calculate_subject_attendance(db, x_user_id, str(enr.course_id))
        
        subjects_stats.append({
            "subject": course.title if course else "Unknown Course",
            "attendance": att_percentage,
            "grade": enr.grade or "N/A",
            "trend": "+0.0%" # Placeholder for trend analysis logic
        })
        total_attendance += att_percentage

    # Calculate weighted GPA based on credits
    gpa_value = calculations.calculate_gpa(enrollments, db)

    return {
        "gpa": round(gpa_value, 2),
        "attendance_avg": round(total_attendance / len(enrollments)),
        "subjects": subjects_stats
    }

# --- FACULTY ANALYTICS ENDPOINT ---
@app.get("/api/analytics/faculty/risk-alerts")
def get_faculty_risk_alerts(payload: dict = Depends(verify_token), db: Session = Depends(get_db)):
    """
    Identifies students in the faculty's classes who are at risk due to
    low attendance or poor grades.
    Used by: Faculty Dashboard.
    """
    x_user_id = payload.get("id") or payload.get("userId")
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Token missing user identity")
    if payload.get("role") not in ("faculty", "admin"):
        raise HTTPException(status_code=403, detail="Faculty access required")
    
    # Logic in calculations.py filters by instructor and applies risk thresholds
    alerts = calculations.identify_at_risk_students(db, x_user_id)
    
    return alerts