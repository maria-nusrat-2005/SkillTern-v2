# Execution Backlog: Skilltern

This document tracks all features and tasks, broken down by Epic, along with their estimated complexity and dependency mappings.

## Epic 1: Authentication & Security

### Task 1.1: Local Authentication REST Endpoint
- **Objective:** Support password registration and login via JWT.
- **Complexity:** Medium (3 Story Points)
- **Files Impacted:**
  - `server/server.js`
  - `server/controllers/authController.js`
  - `server/models/User.js`
- **Dependencies:** None
- **Acceptance Criteria:** Successful logins set cookies. Invalid requests receive `400/401` codes.

### Task 1.2: Mock OAuth Middleware Redirections
- **Objective:** Simulate social authentication callbacks.
- **Complexity:** Low (1 Story Point)
- **Files Impacted:** `server/routes/auth.js`
- **Dependencies:** Task 1.1

---

## Epic 2: Profile Management

### Task 2.1: Student Profile Onboarding Forms
- **Objective:** Build multi-step details capture screens.
- **Complexity:** Medium (3 Story Points)
- **Files Impacted:** `client/src/pages/OnboardingPage.jsx`
- **Dependencies:** Task 1.1
- **Acceptance Criteria:** Real-time form validations block invalid submissions.

### Task 2.2: PDF Resume Uploader
- **Objective:** Enable CV upload to Cloudinary CDN.
- **Complexity:** Medium (3 Story Points)
- **Files Impacted:**
  - `server/middleware/uploadMiddleware.js`
  - `server/services/storageService.js`
- **Dependencies:** Task 2.1
- **Acceptance Criteria:** Rejects non-PDF files and files larger than 5MB.
