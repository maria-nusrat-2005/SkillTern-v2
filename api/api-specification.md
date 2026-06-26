# API Specifications (API Contract): Skilltern

This document specifies the exact endpoints, request/response headers, body payloads, and query structures.

> **See also:** [`api/SKILLTERN_API.md`](./SKILLTERN_API.md) for the comprehensive implemented-API reference (29 endpoints, full validation rules, matching engine internals, double-blind semantics, error model, and implementation status).

---

## 1. Authentication Endpoints

### Register Account
- **Endpoint:** `POST /api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@university.edu",
  "password": "SecurePassword1!",
  "role": "student"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "role": "student"
  }
}
```

### Sign In
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
```json
{
  "email": "jane@university.edu",
  "password": "SecurePassword1!"
}
```
- **Response (200 OK):**
  - **Set-Cookie:** `token=<jwt_string>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "role": "student"
  }
}
```

---

## 2. Profile Management Endpoints

### Update Student Profile
- **Endpoint:** `PUT /api/students/profile`
- **Authorization:** Bearer token or cookie required.
- **Request Body:**
```json
{
  "university": "State University",
  "degree": "B.Sc. Computer Science",
  "graduationYear": 2027,
  "skills": ["React", "JavaScript", "Node.js"],
  "interests": ["Web Development", "AI"],
  "projects": [
    {
      "title": "E-Commerce App",
      "description": "Full stack marketplace built with React and Express",
      "technologies": ["React", "Express", "MongoDB"]
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": {
    "userId": "60d21b4667d0d8992e610c85",
    "university": "State University",
    "degree": "B.Sc. Computer Science",
    "graduationYear": 2027,
    "skills": ["React", "JavaScript", "Node.js"],
    "interests": ["Web Development", "AI"],
    "projects": [...]
  }
}
```

---

## 3. Matching & Recommendations Endpoints

### Get Matching Feed (Dashboard Recommendation)
- **Endpoint:** `GET /api/matches`
- **Authorization:** Role: `student` required.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Recommendations retrieved successfully.",
  "data": [
    {
      "internshipId": "60d21b4667d0d8992e610c99",
      "title": "Frontend Web Intern",
      "companyName": "TechCorp",
      "score": 85,
      "matchedSkills": ["React", "JavaScript"],
      "missingSkills": ["CSS Grid"]
    }
  ]
}
```
| Code | Scenario | Payload |
| --- | --- | --- |
| `200` | Success | Returns listing array sorted by descending score. |
| `401` | Unauthorized | Session missing/expired. |

---

## 4. Double-Blind Review Endpoints

### Submit Internship Rating & Review
- **Endpoint:** `POST /api/ratings`
- **Authorization:** Authenticated user session required.
- **Request Body:**
```json
{
  "internshipId": "60d21b4667d0d8992e610c99",
  "revieweeId": "60d21b4667d0d8992e610c85",
  "rating": 5,
  "review": "Excellent project guidance and highly supportive team!"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Review submitted successfully.",
  "data": {
    "id": "60d21b4667d0d8992e610d10",
    "internshipId": "60d21b4667d0d8992e610c99",
    "reviewerId": "60d21b4667d0d8992e610c86",
    "revieweeId": "60d21b4667d0d8992e610c85",
    "type": "StudentToCompany",
    "rating": 5,
    "review": "Excellent project guidance and highly supportive team!"
  }
}
```

### Get Reviews for Internship
- **Endpoint:** `GET /api/ratings/internship/:internshipId`
- **Authorization:** Public (subject to double-blind visibility rules).
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Reviews retrieved successfully.",
  "data": [
    {
      "reviewerName": "Jane Doe",
      "rating": 5,
      "review": "Great experience!",
      "createdAt": "2026-06-07T00:00:00Z"
    }
  ]
}
```

---

## 5. Recruiter Verification Endpoints (Admin Only)

### List All Recruiter Profiles
- **Endpoint:** `GET /api/admin/recruiters`
- **Authorization:** Role: `admin` required.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Recruiters retrieved successfully.",
  "data": [
    {
      "id": "60d21b4667d0d8992e610c77",
      "companyName": "TechCorp",
      "website": "https://techcorp.com",
      "verified": false
    }
  ]
}
```

### Verify Recruiter Profile
- **Endpoint:** `PUT /api/admin/recruiters/:userId/verify`
- **Authorization:** Role: `admin` required.
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Recruiter profile verified successfully.",
  "data": {
    "userId": "60d21b4667d0d8992e610c77",
    "companyName": "TechCorp",
    "verified": true
  }
}
```
