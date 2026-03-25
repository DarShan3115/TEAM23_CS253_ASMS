from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ASMS Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics-service"}

@app.get("/api/analytics/summary")
def summary():
    return {
        "total_students": 0,
        "total_courses": 0,
        "avg_attendance": 0.0,
        "message": "Connect to your database for real data",
    }
