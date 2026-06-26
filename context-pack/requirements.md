# Requirements Traceability Matrix: Skilltern

This document lists all system functional requirements, assigning them IDs for traceability throughout the codebase, tasks, and tests.

| Req ID | Module | Title | Description | MVP |
| --- | --- | --- | --- | --- |
| **REQ-AUTH-01** | Auth | Register User | Allows registration with Email/Password as student or recruiter. | Yes |
| **REQ-AUTH-02** | Auth | OAuth Login | Integrates Google and LinkedIn OAuth login flows. | Yes |
| **REQ-AUTH-03** | Auth | Session Management | Secures authenticated routes with httpOnly cookies. | Yes |
| **REQ-PROF-01** | Profile | Student Setup | Support onboarding forms for student profiles (skills, university). | Yes |
| **REQ-PROF-02** | Profile | Recruiter Setup | Supports recruiter profiles and company descriptions. | Yes |
| **REQ-PROF-03** | Profile | Resume Upload | Support PDF resume uploads (max 5MB limit). | Yes |
| **REQ-INT-01** | Internship | Posting CRUD | Allowed recruiters to create, read, update, and delete internships. | Yes |
| **REQ-INT-02** | Internship | Browse & Filter | Allows students to search and filter active postings. | Yes |
| **REQ-MCH-01** | Matching | Score Calculation | Calculates match scores using skills, interests, and experiences. | Yes |
| **REQ-MCH-02** | Matching | Explanation Badge | Displays reasons for match score in visual breakdown. | Yes |
| **REQ-GAP-01** | Gap Analysis | Missing Skills | Lists missing skills in comparison dashboard. | Yes |
| **REQ-GAP-02** | Gap Analysis | Suggestions | Recommends learning paths/courses for missing skills. | Yes |
| **REQ-APP-01** | Application | Submit Application | Enables students to apply for internships with saved profiles. | Yes |
| **REQ-APP-02** | Application | Status Tracking | Allows student status checks and recruiter evaluation flows. | Yes |
| **REQ-NTF-01** | Notification | In-app alerts | Triggers visual notification alerts on application updates. | Yes |
| **REQ-NTF-02** | Notification | Email updates | Dispatches status change emails to candidate/recruiter. | Yes |
| **REQ-RTG-01** | Ratings | double-blind reviews | Allows post-completion ratings for students and companies. | Yes |
| **REQ-ADM-01** | Admin | Moderation | Enables Admin verification of recruiters and moderation of posts. | Yes |
