# Skilltern API JWT Authentication & Verification Guide

This guide describes how to authenticate and test all main API endpoints in the Skilltern application.

## 1. Authentication Mechanisms

The Skilltern backend implements JWT authentication with two compatible options for providing credentials:

### Option A: HTTP-Only Cookies (Browser Default)
When logging in or registering, the backend issues an HTTP-only, secure cookie named `token`. Subsquent requests automatically include this cookie.
- **Cookie Name:** `token`
- **Session Duration:** 24 hours

### Option B: Authorization Headers (Bearer Token)
The backend `protect` middleware also accepts tokens supplied via the standard HTTP Authorization header. This is ideal for command-line clients (e.g. `curl`), Postman, or external client applications.
- **Header format:** `Authorization: Bearer <your_jwt_token>`

When registering or logging in, the response JSON body includes the JWT token under `data.token`.

---

## 2. Step-by-Step Testing Walkthrough

Here is a full end-to-end flow using `curl`. In development, the API base URL is:
```text
http://localhost:5000/api
```

### Step 2.1: Student Authentication & Profile Setup

#### A. Register a Student
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Alex Johnson",
    "email": "alex.student@university.edu",
    "password": "Password1!",
    "role": "student"
  }'
```
*Expected Response (201 Created):*
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "id": "STUDENT_USER_ID",
    "name": "Alex Johnson",
    "email": "alex.student@university.edu",
    "role": "student",
    "token": "eyJhbGciOi..."
  }
}
```

#### B. Log in as the Student (Alternative to Registration)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "alex.student@university.edu",
    "password": "Password1!"
  }'
```
*Expected Response (200 OK):*
- Save the token returned in `"token": "<STUDENT_TOKEN>"` to use in subsequent headers.

#### C. Get Student Profile
```bash
curl -H 'Authorization: Bearer <STUDENT_TOKEN>' http://localhost:5000/api/students/profile
```

#### D. Update Student Profile (Skills and Interests)
The matching engine calculates score matches using skills and interests. Update them:
```bash
curl -X PUT http://localhost:5000/api/students/profile \
  -H 'Authorization: Bearer <STUDENT_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "university": "State University",
    "degree": "B.S. Software Engineering",
    "graduationYear": 2027,
    "skills": ["React", "Node.js", "Express", "JavaScript"],
    "interests": ["Web Development", "Software Engineering"]
  }'
```

---

### Step 2.2: Recruiter Registration

#### A. Register a Recruiter
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Hiring Manager",
    "email": "recruiter@innovativetech.com",
    "password": "Password1!",
    "role": "recruiter"
  }'
```
- Save the token returned in `"token": "<RECRUITER_TOKEN>"`.
- Save the recruiter's user ID returned in `"id": "<RECRUITER_USER_ID>"`.

#### B. Get & Update Recruiter Company Details
```bash
curl -X PUT http://localhost:5000/api/recruiters/profile \
  -H 'Authorization: Bearer <RECRUITER_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "companyName": "Innovative Tech Inc.",
    "website": "https://innovativetech.com",
    "industry": "Technology",
    "companyDescription": "Building next generation SaaS tools."
  }'
```

---

### Step 2.3: Admin Verification of Recruiter

Before a recruiter can publish any internships, their profile must be verified by an Administrator.
For local dev testing, we register an admin manually in MongoDB or register one via the API.
*(Note: A new user's role is validated through the register route. Let's register an admin account to verify recruiters)*

#### A. Register an Admin Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "System Admin",
    "email": "admin@skilltern.com",
    "password": "Password1!",
    "role": "admin"
  }'
```
- Save the token returned as `<ADMIN_TOKEN>`.

#### B. Verify the Recruiter Profile
```bash
curl -X PUT http://localhost:5000/api/admin/recruiters/<RECRUITER_USER_ID>/verify \
  -H 'Authorization: Bearer <ADMIN_TOKEN>'
