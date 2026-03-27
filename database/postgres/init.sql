-- ============================================================================
-- ASMS Database Schema
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'student'
                        CHECK (role IN ('student','faculty','admin')),
    phone           VARCHAR(20),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Departments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) UNIQUE NOT NULL,
    code            VARCHAR(10)  UNIQUE NOT NULL,
    head_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Courses ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(20)  UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    credits         INTEGER      NOT NULL DEFAULT 3 CHECK (credits > 0),
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    instructor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    semester        VARCHAR(20)  NOT NULL,
    max_enrollment  INTEGER      NOT NULL DEFAULT 60,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Enrollments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'enrolled'
                        CHECK (status IN ('enrolled','dropped','completed')),
    grade           VARCHAR(5),
    enrolled_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- ── Assignments ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assignments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        TIMESTAMPTZ,
    max_marks       INTEGER      NOT NULL DEFAULT 100,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Submissions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url        TEXT,
    marks           INTEGER,
    feedback        TEXT,
    submitted_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- ── Attendance ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'present'
                        CHECK (status IN ('present','absent','late')),
    UNIQUE(course_id, student_id, date)
);

-- ── Notices / Announcements ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255) NOT NULL,
    body            TEXT NOT NULL,
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_role     VARCHAR(20) DEFAULT 'all',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course  ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course   ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assign  ON submissions(assignment_id);

-- ── Seed admin user (password: admin123) ────────────────────────────────────
-- bcrypt hash of 'admin123' with 10 rounds
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
    'admin@asms.edu',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36PQm4y6BkG6qKz.YBv.q6i',
    'System',
    'Admin',
    'admin'
) ON CONFLICT (email) DO NOTHING;
