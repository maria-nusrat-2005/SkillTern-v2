# Tech Stack Specification: Skilltern

This document records the exact technology stack, libraries, and design justification for the Skilltern platform.

## Frontend Architecture Stack
- **Library:** React (v18+) - Component-based SPA architecture.
- **Build Tool:** Vite - Rapid local development server and optimized rollup production bundles.
- **Language:** JavaScript (ES6+).
- **Routing:** React Router (v6) - Declarative UI routing, client-side redirecting, and nested layout shells.
- **State Management:** Zustand - Lightweight, boilerplate-free global state management for auth context and UI layouts.
- **Data Fetching:** Axios - HTTP client with interceptors for attaching bearer tokens and general error logging.
- **Form Management:** React Hook Form & Yup - Performance-focused schema validation and error feedback.
- **Styling:** Tailwind CSS - Utility-first CSS classes for fully responsive, custom layout design.
- **Component Library:** Shadcn UI (using Radix Primitives) - Accessible components (modals, dropdowns, tables).
- **Icons:** Lucide Icons - Standardized modern svg icons.

## Backend Architecture Stack
- **Runtime:** Node.js - Event-driven, asynchronous server runner.
- **Framework:** Express.js - Modular controller routing, middleware pipeline, and REST APIs.
- **Database ODM:** Mongoose - Strongly typed schema validation and query helpers for MongoDB.
- **Authentication:** JSON Web Tokens (JWT) - Stateless session authorization stored in HTTP-Only cookies.
- **Cryptography:** Bcrypt - Blowfish encryption algorithm for secure salted password hashing.
- **Security Middlewares:**
  - **Helmet:** Secure HTTP headers setup to prevent clickjacking and sniffing.
  - **CORS:** Restricts cross-origin resource requests to whitelist client domains.
  - **Express Rate Limit:** Prevents brute force password requests.
  - **MongoDB Sanitize:** Protects against MongoDB operator injection.
- **File Upload:** Cloudinary - Content delivery network for hosting profile images and CV PDFs.
- **Mailing Service:** Nodemailer - Integration with SMTP services (Gmail for dev, SendGrid/Brevo for prod).

## Database & Infrastructure
- **Database:** MongoDB Atlas - Managed cloud document database.
- **Deployment Platform:**
  - **Frontend:** Vercel (ideal for React SPAs).
  - **Backend:** Render/Railway (ideal for Express web servers).
  - **Database:** MongoDB Atlas (free tier/serverless cluster).
