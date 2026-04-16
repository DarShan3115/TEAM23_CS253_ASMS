-- ============================================================================
-- ASMS Database Schema
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
    avatar_url      TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until    TIMESTAMPTZ,
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
    code            VARCHAR(20)  UNIQUE NOT NULL, -- Serves as the unique hashtag e.g. CS253
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    credits         INTEGER      NOT NULL DEFAULT 3 CHECK (credits > 0),
    department_id   UUID REFERENCES departments(id) ON DELETE SET NULL,
    instructor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    semester        VARCHAR(20)  NOT NULL,
    max_enrollment  INTEGER      NOT NULL DEFAULT 60,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    enrollment_key  VARCHAR(50)  NOT NULL DEFAULT '1234', -- Mock default for bypass
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Course Schedules ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_schedules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    day_of_week     VARCHAR(15) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    class_type      VARCHAR(20) NOT NULL DEFAULT 'Lec'
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
    weightage       INTEGER      NOT NULL DEFAULT 10, -- Marks overall weight out of 100%
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Resources ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resources (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    uploader_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    resource_type   VARCHAR(20)  NOT NULL DEFAULT 'other' CHECK (resource_type IN ('lecture', 'other')),
    file_url        TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Submissions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT,
    file_url        TEXT,
    marks           INTEGER,
    grade           NUMERIC,
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

-- ── Course Announcements ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS course_announcements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    body            TEXT NOT NULL,
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Discussions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discussions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id       UUID NOT NULL,
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    is_anonymous    BOOLEAN DEFAULT TRUE,
    votes           INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tasks (Checklist) ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    due_date        DATE,
    due_time        TIME,
    course_id       UUID REFERENCES courses(id),
    course_tag      VARCHAR(6),
    custom_tag      VARCHAR(50),
    priority        VARCHAR(20) DEFAULT 'Medium',
    status          VARCHAR(20) DEFAULT 'Active',
    is_completed    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email        ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role         ON users(role);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course  ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_course   ON attendance(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assign  ON submissions(assignment_id);

-- ── 1. Base Users (Explicit UUIDs for relational mapping) ───────────────────
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'admin@iitk.ac.in', crypt('Admin@123', gen_salt('bf', 10)), 'System', 'Admin', 'admin'),
    ('50000000-0000-0000-0000-000000000001', 'student@iitk.ac.in', crypt('Student@123', gen_salt('bf', 10)), 'Jane', 'Doe', 'student'),
    ('f0000000-0000-0000-0000-000000000001', 'faculty@iitk.ac.in', crypt('Faculty@123', gen_salt('bf', 10)), 'John', 'Smith', 'faculty')
ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id, password_hash = EXCLUDED.password_hash;

-- ── Grade Point / CPI Calculation View ──────────────────────────────────────
-- Calculates CPI strictly using the standard 10-point institute scale
CREATE OR REPLACE VIEW student_cpi_view AS
SELECT
    student_id,
    SUM(c.credits * CASE e.grade
        WHEN 'A*' THEN 10
        WHEN 'A'  THEN 10
        WHEN 'B+' THEN 9
        WHEN 'B'  THEN 8
        WHEN 'C+' THEN 7
        WHEN 'C'  THEN 6
        WHEN 'D+' THEN 5
        WHEN 'D'  THEN 4
        WHEN 'E'  THEN 0
        WHEN 'F'  THEN 0
        ELSE 0 END) / NULLIF(SUM(c.credits), 0) AS cpi
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE e.status = 'completed' AND e.grade IS NOT NULL
GROUP BY student_id;

-- ── Comprehensive Mock Data for Student Testing ─────────────────────────────
-- 2. Departments
INSERT INTO departments (id, name, code, head_id) VALUES 
    ('d0000000-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE', 'f0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'Electrical Engineering', 'EE', NULL),
    ('d0000000-0000-0000-0000-000000000003', 'Mechanical Engineering', 'ME', NULL),
    ('d0000000-0000-0000-0000-000000000004', 'Aerospace Engineering', 'AE', NULL),
    ('d0000000-0000-0000-0000-000000000005', 'Chemical Engineering', 'CHE', NULL)
ON CONFLICT (code) DO NOTHING;

-- 3. Courses
INSERT INTO courses (id, code, title, description, credits, department_id, instructor_id, semester, enrollment_key) VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'CS253', 'Software Development and Engineering', 'Introduction to SDLC.', 4, 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', '2024-II', '1234'),
    ('c0000000-0000-0000-0000-000000000002', 'CS340', 'Operating Systems', 'Kernel, threads, concurrency.', 4, 'd0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', '2023-I', '1234')
ON CONFLICT (code) DO NOTHING;

-- 4. Enrollments
INSERT INTO enrollments (student_id, course_id, status, grade) VALUES
    ('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'completed', 'A'),
    ('50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'enrolled', NULL)
ON CONFLICT (student_id, course_id) DO NOTHING;

-- 5. Attendance
INSERT INTO attendance (course_id, student_id, date, status) VALUES
    ('c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 day', 'present'),
    ('c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days', 'present'),
    ('c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '3 days', 'absent')
ON CONFLICT (course_id, student_id, date) DO NOTHING;

-- 6. Assignments
INSERT INTO assignments (id, course_id, title, description, due_date, max_marks, weightage) VALUES
    ('a5500000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Assignment 1: Git and GitHub', 'Submit the link to your repository.', CURRENT_DATE + INTERVAL '5 days', 100, 10),
    ('a5500000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Midterm Project', 'Design Document PDF.', CURRENT_DATE + INTERVAL '14 days', 100, 20)
ON CONFLICT (id) DO NOTHING;

-- 7. Submissions
INSERT INTO submissions (assignment_id, student_id, content, marks, feedback) VALUES
    ('a5500000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'https://github.com/janedoe/cs253-assign1', 95, 'Excellent work.')
ON CONFLICT (assignment_id, student_id) DO NOTHING;

-- 8. Productivity Tasks
INSERT INTO tasks (user_id, title, description, due_date, course_tag, priority, status) VALUES
    ('50000000-0000-0000-0000-000000000001', 'Study for Midterm', 'Review chapters 1-4', CURRENT_DATE + INTERVAL '2 days', 'CS253', 'High', 'Active'),
    ('50000000-0000-0000-0000-000000000001', 'Submit Assignment 1', 'Upload to portal', CURRENT_DATE + INTERVAL '1 day', 'CS253', 'Medium', 'Completed');

-- 9. Notices
INSERT INTO notices (title, body, author_id, target_role) VALUES
    ('Welcome to the New Semester', 'Please check your course schedules and familiarize yourself with the platform.', 'a0000000-0000-0000-0000-000000000001', 'all');
