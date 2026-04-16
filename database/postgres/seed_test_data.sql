-- 1. Create Users
-- Password for ALL seed users: Password123!
-- Uses pgcrypto crypt() — same method as init.sql — so bcrypt.compare() in Node auth service works correctly.
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES 
('10000000-0000-0000-0000-000000000001', 'subbarao@iitk.ac.in',  crypt('Password123!', gen_salt('bf', 10)), 'Subba',   'Rao',    'faculty'),
('10000000-0000-0000-0000-000000000002', 'indranil@iitk.ac.in',  crypt('Password123!', gen_salt('bf', 10)), 'Indranil','Saha',   'faculty'),
('10000000-0000-0000-0000-000000000003', 'amiyab@iitk.ac.in',    crypt('Password123!', gen_salt('bf', 10)), 'Amiya',   'Nayak',  'faculty'),
('20000000-0000-0000-0000-000000000001', 'darshan@iitk.ac.in',   crypt('Password123!', gen_salt('bf', 10)), 'Darshan', 'Jain',   'student'),
('20000000-0000-0000-0000-000000000002', 'prateek@iitk.ac.in',   crypt('Password123!', gen_salt('bf', 10)), 'Prateek', 'Sharma', 'student'),
('20000000-0000-0000-0000-000000000003', 'rohan@iitk.ac.in',     crypt('Password123!', gen_salt('bf', 10)), 'Rohan',   'Verma',  'student'),
('20000000-0000-0000-0000-000000000004', 'neha@iitk.ac.in',      crypt('Password123!', gen_salt('bf', 10)), 'Neha',    'Gupta',  'student'),
('20000000-0000-0000-0000-000000000005', 'aditi@iitk.ac.in',     crypt('Password123!', gen_salt('bf', 10)), 'Aditi',   'Singh',  'student')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Note: We do NOT insert departments/courses that overlap with init.sql codes directly using unique IDs to avoid FK traps.
-- We use DO UPDATE to gracefully overwrite and standardize the relational keys for the mock tests.

-- 2. Create Departments (Merge with existing from init.sql)
INSERT INTO departments (id, name, code, head_id) VALUES 
('d0000000-0000-0000-0000-000000000001', 'Computer Science and Engineering', 'CSE', '10000000-0000-0000-0000-000000000001'),
('d0000000-0000-0000-0000-000000000002', 'Electrical Engineering', 'EE', '10000000-0000-0000-0000-000000000002')
ON CONFLICT (code) DO UPDATE SET head_id = EXCLUDED.head_id;

-- 3. Create Courses
INSERT INTO courses (id, code, title, description, credits, department_id, instructor_id, semester, enrollment_key) VALUES 
('c0000000-0000-0000-0000-000000000001', 'CS253', 'Software Engineering', 'Advanced software scaling.', 9, 'd0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Fall 2024', '1234'),
('c0000000-0000-0000-0000-000000000002', 'CS340', 'Theory of Computation', 'Automata and Logic.', 9, 'd0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Fall 2024', '1234'),
('40000000-0000-0000-0000-000000000002', 'CS330', 'Operating Systems', 'Kernel dev and scheduling.', 12, 'd0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Fall 2024', '1234'),
('40000000-0000-0000-0000-000000000003', 'EE380', 'Control Systems', 'Laplace domains.', 9, 'd0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Fall 2024', '1234'),
('40000000-0000-0000-0000-000000000005', 'CHM611', 'Quantum Chemistry', 'Molecular orbital theory.', 9, 'd0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Fall 2024', '1234'),
('40000000-0000-0000-0000-000000000006', 'ENG460', 'Modern Literature', 'Post-modern analysis.', 9, 'd0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Fall 2024', '1234')
ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, instructor_id = EXCLUDED.instructor_id, credits = EXCLUDED.credits;

-- 4. Course Schedules
INSERT INTO course_schedules (id, course_id, day_of_week, start_time, end_time, class_type) VALUES 
(uuid_generate_v4(), 'c0000000-0000-0000-0000-000000000002', 'Monday', '08:00:00', '09:00:00', 'Lec'),
(uuid_generate_v4(), 'c0000000-0000-0000-0000-000000000002', 'Friday', '08:00:00', '09:00:00', 'Lec'),
(uuid_generate_v4(), '40000000-0000-0000-0000-000000000002', 'Tuesday', '08:00:00', '09:00:00', 'Lec'),
(uuid_generate_v4(), '40000000-0000-0000-0000-000000000002', 'Wednesday', '08:00:00', '09:00:00', 'Lec'),
(uuid_generate_v4(), '40000000-0000-0000-0000-000000000002', 'Thursday', '08:00:00', '09:00:00', 'Lec'),

(uuid_generate_v4(), 'c0000000-0000-0000-0000-000000000001', 'Monday', '09:00:00', '10:00:00', 'Lec'),
(uuid_generate_v4(), 'c0000000-0000-0000-0000-000000000001', 'Wednesday', '09:00:00', '10:00:00', 'Lec'),
(uuid_generate_v4(), 'c0000000-0000-0000-0000-000000000002', 'Tuesday', '09:00:00', '10:00:00', 'Lec'),
(uuid_generate_v4(), 'c0000000-0000-0000-0000-000000000001', 'Friday', '09:00:00', '10:00:00', 'Lec'),

(uuid_generate_v4(), '40000000-0000-0000-0000-000000000005', 'Monday', '10:30:00', '12:00:00', 'Lec'),
(uuid_generate_v4(), '40000000-0000-0000-0000-000000000005', 'Thursday', '10:30:00', '12:00:00', 'Lec'),

(uuid_generate_v4(), '40000000-0000-0000-0000-000000000002', 'Tuesday', '14:00:00', '17:00:00', 'Prc'),
(uuid_generate_v4(), '40000000-0000-0000-0000-000000000002', 'Friday', '14:00:00', '17:00:00', 'Prc'),

(uuid_generate_v4(), '40000000-0000-0000-0000-000000000006', 'Monday', '17:00:00', '18:00:00', 'Lec'),
(uuid_generate_v4(), '40000000-0000-0000-0000-000000000006', 'Wednesday', '17:00:00', '18:00:00', 'Lec'),
(uuid_generate_v4(), '40000000-0000-0000-0000-000000000006', 'Friday', '17:00:00', '18:00:00', 'Lec')
ON CONFLICT DO NOTHING;

-- 5. Enroll Students to ALL those courses to guarantee dense data visual
INSERT INTO enrollments (id, student_id, course_id, status) VALUES 
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'enrolled'),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'enrolled'),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'enrolled'),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000005', 'enrolled'),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000006', 'enrolled')
ON CONFLICT DO NOTHING;

-- 6. Assignments
INSERT INTO assignments (id, course_id, title, description, due_date, max_marks, weightage) VALUES
(uuid_generate_v4(), 'c0000000-0000-0000-0000-000000000001', 'Project Phase 1', 'Setup Docker.', '2026-04-20', 100, 10),
(uuid_generate_v4(), 'c0000000-0000-0000-0000-000000000001', 'Midterm Scaling', 'Design load balancer.', '2026-04-18', 100, 20),
(uuid_generate_v4(), '40000000-0000-0000-0000-000000000002', 'Kernel Sync', 'Locks and Semaphores.', '2026-04-20', 100, 15)
ON CONFLICT DO NOTHING;
