# Architectural Decision Record: 0001-project-foundation

- **Status:** Approved
- **Date:** 2026-06-06
- **Context:** Deciding on the baseline technology stack, UI styling framework, and server structure for bootstrapping the Skilltern internship platform.

## Decision
We adopt the classic MERN stack (React, Node, Express, MongoDB) supplemented by:
1. **Zustand** instead of Redux for frontend state management, keeping state logic thin, boilerplate-free, and easy to maintain.
2. **Tailwind CSS & Shadcn UI** for client styling, ensuring fully responsive, modern dark-mode surfaces.
3. **Mongoose ODM** on the backend to enforce schema validation at the application level while retaining NoSQL schema flexibility.
4. **JWT in HTTP-Only Cookies** for secure, stateless user session management.

## Rationale
- **Development Velocity:** MERN stacks allow developers to share JavaScript types and data models across client and server workspaces.
- **Maintainability:** Zustand offers a minimal learning curve and clean, readable code compared to Redux Toolkit.
- **Security:** HTTP-Only cookies mitigate XSS access token extraction risks compared to storing tokens in local storage.

## Consequences
- Requires strict cookie configuration (`sameSite: 'strict'`, `secure: true`) which requires HTTPS on all local/dev staging endpoints.
- Require careful multikey indexing on MongoDB arrays (skills lists) to prevent full collections scans when running matching algorithms.
