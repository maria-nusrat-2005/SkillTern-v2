# API Route Configuration: Skilltern

This document specifies the routing configuration for the Skilltern REST API.

## Auth Routes (`/api/auth`)
- `POST /register` ➔ Calls `AuthController.register`. Public.
- `POST /login` ➔ Calls `AuthController.login`. Public (Rate limited).
- `POST /logout` ➔ Calls `AuthController.logout`. Auth required.
- `GET /me` ➔ Calls `AuthController.getMe`. Auth required.

## Student Profile Routes (`/api/students`)
- `GET /profile` ➔ Calls `StudentController.getProfile`. Auth required, role: `student`.
- `PUT /profile` ➔ Calls `StudentController.updateProfile`. Auth required, role: `student` (Validated).
- `POST /upload-cv` ➔ Calls `StudentController.uploadCV`. Auth required, role: `student` (File upload parser).

## Internship Board Routes (`/api/internships`)
- `GET /` ➔ Calls `InternshipController.list`. Public (supports pagination).
- `GET /:id` ➔ Calls `InternshipController.getById`. Public.
- `POST /` ➔ Calls `InternshipController.create`. Auth required, role: `recruiter`.
- `PUT /:id` ➔ Calls `InternshipController.update`. Auth required, role: `recruiter` (Ownership check).
- `DELETE /:id` ➔ Calls `InternshipController.delete`. Auth required, role: `recruiter` / `admin` (Ownership check).

## Application Routes (`/api/applications`)
- `POST /` ➔ Calls `ApplicationController.submit`. Auth required, role: `student`.
- `GET /` ➔ Calls `ApplicationController.list`. Auth required (Dynamic role query logic).
- `PUT /:id/status` ➔ Calls `ApplicationController.updateStatus`. Auth required, role: `recruiter` (Ownership check).

## Recommendations & Match Routes (`/api/matches`)
- `GET /` ➔ Calls `MatchController.getDashboardMatches`. Auth required, role: `student`.
- `GET /:internshipId` ➔ Calls `MatchController.getMatchAnalysis`. Auth required, role: `student`.

## Ratings & Review Routes (`/api/ratings`)
- `POST /` ➔ Calls `RatingController.createReview`. Auth required.
- `GET /internship/:internshipId` ➔ Calls `RatingController.getInternshipReviews`. Public (enforces double-blind rules).
- `GET /user/:userId` ➔ Calls `RatingController.getUserReviews`. Public (enforces double-blind rules).

## Admin Operations Routes (`/api/admin`)
- `GET /recruiters` ➔ Calls `AdminController.listRecruiters`. Auth required, role: `admin`.
- `PUT /recruiters/:userId/verify` ➔ Calls `AdminController.verifyRecruiter`. Auth required, role: `admin`.
