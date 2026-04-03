# ASMS User Manual

## 1. Introduction

Welcome to the Academic School Management System (ASMS). ASMS is a modern, integrated platform built on a robust microservices architecture (comprising Academic, Analytics, Productivity, and Auth services) designed to streamline operations for students, faculty, and administrators. This exhaustive manual will guide you through every feature available in your system.

**Key Features:**
-   **Role-Based Dashboards:** Customized views for Students, Faculty, and Admins.
-   **Academic Services:** Course enrollment, grade management, and attendance tracking.
-   **Student Analytics:** Real-time insights into GPA and attendance performance.
-   **Faculty Analytics:** Risk-alert systems for identifying struggling students.
-   **Productivity Tools:** Task and assignment management.
-   **Secure Discussion Portal:** A safe space for academic collaboration.

---

## 2. Account & Security (All Users)

### 2.1. Registration and Logging In

To access the system, navigate to the main login page and enter the email and password associated with your account. Upon successful authentication, you will be securely redirected to your personalized dashboard.

The system uses a centralized Authentication Service to protect your account. Your session is managed via a JSON Web Token (JWT). When navigating between protected views, you may briefly see an **"Authenticating session..."** loading screen. If your token expires or is invalid, you will be automatically redirected back to the login page to protect your data.

### 2.2. Profile Management

Once logged in, you can manage your personal identity securely via the User Profile interface:
-   **Update Profile:** Modify your personal information to keep your directory entry up to date.
-   **Change Password:** Securely update your account password at any time.

### 2.3. The Main Dashboard

Your dashboard is the central hub of your ASMS experience. It provides at-a-glance information and quick links to the tools you need most. The content of the dashboard will differ based on your role.

---

## 3. Student Guide

This section is for users with the 'student' role.

### 3.1. Student Dashboard & Analytics

Your dashboard provides a real-time overview of your academic progress. Key analytics `StatCard` widgets, powered by the FastAPI Analytics Service, securely fetch and display:

-   **Cumulative GPA:** Calculated dynamically based on the final, official letter grades (e.g., 'A', 'B+') submitted by your instructors.
-   **Attendance Average:** An overall average percentage of your attendance across all enrolled courses.
-   **Subject-Wise Metrics:** A detailed breakdown showing your exact attendance percentage and current grade mapped to each specific subject.

### 3.2. My Schedule

You can view a list of all the active courses you are currently enrolled in. This view, generated securely from the Academic Service, shows the course code, title, and instructor.

### 3.3. Course Catalog & Enrollment

Navigate to the Course Catalog to browse all active courses offered. Each `CourseCard` displays key information:

-   Course Code and Title
-   Instructor Name
-   Credit Hours

To enroll, simply click the "Enroll Now" button on the course you wish to join.

### 3.4. Productivity & Assignments

Using the Productivity Service tools, you can submit your course assignments directly through the platform. Simply provide your assignment content, and the system will securely link the submission payload to your Student ID and the specific assignment ID.

### 3.5. Discussion Portal

The `DiscussionPortalPage` is a collaborative space for each course.

-   **Ask Questions:** Post questions to your peers and instructor.
-   **Anonymous Mode:** You have the option to post anonymously. When you do, your name is hidden and you are identified as "Anonymous".
-   **Faculty Responses:** Posts from instructors are clearly marked with a "Faculty" badge for authority and clarity.

---

## 4. Faculty Guide

This section is for users with the 'faculty' role.

### 4.1. Faculty Dashboard & Teaching Load

Your dashboard provides an overview of your assigned courses for the current semester. This "Faculty Load" is fetched from the Academic Service and gives you quick access to each course you are teaching. 

-   **Class Summary Cards:** Each course is displayed as a card showing the course code, title, total enrollment count, and overall class attendance.
-   *Note:* If a course temporarily fails to load its data from the database, the system will safely display a **"Course data unavailable"** fallback message rather than crashing your dashboard.

### 4.2. Risk Analytics Alerts

The Faculty Dashboard includes a powerful Risk Alert system powered by the Analytics Service. It automatically identifies and flags students in your classes who are "at risk" due to low attendance trends or poor grades, allowing you to proactively offer support.

### 4.3. Course Management

As an instructor, you have several tools to manage your courses.

#### Marking Attendance

You can take daily attendance for your classes. The attendance tool allows you to submit the status (`Present` or `Absent`) for each student on your roster. This data instantly synchronizes with the Analytics Service, updating the student's real-time attendance averages on their personal dashboard.

#### Submitting Final Grades

At the end of the term, you are responsible for submitting official letter grades. The `UpdateFinalGradeView` endpoint allows you to securely update a student's grade for a specific course. This is a critical action that directly impacts the student's official academic record and GPA.

### 4.4. Discussion Portal

Your participation in the Discussion Portal is vital.

-   **Official Responses:** When you post, you cannot be anonymous. Your posts are automatically marked with your name and a "Faculty" badge, ensuring students can trust the information.
-   **Clarifications:** Use the portal to answer student questions and post general clarifications or announcements.

---

## 5. Administrator Guide

This section is for users with the 'admin' role.

### 5.1. User Management

The `UserTable` provides a complete overview of all users in the system. As an administrator, you have the following capabilities:

-   **View All Users:** See a list of all students, faculty, and other admins.
-   **Search and Filter:** Quickly find specific users.
-   **Add New Users:** Provision new accounts for students and faculty.
-   **Edit User Information:** Update user details such as name, role, and contact information.
-   **Manage Account Status:** Activate or deactivate user accounts using the toggle switch. Deactivating an account revokes their access to the system without deleting their data.

**Admin Navigation:** 
Administrators utilize a dedicated sidebar featuring `AdminNavItem` links for quick access to various control panels. Active sections are highlighted for clear navigation.

### 5.2. System Configuration (Advanced)

Administrators are also responsible for managing core system entities, such as:

-   Creating and managing `departments`.
-   Creating and assigning `courses`.
-   Overseeing system-wide `notices`.

These actions are typically performed directly via administrative interfaces or database management tools.

---

## 6. Troubleshooting & FAQ

**Q: I can't log in. What should I do?**

**A:** Double-check that you are using the correct email and password. If you have forgotten your password, use the "Forgot Password" link on the login page to reset it. If the problem persists, contact system support.

**Q: Why does my GPA seem incorrect?**

**A:** The Cumulative GPA is calculated in real-time strictly based on the *Official Final Grades* (e.g., 'A', 'B') submitted by your instructors at the end of the term. It does not fluctuate based on individual assignment task submissions.

**Q: As a faculty member, I can't post anonymously in the discussion portal. Why?**

**A:** This is by design. To ensure clarity and authority, all posts by faculty members are identified. This helps students distinguish between peer discussion and official instruction.

**Q: I keep getting redirected to the login page when clicking a link. Why?**
**A:** Your session token (JWT) has likely expired, or the system could not find your authorization header. Simply log in again to refresh your secure session.

**Q: As a faculty member, my dashboard says "Course data unavailable".**
**A:** This is a UI safety fallback indicating the frontend successfully loaded, but the academic service database is momentarily unreachable or returned incomplete data for that specific course. Refresh the page after a few moments.