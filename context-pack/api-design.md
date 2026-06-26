# API Design & Conventions: Skilltern

This document specifies the routing principles, standard endpoints, HTTP status codes, and JSON response formats for the Skilltern REST API.

## API Conventions

- **Base Route:** All API endpoints are prefixed with `/api`.
- **Content Type:** All request and response bodies must contain JSON payload structures.
- **REST Resource Naming:** Use plural nouns for resources (e.g. `/api/internships`, `/api/applications`).
- **HTTP Status Codes:**
  - `200 OK`: Successful read or update actions.
  - `201 Created`: Successful resource insertion.
  - `400 Bad Request`: Validation failure or malformed payload.
  - `401 Unauthorized`: Missing or invalid Bearer/Cookie token.
  - `403 Forbidden`: Insufficient role authorization.
  - `404 Not Found`: Target resource does not exist.
  - `500 Internal Error`: Server runtime failure.

---

## Centralized JSON Response Pattern

All endpoints must return a consistent JSON response signature to ease client parsing:

### 1. Success Response
```json
{
  "success": true,
  "message": "Resource retrieved successfully.",
  "data": { ... }
}
```

### 2. Error Response
```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address format."
    }
  ]
}
```

---

## Global Routing Manifest

### 1. Authentication (`/api/auth`)
- `POST /register`: Registers a new user account.
- `POST /login`: Validates credentials, sets `token` cookie, returns user details.
- `POST /logout`: Clears the cookie token.
- `GET /me`: Returns profile of the current session user.

### 2. Student Profile (`/api/students`)
- `GET /profile`: Retrieves the profile document.
- `PUT /profile`: Updates profile attributes (skills, university, graduationYear).
- `POST /upload-cv`: Uploads a CV file to Cloudinary and saves URL to db.

### 3. Internship Postings (`/api/internships`)
- `GET /`: Lists all published internships (includes pagination, query keyword filters).
- `GET /:id`: Retrieves single listing.
- `POST /`: Creates a posting (Recruiter role only).
- `PUT /:id`: Updates a listing (Owner only).
- `DELETE /:id`: Archives/deletes a listing (Owner or Admin only).

### 4. Applications Management (`/api/applications`)
- `POST /`: Submits application details.
- `GET /`: Lists applications (students see theirs; recruiters see candidates for their postings).
- `PUT /:id/status`: Updates application progress status.

### 5. Matching & Gap Analysis (`/api/matches`)
- `GET /`: Returns matching score feed for student.
- `GET /:internshipId`: Generates/returns specific match breakdown and skill gap report.
