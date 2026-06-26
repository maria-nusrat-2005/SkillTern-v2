# API Controller Signatures: Skilltern

This document specifies the controller signatures, parameters, and response profiles for all route handlers.

## 1. AuthController (`controllers/authController.js`)
- **`register(req, res, next)`**
  - **Payload:** `{ name, email, password, role }`
  - **Behavior:** Invokes `AuthService.createUser`, returns user data, and redirects student onboarding if needed.
- **`login(req, res, next)`**
  - **Payload:** `{ email, password }`
  - **Behavior:** Invokes `AuthService.authenticateUser`, sets JWT token cookie, returns JSON success packet.
- **`logout(req, res, next)`**
  - **Behavior:** Clears secure token cookie, returns success message.
- **`getMe(req, res, next)`**
  - **Behavior:** Reads `req.user.id`, fetches active profile, and returns user details.

## 2. StudentController (`controllers/studentController.js`)
- **`getProfile(req, res, next)`**
  - **Behavior:** Fetches `StudentProfile` mapped to `req.user.id`.
- **`updateProfile(req, res, next)`**
  - **Payload:** `{ university, degree, graduationYear, skills, interests, projects }`
  - **Behavior:** Saves profile updates, returns updated document representation.
- **`uploadCV(req, res, next)`**
  - **Payload:** `multipart/form-data` (field: `cv`)
  - **Behavior:** Submits file stream to Cloudinary, stores returned link in profile record.

## 3. InternshipController (`controllers/internshipController.js`)
- **`list(req, res, next)`**
  - **Parameters:** `page`, `limit`, `search`, `location`, `internshipType` (req.query)
  - **Behavior:** Returns array of published posts.
- **`create(req, res, next)`**
  - **Payload:** `{ title, category, location, internshipType, description, requiredSkills, duration, stipend, applicationDeadline }`
  - **Behavior:** Stores listing under recruiter ID.
- **`update(req, res, next)`**
  - **Behavior:** Verifies posting belongs to recruiter, updates listing details.
- **`delete(req, res, next)`**
  - **Behavior:** Verifies owner, soft-deletes or archives internship.

## 4. ApplicationController (`controllers/applicationController.js`)
- **`submit(req, res, next)`**
  - **Payload:** `{ internshipId }`
  - **Behavior:** Validates state parameters, creates application with state `Applied`.
- **`list(req, res, next)`**
  - **Behavior:**
    - If student: Fetches applications matching `studentId`.
    - If recruiter: Fetches applications matching recruiter's postings.
- **`updateStatus(req, res, next)`**
  - **Payload:** `{ status, recruiterNotes }`
  - **Behavior:** Updates state, dispatches status change email and notification events.

## 5. RatingController (`controllers/ratingController.js`)
- **`createReview(req, res, next)`**
  - **Payload:** `{ internshipId, revieweeId, rating, review }`
  - **Behavior:** Validates that the internship is Completed for the student. Determines type (StudentToCompany or CompanyToStudent) based on role, saves review, and checks double-blind status.
- **`getInternshipReviews(req, res, next)`**
  - **Behavior:** Fetches reviews for a given internship, filtering out reviews that fail double-blind verification (unless requested by the reviewer themselves).
- **`getUserReviews(req, res, next)`**
  - **Behavior:** Fetches reviews received by a user, filtered by double-blind complete visibility rules.

## 6. AdminController (`controllers/adminController.js`)
- **`listRecruiters(req, res, next)`**
  - **Behavior:** Returns list of all recruiter profiles for administrative review.
- **`verifyRecruiter(req, res, next)`**
  - **Behavior:** Locates target recruiter profile by userId and updates `verified = true`.
