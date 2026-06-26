# Requirements Mapping Index: Skilltern

This document maps core requirement IDs to their respective feature modules, API routes, database collections, and test files to ensure complete requirement traceability.

| Req ID | Feature Module | API Routes | DB Collections | Test Modules |
| --- | --- | --- | --- | --- |
| **REQ-AUTH-01** | Authentication | `POST /api/auth/register` | `users` | `tests/auth.test.js` |
| **REQ-AUTH-02** | Authentication | `POST /api/auth/login` | `users` | `tests/auth.test.js` |
| **REQ-PROF-01** | Student Onboarding | `PUT /api/students/profile` | `student_profiles` | `tests/student.test.js` |
| **REQ-PROF-03** | Resume Processing | `POST /api/students/upload-cv` | `student_profiles` | `tests/storage.test.js` |
| **REQ-INT-01** | Internship CRUD | `POST /api/internships`<br>`PUT /api/internships/:id` | `internships` | `tests/internship.test.js` |
| **REQ-MCH-01** | Matching Engine | `GET /api/matches` | `match_records` | `tests/matching.test.js` |
| **REQ-GAP-01** | Skill Gap Analysis | `GET /api/matches/:id` | `match_records` | `tests/gap.test.js` |
| **REQ-APP-01** | Applications | `POST /api/applications` | `applications` | `tests/application.test.js` |
| **REQ-RTG-01** | Rating System | `POST /api/ratings` | `ratings` | `tests/ratings.test.js` |
| **REQ-ADM-01** | Admin Operations | `PUT /api/admin/verify` | `recruiter_profiles` | `tests/admin.test.js` |