```

---

### Step 2.4: Internship Management (Recruiter)

#### A. Create an Internship Posting (Starts in Draft)
```bash
curl -X POST http://localhost:5000/api/internships \
  -H 'Authorization: Bearer <RECRUITER_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Frontend Development Intern",
    "category": "Web Development",
    "location": "Remote",
    "internshipType": "Remote",
    "description": "Looking for a React developer to build gorgeous dashboard interfaces.",
    "requiredSkills": ["React", "JavaScript", "HTML", "CSS"],
    "responsibilities": ["Develop UI components", "Optimize layouts"],
    "duration": "3 Months",
    "stipend": "$1,000 / month",
    "applicationDeadline": "2027-12-31T23:59:59Z"
  }'
```
- Save the internship ID returned in `"id": "<INTERNSHIP_ID>"`.

#### B. Publish the Internship
Recruiters must transition their draft internships to `Published` status to make them discoverable.
```bash
curl -X PUT http://localhost:5000/api/internships/<INTERNSHIP_ID> \
  -H 'Authorization: Bearer <RECRUITER_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "Published"
  }'
```

---

### Step 2.5: Matching & Application Lifecycle (Student)

#### A. Browse Internships with Match Scores
Students calling `/api/internships` with their token will automatically receive weighted skill match calculations.
```bash
curl -H 'Authorization: Bearer <STUDENT_TOKEN>' http://localhost:5000/api/internships
```

#### B. View Match Score Breakdown & Gap Analysis
Get a detailed breakdown and suggestion roadmap:
```bash
curl -H 'Authorization: Bearer <STUDENT_TOKEN>' http://localhost:5000/api/matches/<INTERNSHIP_ID>
```

#### C. Apply for the Internship
```bash
curl -X POST http://localhost:5000/api/applications \
  -H 'Authorization: Bearer <STUDENT_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "internshipId": "<INTERNSHIP_ID>"
  }'
```
- Save the application ID returned as `<APPLICATION_ID>`.

---

### Step 2.6: Review & Double-Blind Ratings

#### A. Recruiter Transitions Application to Completed
Only completed internships permit reviews.
```bash
curl -X PUT http://localhost:5000/api/applications/<APPLICATION_ID>/status \
  -H 'Authorization: Bearer <RECRUITER_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "Completed"
  }'
```

#### B. Recruiter Reviews Student
```bash
curl -X POST http://localhost:5000/api/ratings \
  -H 'Authorization: Bearer <RECRUITER_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "internshipId": "<INTERNSHIP_ID>",
    "revieweeId": "<STUDENT_USER_ID>",
    "rating": 5,
    "review": "Outstanding work on modern frontends!"
  }'
```

#### C. Student Reviews Recruiter/Company
```bash
curl -X POST http://localhost:5000/api/ratings \
  -H 'Authorization: Bearer <STUDENT_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "internshipId": "<INTERNSHIP_ID>",
    "revieweeId": "<RECRUITER_USER_ID>",
    "rating": 4,
    "review": "Great mentorship and real responsibilities."
  }'
```

#### D. Fetch Ratings (Revealed after both submit - Double-Blind)
```bash
curl http://localhost:5000/api/ratings/internship/<INTERNSHIP_ID>
```
*(Notice: If only one party has submitted, the reviews remain hidden to prevent bias.)*

---

## 3. General Request/Response Troubleshooting

| Error Code | Reason | Resolution |
|---|---|---|
| **400 Bad Request** | Missing fields or validation errors | Check request body format and types. |
| **401 Unauthorized** | Token missing, wrong prefix, or expired | Supply header as `Authorization: Bearer <token>`. |
| **403 Forbidden** | Role or ownership mismatch | Confirm user has the required role (e.g. `recruiter` for postings). |
| **404 Not Found** | Wrong IDs or incorrect URI | Validate MongoDB ObjectIds in request parameters. |
