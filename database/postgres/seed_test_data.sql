-- ============================================================================
-- Extended Seed Data (Generated from Excel Mock Data)
-- Registers attendance, tasks, grades, and submissions for remaining students
-- ============================================================================

-- 0. User Data
INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES 
('10000000-0000-0000-0000-000000000001', 'subbarao@iitk.ac.in',  crypt('Password123!', gen_salt('bf', 10)), 'Subba',   'Rao',    'faculty'),
('10000000-0000-0000-0000-000000000002', 'indranil@iitk.ac.in',  crypt('Password123!', gen_salt('bf', 10)), 'Indranil','Saha',   'faculty'),
('10000000-0000-0000-0000-000000000003', 'amiyab@iitk.ac.in',    crypt('Password123!', gen_salt('bf', 10)), 'Amiya',   'Nayak',  'faculty'),
('20000000-0000-0000-0000-000000000001', 'darshan@iitk.ac.in',   crypt('Password123!', gen_salt('bf', 10)), 'Darshan', 'Jain',   'student'),
('20000000-0000-0000-0000-000000000002', 'prateek@iitk.ac.in',   crypt('Password123!', gen_salt('bf', 10)), 'Prateek', 'Sharma', 'student'),
('20000000-0000-0000-0000-000000000003', 'rohan@iitk.ac.in',     crypt('Password123!', gen_salt('bf', 10)), 'Rohan',   'Verma',  'student'),
('20000000-0000-0000-0000-000000000004', 'neha@iitk.ac.in',      crypt('Password123!', gen_salt('bf', 10)), 'Neha',    'Gupta',  'student'),
('20000000-0000-0000-0000-000000000005', 'aditi@iitk.ac.in',     crypt('Password123!', gen_salt('bf', 10)), 'Aditi',   'Singh',  'student'),
('30000000-0000-0000-0000-000000000001', 'superadmin@iitk.ac.in',crypt('Password123!', gen_salt('bf', 10)), 'Super', 'Admin', 'admin')
ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id, password_hash = EXCLUDED.password_hash;

-- 1. Attendance Data
INSERT INTO attendance (course_id, student_id, date, status) VALUES
-- Jane Doe
('c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 day', 'present'),
('c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days', 'present'),
('c0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '3 days', 'absent'),

-- Prateek
('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 day', 'present'),
('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '2 days', 'absent'),
('c0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '3 days', 'present'),

-- Rohan
('c0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '1 day', 'absent'),
('c0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '2 days', 'present'),

-- Neha
('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '1 day', 'present'),
('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '2 days', 'present'),

-- Aditi
('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '1 day', 'present'),
('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', CURRENT_DATE - INTERVAL '2 days', 'present')
ON CONFLICT (course_id, student_id, date) DO NOTHING;


-- 2. Productivity Tasks Data
INSERT INTO tasks (user_id, title, description, due_date, course_tag, priority, status) VALUES
('50000000-0000-0000-0000-000000000001', 'Study for Midterm', 'Review chapters 1-4', CURRENT_DATE + INTERVAL '2 days', 'CS253', 'High', 'Active'),
('50000000-0000-0000-0000-000000000001', 'Submit Assignment 1', 'Upload to portal', CURRENT_DATE + INTERVAL '1 day', 'CS253', 'Medium', 'Completed'),
('20000000-0000-0000-0000-000000000002', 'Finish Homework', 'Math problems 1-10', CURRENT_DATE + INTERVAL '1 day', 'CS340', 'High', 'Active'),
('20000000-0000-0000-0000-000000000003', 'Team Meeting', 'Discuss project architecture', CURRENT_DATE - INTERVAL '2 days', 'CS253', 'Medium', 'Completed'),
('20000000-0000-0000-0000-000000000004', 'Draft Report', 'Initial draft of research paper', CURRENT_DATE + INTERVAL '5 days', 'CS330', 'Low', 'Active'),
('20000000-0000-0000-0000-000000000005', 'Lab Prep', 'Read lab manual', CURRENT_DATE + INTERVAL '1 day', 'EE380', 'High', 'Active');


-- 3. Grades & Enrollments
INSERT INTO enrollments (id, student_id, course_id, status, grade) VALUES 
-- Jane
(uuid_generate_v4(), '50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'completed', 'A'),
(uuid_generate_v4(), '50000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'enrolled', NULL),
-- Prateek
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'completed', 'B+'),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'completed', 'A'),
-- Rohan
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 'completed', 'C'),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'completed', 'B'),
-- Neha
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'completed', 'A+'),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'enrolled', NULL),
-- Aditi
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003', 'completed', 'A'),
(uuid_generate_v4(), '20000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', 'enrolled', NULL)
ON CONFLICT (student_id, course_id) DO UPDATE SET status = EXCLUDED.status, grade = EXCLUDED.grade;


-- 4. Assignment Submissions & Feedback
-- Setup hardcoded assignments corresponding to the dataset
INSERT INTO assignments (id, course_id, title, description, due_date, max_marks, weightage) VALUES
('a2222222-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Project Phase 1', 'Setup Docker.', '2026-04-20', 100, 10),
('a2222222-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Midterm Scaling', 'Design load balancer.', '2026-04-18', 100, 20),
('a2222222-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', 'Kernel Sync', 'Locks and Semaphores.', '2026-04-20', 100, 15),
('a2222222-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000003', 'Control Systems Lab', 'PID controllers.', '2026-04-25', 100, 10)
ON CONFLICT (id) DO NOTHING;

-- Map student submissions
INSERT INTO submissions (assignment_id, student_id, content, marks, feedback) VALUES
-- Jane Doe
('a5500000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'https://github.com/janedoe/cs253-assign1', 95, 'Excellent work.'),
-- Prateek (Project Phase 1)
('a2222222-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'github.com/prateek/CS253-Project', 88, 'Good effort but needs more docs.'),
-- Rohan (Midterm Scaling)
('a2222222-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 'github.com/rohan/midterm', 70, 'Missed the load balancer requirement.'),
-- Neha (Kernel Sync)
('a2222222-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'github.com/neha/kernel', 92, 'Very solid semaphore logic.'),
-- Aditi (Control Systems Lab)
('a2222222-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000005', 'drive.google.com/aditi/lab1', 98, 'Perfect results.')
ON CONFLICT (assignment_id, student_id) DO UPDATE SET marks = EXCLUDED.marks, feedback = EXCLUDED.feedback;
