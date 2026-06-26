# Security Guidelines: Skilltern

This document specifies the security constraints, encryption keys, and request filter properties.

## 1. Authentication Security
- Save JWT tokens inside secure, httpOnly cookies.
- Set reasonable token expiration durations (e.g. 24 hours).
- Use Bcrypt with a salt factor of 10 to hash passwords before storage.

## 2. API Defense
- Configure `helmet` to establish secure HTTP headers.
- Restrict cross-origin lookups using CORS policies.
- Configure rate limiters (`express-rate-limit`) on key authentication entry points.
- Block MongoDB operator injection payloads using `express-mongo-sanitize`.
- Validate file uploads to ensure only PDF/DOCX formats are accepted.
