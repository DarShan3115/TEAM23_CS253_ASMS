import os
import psycopg2
from urllib.parse import urlparse

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:password@localhost:5432/asms_db")

def create_table():
    parsed = urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        dbname=parsed.path[1:],
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port
    )
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS course_schedules (
            id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            day_of_week     VARCHAR(15) NOT NULL,
            start_time      TIME NOT NULL,
            end_time        TIME NOT NULL,
            class_type      VARCHAR(20) NOT NULL DEFAULT 'Lec'
        );
    """)
    conn.commit()
    conn.close()
    print("course_schedules table created successfully.")

if __name__ == "__main__":
    create_table()
