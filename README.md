# TEAM23_CS253_ASMS
The course project on the Software Developement.
# Academic School Management System (ASMS)

**TEAM23_CS253_ASMS** - The course project on Software Development.

ASMS is a modern, integrated platform built on a robust polyglot microservices architecture designed to streamline academic operations for students, faculty, and administrators.

## 🏗️ Architecture & Tech Stack

The application is divided into a React frontend client and several independent backend microservices:

*   **Frontend Client:** React, Vite, Tailwind CSS
*   **Authentication Service:** Node.js, Express, JWT
*   **Academic Service:** Python, Django, PostgreSQL
*   **Analytics Service:** Python, FastAPI, SQLAlchemy, PostgreSQL
*   **Productivity Service:** Go, Gin, GORM

## ✨ Key Features

### For Students
*   **Real-time Analytics:** View dynamically calculated Cumulative GPA and subject-wise attendance metrics.
*   **Course Management:** Browse the course catalog, manage enrollments, and view your schedule.
*   **Productivity:** Submit course assignments directly through the platform.

### For Faculty
*   **Dashboard & Teaching Load:** View assigned courses and class summary statistics.
*   **Academic Management:** Mark daily attendance and submit official final grades.
*   **Risk Alerts:** Automatically identify students at risk due to low attendance or poor grades.

### For Administrators
*   **User Management:** Centralized control panel to manage all student, faculty, and admin accounts.
*   **System Configuration:** Oversee departments, courses, and system-wide notices.

## 🚀 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Docker and Docker Compose installed on your machine.
*   Git

### Installation & Running Locally

The easiest way to run the entire microservices ecosystem is via Docker Compose:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/TEAM23_CS253_ASMS.git
    cd TEAM23_CS253_ASMS
    ```

2.  **Environment Variables (Optional but Recommended):**
    For deployment or testing mail hooks (like announcements and course invitations), ensure you configure your `.env` variables inside `server/auth-service/`:
    ```ini
    SMTP_USER="your-email@gmail.com"
    SMTP_PASS="your-app-password"
    ```

3.  **Start the services:**
    ```bash
    docker-compose up --build
    ```
    This command will spin up the PostgreSQL database, apply all schema migrations, seed initial users, launch the React frontend client, and spin up all backend microservices simultaneously.

4.  **Access the application:**
    *   **Frontend UI:** `http://localhost:3000` (Use this for all interactions)
    *   **Auth Service API:** `http://localhost:5001`
    *   **Academic Service API:** `http://localhost:8000`
    *   **Analytics Service API:** `http://localhost:8001`
    *   **Productivity Service API:** `http://localhost:8080`

### 🔑 Initial Administrator Access (Zero-Setup)

Because **public manual registration is strictly disabled** for security, the database initialization script automatically injects a master administrator and test accounts on first boot:

| Role | Email Login | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@iitk.ac.in` | `Admin@123` |
| **Faculty** | `faculty@iitk.ac.in` | `Faculty@123` |
| **Student** | `student@iitk.ac.in` | `Student@123` |

*Log in locally at `http://localhost:3000` using the Admin credentials above to access the primary dashboard where you can begin bulk-generating the real user accounts!*

## 📖 Usage

Once the application is running, navigate to `http://localhost:3000` in your web browser. 

The system uses a centralized Authentication Service. Enter your provisioned credentials on the main login page. Upon successful authentication, your session will be managed via a secure token, and you will be automatically redirected to your role-specific dashboard (Student, Faculty, or Admin).

For an exhaustive breakdown of workflows, system navigation, and feature usage by role, please refer to the fully detailed `USER_MANUAL.md`.

## 🛑 Contributing & License

This is a proprietary academic project. External contributions, pull requests, or unauthorized modifications are strictly **not welcomed**. All rights reserved by TEAM23_CS253.
