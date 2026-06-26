# Feature Code Relationships Map: Skilltern

This document maps user features to their physical implementation resources (UI components, API routes, controller methods, database queries, and test modules).

## Feature Pipeline Mapping

### 1. Feature: Account Registration & Verification
- **Functional Requirements:** `REQ-AUTH-01`, `REQ-ADM-01`
- **UI Screen:** `/register` ➔ `RegisterPage.jsx`
- **API Endpoint:** `POST /api/auth/register`
- **Controller Method:** `AuthController.register`
- **DB Operations:** `User.create()`, `StudentProfile.create()` (if student role chosen).
- **Test File:** `server/tests/auth.test.js`

### 2. Feature: Smart Internship Board
- **Functional Requirements:** `REQ-INT-02`, `REQ-MCH-01`
- **UI Screen:** `/dashboard` ➔ `StudentDashboard.jsx` (utilizes `MatchBadge.jsx`)
- **API Endpoint:** `GET /api/matches`
- **Controller Method:** `MatchController.getDashboardMatches`
- **Service Dependency:** `MatchingService.getRecsForStudent`
- **DB Operations:** Reads `student_profiles` skills array, executes `$in` search on `internships.requiredSkills`, caches outputs in `match_records`.
- **Test File:** `server/tests/matching.test.js`

### 3. Feature: Skill Gap & Learning Paths
- **Functional Requirements:** `REQ-GAP-01`, `REQ-GAP-02`
- **UI Screen:** `/internships/:id` ➔ `InternshipDetails.jsx` (utilizes `MatchDetailsCard.jsx`)
- **API Endpoint:** `GET /api/matches/:internshipId`
- **Controller Method:** `MatchController.getMatchAnalysis`
- **Service Dependency:** `MatchingService.calculateScore`
- **DB Operations:** Reads single `internships` required skills list, processes difference set array comparison against student's profile.
- **Test File:** `server/tests/gap.test.js`
