# Compressed Context Index: Skilltern

This document serves as a 3-minute quick-start guide for developer agents onboarding onto the Skilltern project workspace.

---

## 1. Executive Summary
Skilltern is a MERN-stack internship matching platform designed to connect students with opportunities through data-driven matching and skill gap insights.

## 2. Directory Architecture Map
```text
c:\SMUCT_Project\SkillTern\
│
├── project-brief.md           # Master requirement PRD (Source of Truth)
│
├── context-pack/              # Machine-readable architectural docs
│   ├── overview.md            # Vision & Mission
│   ├── product.md             # Persona & Roles
│   ├── architecture.md        # MVC flow diagrams
│   ├── tech-stack.md          # Tool lists
│   └── database.md            # Schema definitions
│
├── database/                  # Detailed ERD & Indexes
├── api/                       # API spec endpoints
├── ui/                        # UI layouts and states
├── decisions/                 # Architectural Decision Records (ADRs)
├── memory/                    # Living developer state (Current logs)
├── tasks/                     # Milestone task files and backlogs
├── standards/                 # Coding guidelines & conventions
└── PROJECT_CONSTITUTION.md    # Highest level governance rules
```

---

## 3. Core Tech & Coding Norms
- **Frontend:** React, JavaScript, React Router, Zustand (Global state), Axios, Tailwind CSS, Shadcn UI.
- **Backend:** Node.js, Express.js, MongoDB Atlas (via Mongoose), JWT (Secure httpOnly cookies), Bcrypt (Password hashing).
- **Core Security:** Helmet, CORS, Express Rate Limit, MongoDB Sanitize.
- **API Spec Rules:** Base route `/api`. Centralized JSON signature return type. JWT session checks on private endpoints.

---

## 4. Operational Matching Formula
$$\text{Match Score} = (\text{Skill Match} \times 0.50) + (\text{Interest Match} \times 0.30) + (\text{Experience Match} \times 0.20)$$

---

## 5. Development Steps Workflow
Before modifying code:
1. Read `AGENTS.md` and check `memory/current-state.md` to see what is currently under development.
2. Read relevant `context-pack/` documents.
3. Keep database schemas, controllers, and tests aligned with the requirements listed in `context-pack/requirements.md`.
4. Update `memory/current-state.md` and `memory/implementation-progress.md` before concluding your session.
