# ASMS Testing Documentation

## 1. Introduction

**Test Strategy:**
The testing strategy for the ASMS project employs a hybrid approach tailored to our microservices architecture. We utilize **Automated Testing** (Unit and Integration tests) for our backend microservices (Academic, Analytics, Productivity, and Auth) to ensure data integrity, robust business logic, and reliable API contracts. For the React frontend client, we rely on a combination of automated component testing and **Manual End-to-End (E2E) Testing** to verify a seamless and secure user experience across different roles (Student, Faculty, and Admin).

**When was the testing conducted?**
Testing was conducted **in parallel with the implementation** following an Agile methodology. Developers wrote unit tests alongside new feature development to ensure immediate feedback. System integration and cross-service E2E testing were conducted iteratively as each microservice was completed and connected to the React frontend.

**Who were the testers?**
The primary testers were the **developers** themselves. To ensure objectivity, we practiced cross-testing, where a developer responsible for one microservice (e.g., Analytics) would test the integration points and API consumption of another (e.g., Academic Service). This peer-testing approach ensured independent validation of the system without requiring a dedicated QA team.

**What coverage criteria were used?**
*   **API Endpoint Coverage:** 100% functional validation of all REST API endpoints across all microservices, ensuring correct request handling and response formatting.
*   **Business Logic Coverage:** High branch and statement coverage for critical computational modules, particularly the GPA and Risk calculations in the FastAPI Analytics service, and the task submission handlers in the Go Productivity service.
*   **UI Component Coverage:** Ensuring all primary React routes and protected layouts (e.g., `FacultyDashboard`, `AdminControlPanel`, `MyCoursesPage`) render successfully under various mock authentication states.

**Have you used any tool for testing?**
Yes, a diverse set of testing frameworks was utilized to cater to our polyglot environment:

*   **Frontend Client (React/Vite):** Jest, React Testing Library (for UI components)
*   **Academic Service (Python/Django):** Django's built-in `TestCase`, `pytest-django`
*   **Analytics Service (Python/FastAPI):** `pytest`, `httpx` (for async API endpoint testing)
*   **Productivity Service (Go/Gin):** Go's native `testing` package, `testify` assertion library
*   **Auth Service (Node.js/Express):** `Jest`, `Supertest`
*   **General API / Manual Testing:** Postman, built-in Swagger UI (via FastAPI)

## 2. Unit Testing

### 1. Unit Name: Analytics Service - Student Overview Endpoint
Tested the `/api/analytics/student/overview` endpoint to ensure it returns the correct GPA and subject-wise attendance metrics for a student, and properly handles missing authentication headers.
**Unit Details:** `get_student_overview` function in `server/analytics-service/main.py`
**Test Owner:** Backend Developer (Analytics)
**Test Date:** 10/15/2023 - 10/18/2023
**Test Results:** Mocked database session dependencies (`get_db`) to return dummy enrollment data. Verified that a valid `x-user-id` header returns a 200 OK with accurately calculated GPA and attendance data. Tested error handling when `x-user-id` is missing, successfully returning a 401 Unauthorized HTTP Exception. All tests passed.
**Structural Coverage:** 100% Statement Coverage for the target endpoint function, including all conditional branches (missing header, empty enrollments, standard execution).
**Additional Comments:** Calculations for real-time attendance (`calculate_subject_attendance`) and GPA (`calculate_gpa`) were mocked during this unit test to strictly isolate and test the endpoint handler's routing and response formatting logic.

### 2. Unit Name: Productivity Service - Task Submission Handler
Tested the `SubmitTask` handler to verify that student assignment submissions are correctly parsed, validated, associated with the student ID, and stored in the database.
**Unit Details:** `SubmitTask` method of the `SubmissionHandler` struct in `server/productivity-service/handlers/submission_handler.go`
**Test Owner:** Backend Developer (Productivity)
**Test Date:** 10/20/2023 - 10/22/2023
**Test Results:** Sent mock HTTP POST requests using Go's `httptest` package. Verified that a valid JSON payload (`assignment_id`, `content`) along with the `x-user-id` header results in an HTTP 201 Created and successfully writes to the mock database. Verified HTTP 400 for invalid JSON and HTTP 401 for missing user identification headers. All tests passed successfully.
**Structural Coverage:** 100% Branch Coverage ensuring all error-checking branches (`if err := c.ShouldBindJSON...`, `if studentIDStr == ""...`, `if err := h.DB.Create...`) are executed and verified.
**Additional Comments:** Used a mocking library to simulate `gorm.DB` database interactions. This ensures the unit tests run incredibly fast without requiring a live PostgreSQL instance.

### 3. Unit Name: Frontend Client - Class Summary Card Molecule
Tested the rendering and safety guards of the `ClassSummaryCard` React component used in the Faculty Dashboard to prevent UI crashes on bad data.
**Unit Details:** `ClassSummaryCard` component in `client/src/components/molecules/ClassSummaryCard.jsx`
**Test Owner:** Frontend Developer
**Test Date:** 10/25/2023 - 10/26/2023
**Test Results:** Mounted the component using React Testing Library. First, passed a valid `course` prop and verified that the course code, title, enrollment count, and attendance rendered correctly. Second, tested the component without passing the `course` prop to verify that the guard clause triggers and safely renders the "Course data unavailable" fallback UI instead of throwing a "Cannot read properties of undefined" error. All tests passed.
**Structural Coverage:** 100% Component Render Coverage. Both the standard render path and the early-return guard clause path were executed.
**Additional Comments:** Verified that Tailwind CSS classes were applied correctly to the fallback UI to maintain the visual design language of the dashboard.

## 3. Integration Testing

