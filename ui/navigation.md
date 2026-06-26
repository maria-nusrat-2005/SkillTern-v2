# Client Route Protection & Navigation: Skilltern

This document describes client-side access control, routes redirection, and navigation menu structures.

## Navigation Layout Strategy

### 1. Student Dashboard Navigation
- **Home Feed (`/dashboard`):** Personalized match recommendations feed.
- **Bookmarks (`/bookmarks`):** Saved internships.
- **Applications (`/applications`):** Submitted application list and timelines.
- **Profile (`/profile`):** CV uploads, skills selections, and portfolio configuration.

### 2. Recruiter Dashboard Navigation
- **Job Postings (`/recruiter/dashboard`):** Active job postings tables and statistics.
- **Hiring Candidates (`/applications`):** Recruiter review panel for active applicant cards.
- **Profile (`/profile`):** Corporate branding settings.

---

## Client Route Guard Implementation
All client routes are wrapped inside conditional wrappers:
- **`GuestRoute`:** Check for auth session presence; redirect to `/` (dashboard) if logged in.
- **`ProtectedRoute`:** Checks auth state; if missing, redirects to `/login`.
- **`RoleGuard`:** Extends `ProtectedRoute` by validating roles (e.g. checking `user.role === 'recruiter'` before routing to `/recruiter/dashboard`).
