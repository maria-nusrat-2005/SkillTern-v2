# Project Glossary: Skilltern

This document lists key domain terminology and system abbreviations used across the Skilltern platform code and documentation.

- **Actor:** A user class with specific system access permissions (Student, Recruiter, Administrator).
- **Match Score:** A percentage-based calculated rank (0% - 100%) indicating how closely a student's profile aligns with an internship post.
- **Skill Gap:** The set difference representing required skills listed in an internship post that are not present on a viewing student's profile.
- **Double-Blind Review:** A rating workflow where students and company recruiters review each other independently after internship completion. Neither review score is displayed publicly until both have submitted their reviews.
- **Onboarding:** The initial multi-step process where a registered user inputs their profile details (skills, university for students; brand logo, website for recruiters) to initialize matching.
- **Recruiter Verification:** The administrative status (`verified: true/false`) denoting whether a recruiter has been authenticated by an Administrator.
- **JWT (JSON Web Token):** A secure, signed token used for authorizing REST API requests, stored in HTTP-only cookies.
- **RBAC (Role-Based Access Control):** Permissions model restricting API route executions to specific user roles (student, recruiter, admin).
- **ADR (Architectural Decision Record):** A document capturing a technical decision, context, and consequences.