### 1. Module Name: Analytics Service & PostgreSQL Database Integration
Tested the integration between the FastAPI Analytics service and the PostgreSQL database to ensure enrollment records are correctly fetched and parsed by SQLAlchemy models.
**Module Details:** `analytics-service` (`main.py`) interacting with the `db` service (PostgreSQL `asms_db`).
**Test Owner:** Backend Developer (Analytics)
**Test Date:** 10/28/2023 - 10/30/2023
**Test Results:** Spun up a dedicated test PostgreSQL container using Docker Compose. Inserted known seed data for courses and student enrollments. Executed HTTP GET requests against the `/api/analytics/student/overview` endpoint. Verified that the service correctly connected to the database, executed the SQLAlchemy ORM queries without errors, and returned the expected JSON payload matching the seeded test data. All integration points passed.
**Additional Comments:** Database connection pooling and connection teardown (using the `get_db` dependency injection) were verified to prevent memory leaks during high concurrent load.

### 2. Module Name: Frontend Client & Academic Service Integration
Tested the data flow from the React frontend making an HTTP request to the Django Academic Service to fetch and display a faculty member's assigned courses.
**Module Details:** React `FacultyDashboard` (Frontend) communicating with `FacultyLoadView` (Django Academic Service).
**Test Owner:** Full Stack Developer
**Test Date:** 11/01/2023 - 11/03/2023
**Test Results:** Ran both the frontend Vite development server and the Django backend locally. Navigated to the Faculty Dashboard route. Verified the network request correctly attached the `x-user-id` header representing the logged-in user. Verified the Django service received the header, queried its DB, and returned a 200 OK with the course list payload. Verified the React UI successfully parsed this payload, updated its local state, and rendered the `ClassSummaryCard` molecules with live data.
**Additional Comments:** CORS middleware configuration in the Academic service was successfully validated during this test, ensuring cross-origin requests from `http://localhost:3000` are securely permitted.

## 4. System Testing

### 1. Requirement: SRS-REQ-015 - Faculty Attendance Marking and Student Analytics Synchronization
Tested the end-to-end flow of a faculty member marking daily attendance and the system accurately reflecting this new data in the student's analytics dashboard.
**Test Owner:** QA Lead / Full Stack Developer
**Test Date:** 11/05/2023 - 11/07/2023
**Test Results:** Logged into the React frontend as a Faculty user. Navigated to a specific course and submitted attendance for a roster of mocked students, triggering the `MarkAttendanceView` POST endpoint in the Django Academic Service. Logged out and logged back in as one of the students marked "Absent". Navigated to the Student Dashboard and verified that the FastAPI Analytics Service accurately recalculated the overall `attendance_avg` downward, and the React UI displayed the correct updated percentage. The entire system flow worked seamlessly.
**Additional Comments:** This system test successfully validates the distributed data flow, proving that data mutated by the Academic Service is correctly read and processed by the Analytics Service.

### 2. Requirement: SRS-REQ-022 - Real-time Student GPA Calculation based on Official Grades
Tested the complete lifecycle of a faculty member publishing a final course grade and the student subsequently viewing the dynamically updated GPA on their dashboard.
**Test Owner:** QA Lead / Full Stack Developer
**Test Date:** 11/08/2023 - 11/10/2023
**Test Results:** Used the Faculty portal to submit a new final grade (e.g., "A") for a student via the `UpdateFinalGradeView` (Academic Service). Verified the database transaction was successful. Switched to the Student portal and loaded the My Courses page. The system successfully fetched the updated academic record, processed it through the Analytics Service's `calculate_gpa` engine, and rendered the newly increased GPA on the student's screen.
**Additional Comments:** Manual E2E testing was used for this scenario. Moving forward, we plan to implement Cypress or Playwright to automate this complete browser-based user journey.

## 5. Conclusion

**How Effective and exhaustive was the testing?**
The testing was highly effective in ensuring the stability of our core backend APIs and business logic. By utilizing specific testing frameworks for each microservice (Pytest for FastAPI, standard Go testing for Gin, Jest for Node.js), we achieved excellent structural coverage on critical computations like GPA calculation and task submission handling. Integration testing effectively validated the data contracts between our independent services and the React frontend.

**Which components have not been tested adequately?**
While our backend is well-tested, the frontend relies heavily on manual end-to-end testing, which leaves room for human error and lacks automated regression protection. Additionally, "failure state" or "resiliency" testing (e.g., how the Analytics service behaves if the Academic database temporarily goes down) has not been adequately covered. Cross-browser compatibility testing for the UI is also currently lacking.

**What difficulties have you faced during testing?**
Testing a microservices architecture presented unique challenges:
1. **Authentication Mocking:** Sharing and validating JWTs (`x-auth-token`) and user IDs (`x-user-id`) across different tech stacks (Node.js, Python, Go) required complex setup for integration tests.
2. **Data Synchronization:** Setting up the test databases for system tests was difficult, as data created in the Academic Service (Django/PostgreSQL) needed to be perfectly synced or mocked when testing the Analytics Service (FastAPI) to prevent false failures.
3. **Local Environment Overhead:** Running all five services plus databases locally to conduct E2E system testing consumed significant system resources.

**How could the testing process be improved?**
1. **Automated E2E Testing:** Implement **Cypress** or **Playwright** to replace our manual system testing, providing automated, repeatable UI interactions.
2. **Unified CI/CD Pipeline:** Configure GitHub Actions to automatically trigger the respective unit and integration test suites for each microservice whenever a Pull Request is opened, preventing broken code from being merged.
3. **Test Data Factories:** Create centralized scripts to easily spin up and tear down realistic, linked "seed data" across all microservice databases simultaneously to streamline integration testing.