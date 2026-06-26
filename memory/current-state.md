# System Current State: Skilltern

This document captures the current development status, deployment parameters, and configuration properties.

## Current Session Status
- **Phase:** Post-Production Verification & Maintenance.
- **Active Task:** Create and optimize root gitignore rules.
- **Last Completed:** Updated root `.gitignore` to comprehensively ignore dependency directories, environment configurations, production build outputs, local server uploads, log files, temporary editor files, and `.gemini`/`.puku` tool workspace folders.

---

## Completed Work
- **Git Config Maintenance:** Added root-level `.gitignore` configured for monorepo structure.
- **Auth Fix & Verification:** Resolved the infinite reload redirect loop on unauthorized API requests, and verified all core authentication flows on client and server sides. Created detailed API testing documentation.
- **Phase 1 (Discovery):** Formatted PRD, established context packs, database schemas, API specs, and UI architecture docs.
- **Phase 2 (Foundation):** Installed dependencies, configured Vite/Tailwind/PostCSS, created `.env` template, wired all Express routes.
- **Phase 3 (Backend REST):** Implemented auth controllers (register/login/logout/getMe), student profile CRUD with CV upload, recruiter profile CRUD, internship CRUD with ownership checks and verification gates, application management with role-aware queries, and Yup validation middleware.

---

## Active Environment Context
- **Operating System:** Windows Local Workstation.
- **Node.js:** v18+ (server dependencies installed, all modules verified).
- **Client Root:** `c:\SMUCT_Project\SkillTern\client\` (Vite build verified, 97 modules transformed).
- **Server Root:** `c:\SMUCT_Project\SkillTern\server\` (214 packages installed, all routes loading).
- **Database:** MongoDB connection configured via `MONGO_URI` env variable (default: `mongodb://localhost:27017/skilltern`).

---

## Server Architecture Summary
```text
server/
├── config/db.js                    # Mongoose connection
├── controllers/
│   ├── authController.js           # register, login, logout, getMe
│   ├── studentController.js        # getProfile, updateProfile, uploadCV
│   ├── recruiterController.js      # getProfile, updateProfile
│   ├── internshipController.js     # list, getById, create, update, delete
│   └── applicationController.js    # submit, listApplications, updateStatus
├── middleware/
│   ├── authMiddleware.js           # protect (JWT), authorize (RBAC)
│   ├── errorMiddleware.js          # Centralized error handler
│   └── validate.js                 # Yup validation factory
├── models/
│   ├── User.js                     # Auth credentials + bcrypt hooks
│   ├── StudentProfile.js           # Skills, projects, CV
│   ├── RecruiterProfile.js         # Company info, verification
│   ├── Internship.js               # Job postings + compound indexes
│   ├── Application.js              # Unique compound on student+internship
│   ├── Bookmark.js                 # Saved listings
│   ├── MatchRecord.js              # Cached match scores
│   ├── Notification.js             # In-app alerts
│   └── Rating.js                   # Double-blind reviews
├── routes/
│   ├── authRoutes.js
│   ├── studentRoutes.js
│   ├── recruiterRoutes.js
│   ├── internshipRoutes.js
│   └── applicationRoutes.js
├── utils/generateToken.js          # JWT sign + cookie setter
├── server.js                       # Express entry + middleware pipeline
├── package.json
└── .env
```
