# Feature Specification: Skilltern

This document describes the functional modules, core flows, and key acceptance criteria for the Skilltern platform.

## 1. Authentication & Security (Phase 1)
- **Feature description:** Allow users to register, sign in using local credentials or Google/LinkedIn OAuth, and safely log out.
- **Rules:**
  - Password strength validation: minimum 8 characters, 1 number, 1 special character.
  - BCrypt salt rounds = 10.
  - JWT expiry = 24 hours (15m for access token, 7d refresh token if advanced setup is used; standard MVP setup will use 24h cookie token).
- **Acceptance Criteria:**
  - Reject duplicate email signups with a `400` code.
  - Prevent access to protected dashboards if the cookie token is missing or corrupted (`401`).

## 2. Onboarding & Profile Management (Phase 1)
- **Feature description:** Profile setup forms to maximize matching capabilities.
- **Attributes Required:**
  - Students: University name, Degree title, Graduation Year, Skills array (selected from pre-defined list or custom), Interests array, Portfolio links, and CV Upload (PDF, max 5MB).
  - Recruiters: Company Name, Logo image, Website url, Industry type, and Company description.
- **Acceptance Criteria:**
  - Block upload of files that are not `.pdf` or `.docx` for resumes.
  - Recruiter status is set to `verified: false` by default; they can post internships but they are visible only to the recruiter until verified by an Administrator.

## 3. Internship Postings CRUD (Phase 1)
- **Feature description:** Job board management interface.
- **Fields:** Title, Category, Location, Type (Remote/Hybrid/Onsite), Description, Required Skills list, Duration, Stipend amount, Application Deadline.
- **Acceptance Criteria:**
  - Prevents non-recruiters or unauthenticated users from making `POST/PUT/DELETE` requests.
  - Recruiters cannot edit or delete posts created by other companies.

## 4. Matching & Recommendations Engine (Phase 2)
- **Feature description:** Automated matching based on student profile features vs internship metadata requirements.
- **Rules:**
  - Matching score calculation:
    - Skill Match (50%): Number of matching skills / Total required skills.
    - Interest Match (30%): Number of matching interests / Total categories/roles.
    - Experience Match (20%): Evaluated based on past project description keyword matches or past role counts.
- **Acceptance Criteria:**
  - Automatically calculate match score whenever a student views an internship.
  - Cache results in `match_records` collection to avoid CPU bottleneck.

## 5. Skill Gap Analysis & Explanations (Phase 3)
- **Feature description:** Show missing skills, gap percentages, and learning path links.
- **Acceptance Criteria:**
  - Displays missing skills highlighted in red.
  - Provides a dynamic recommendation text showing: "Acquiring [Missing Skills] will boost your match probability by [X]%".
