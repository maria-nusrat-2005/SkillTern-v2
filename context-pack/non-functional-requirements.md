# Non-Functional Requirements: Skilltern

This document lists the operational, performance, scalability, and quality metrics for the Skilltern platform.

## Performance Targets
- **Response Time:**
  - Standard API requests must return in `< 300 ms` under normal load conditions.
  - Intelligent match calculations must execute in `< 1.0 seconds` for a user profile against 100+ active listings.
- **Page Load Time:** First Contentful Paint (FCP) must complete in `< 2.0 seconds` on standard 3G network connections.
- **Concurrency:** The system must handle up to 50 concurrent active users on standard server deployments.

## Security Constraints
- **Data Protection:** Passwords must be hashed using bcrypt before database storage.
- **Authentication Credentials:** JWT tokens must be sent via secure, HttpOnly, SameSite cookies to protect against XSS and CSRF attacks.
- **Input Sanitization:** All API endpoints must use express-validator/Yup schemas to sanitize inputs against cross-site scripting (XSS) and SQL/NoSQL injections.
- **Encryption:** Secure Sockets Layer (HTTPS) must be enabled on all production client and server endpoints.

## Scalability & Deployment
- **Database Indexes:** Compound indexes must be configured on fields like `skills` and `userId` to maintain quick lookup speeds.
- **Modular Codebase:** Adherence to clear MVC-Service boundaries to ease potential transition into serverless microservices in the future.
- **Portability:** Containerization or simple cloud runtime configs to run on standard platform services (Vercel, Render, Railway).
