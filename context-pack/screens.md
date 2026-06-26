# User Interfaces & Screens: Skilltern

This document details the primary application views, dashboard structures, and widgets for all user roles.

## Shared layouts
1. **Auth Layout:** Centered card interface for login/registration forms (includes social oauth buttons).
2. **Dashboard Layout:** Standard responsive shell featuring:
  - **Sidebar:** Navigation links (discovery feed, profile, bookmarks, notifications, applications) that adjust dynamically based on user role.
  - **Header Navbar:** Logo, search bar, notifications drop-down menu, and user avatar settings menu.
  - **Main Content Area:** Renders children pages.

---

## Student Screens

### 1. Student Dashboard (Internship Discovery)
- **Filters Sidebar:** Filter postings by location, stipend, category, type (Remote, Hybrid, Onsite), and match score threshold.
- **Internships Feed Grid:** Cards containing:
  - Role Title, Company Logo, Location, and Stipend.
  - **Match Score Badge:** Interactive badge showing match score (e.g. `85% Match` in green).
  - Short required skills tags.
- **Active Recommendation Drawer:** Opens when clicking a card. Displays description, match analysis breakdown, and list of missing skills with learning recommendations.

### 2. Student Profile & Settings
- **Identity Card:** Avatar upload, name, email, university, degree, and graduation year.
- **Skills & Projects Panel:** Form to add/edit skill tags and list personal projects with their associated tech stacks.
- **Documents Area:** File upload widget for CV/resume.

### 3. Application Tracker
- List of submitted applications with status badges (`Applied`, `Under Review`, `Shortlisted`, `Accepted`, `Rejected`).
- Interactive timeline tracking updates and feedback.

---

## Recruiter Screens

### 1. Recruiter Dashboard
- **Analytics Header Widgets:** Total job postings, active applicants, and average interview conversion rate.
- **Active Postings Table:** Shows list of jobs with applicant counts and quick action buttons (Edit, Close, Delete).

### 2. Candidate Evaluation Screen
- **Applicant Comparison Grid:** Lists applicants sorted by their match score.
- **Profile Preview Side-panel:** Shows candidate's skills, projects, and a PDF viewer for their resume.
- **Actions Bar:** Dropdown to modify application status, write recruiter notes, and save.
