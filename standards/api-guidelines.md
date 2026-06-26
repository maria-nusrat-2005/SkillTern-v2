# API Guidelines: Skilltern

This document specifies the REST design rules, JSON responses, and HTTP error code standards.

## 1. REST Conventions
- Prefix all routes with `/api`.
- Use plural resource nouns: `/api/internships` instead of `/api/internship`.
- Map actions to appropriate HTTP verbs:
  - `GET`: Read operations.
  - `POST`: Create operations.
  - `PUT`: Update/modify operations.
  - `DELETE`: Archive/remove operations.

## 2. Response & Error Standards
- Every route handler must return a standardized JSON wrapper:
  - Success: `{ success: true, message: String, data: Object }`.
  - Failure: `{ success: false, message: String, errors: Array }`.
- Ensure all exceptions are routed through the global error handling middleware.
