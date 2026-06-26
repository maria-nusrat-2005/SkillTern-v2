# Product Specification: Skilltern

This document describes the product requirements, target user personas, system actors, and overall functional scope for the Skilltern matching platform.

## User Personas & System Actors

### 1. Student
- **Role:** Primary seeker of internships.
- **Responsibilities:**
  - Create and manage a personal profile (academic details, skills, projects, work experience).
  - Upload resumes (CVs) and link portfolio accounts.
  - View matched internship recommendations and bookmark listings.
  - Review match scoring details and learn from skill gap analyses.
  - Apply for internships and track application statuses.
  - Rate and review internship experiences upon completion.

### 2. Recruiter
- **Role:** Representative of hiring companies.
- **Responsibilities:**
  - Create and manage company profile information.
  - Create, publish, edit, and close/archive internship postings.
  - View candidates, check their matching scores, and analyze matched/missing skills.
  - Shortlist candidates, write recruiter notes, and update application status.
  - Rate and review interns after completion.

### 3. Administrator
- **Role:** Platform quality and moderator supervisor.
- **Responsibilities:**
  - Oversee user and recruiter registration/verification.
  - Moderating internship postings (reviewing reported content, removing listings).
  - Monitor platform usage metrics and analytics dashboard.

---

## MVP Scope vs. Future Phase Plan

### Phase 1: Core Platform (Current MVP)
- **Authentication:** Student & recruiter login/registration (including OAuth support).
- **Profiles:** Onboarding layouts for students and recruiters.
- **Internship Management:** CRUD operations for internship posts.
- **Application Flow:** Basic apply, status tracking (Applied ➔ Under Review ➔ Shortlisted ➔ Accepted ➔ Completed / Rejected).

### Phase 2: Smart Matching (MVP)
- **Matching Engine:** Rule-based matching score generation.
- **Recommendations:** Personalized dashboard recommendations feed.
- **Match Explanation:** Visual interface explaining match scores.

### Phase 3: Career Intelligence
- **Skill Gap Analysis:** Automated missing skills finder with learning suggestions.
- **Bookmarking:** Bookmark internships.
- **Feedback Loop:** Post-completion rating and reviews system.
- **Dashboards:** Metrics dashboard for students, recruiters, and admins.

### Phase 4: Advanced AI Features (Post-MVP)
- **Resume Parsing:** Automatic parsing of PDFs to auto-fill profiles.
- **AI Recommendation Engine:** Semantic search using vector embeddings.
- **Career Coach:** Generative AI chatbot for profile reviews and mock interview preparation.
