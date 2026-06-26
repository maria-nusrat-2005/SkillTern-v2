# API Testing Documentation: Authentication (JWT)

This documentation provides comprehensive details for testing and interacting with the JWT-based authentication API in the Skilltern platform.

---

## 1. Authentication Architecture Overview

Skilltern utilizes **JSON Web Tokens (JWT)** for session authentication.
- **Session Delivery:** The server issues a signed JWT token and stores it in an HTTP-only, secure, SameSite=Strict cookie named `token`.
- **Validation:** For requests to protected routes, the server's `protect` middleware automatically checks and validates the `token` cookie (or the `Authorization: Bearer <token>` header).
- **Session Lifetime:** 24 Hours.

---

## 2. API Endpoints Specification

### A. Register Account
Creates a new student or recruiter user and automatically initializes their respective profile document in the database.

- **HTTP Method:** `POST`
- **URL:** `/api/auth/register`
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "password": "SecurePassword1!",
    "role": "student"
  }
  ```
- **Validation Rules:**
  - `name`: String (2-50 characters), required.
  - `email`: Valid email format, required.
  - `password`: Min 8 characters, must contain at least 1 uppercase letter, 1 number, and 1 special character.
  - `role`: Must be one of `['student', 'recruiter']`.
- **Responses:**
  - **`201 Created`** on success. Sets the `token` cookie.
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
  - **`400 Bad Request`** on validation errors (e.g. weak password, missing fields) or duplicate email.
    ```json
    {
      "success": false,
      "message": "An account with this email already exists"
    }
    ```

---

### B. Sign In (Login)
Authenticates a user by credentials and generates a signed JWT session cookie.

- **HTTP Method:** `POST`
- **URL:** `/api/auth/login`
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "email": "jane@university.edu",
    "password": "SecurePassword1!"
  }
  ```
- **Responses:**
  - **`200 OK`** on successful credentials match. Sets `token` cookie.
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
  - **`401 Unauthorized`** on invalid email or incorrect password.
    ```json
    {
      "success": false,
      "message": "Invalid email or password"
    }
    ```

---

### C. Sign Out (Logout)
Clears the client session cookie.

- **HTTP Method:** `POST`
- **URL:** `/api/auth/logout`
- **Headers:** Requires validation cookie `token` or Bearer token header.
- **Responses:**
  - **`200 OK`** clears cookie.
    ```json
    {
      "success": true,
      "message": "Logged out successfully.",
      "data": null
    }
    ```

---

### D. Get Current User (`/me`)
Returns the currently authenticated user's credentials and their profile details.

- **HTTP Method:** `GET`
- **URL:** `/api/auth/me`
- **Headers:** Requires validation cookie `token` or Bearer token header.
- **Responses:**
  - **`200 OK`** on authenticated state:
    ```json
    {
      "success": true,
      "message": "User profile retrieved successfully.",
      "data": {
        "id": "60d21b4667d0d8992e610c85",
        "name": "Jane Doe",
        "email": "jane@university.edu",
        "role": "student",
        "profileImage": "",
        "createdAt": "2026-06-15T00:00:00.000Z",
        "profile": {
          "userId": "60d21b4667d0d8992e610c85",
          "university": "State University",
          "degree": "B.Sc. Computer Science",
          "skills": ["JavaScript", "React"],
          "interests": ["Web Development"]
        }
      }
    }
    ```
  - **`401 Unauthorized`** if the token is missing or invalid.
    ```json
    {
      "success": false,
      "message": "Not authorized, session token missing"
    }
    ```

---

## 3. Manual Testing Guidelines (cURL)

Since the server uses Cookies, you should configure cURL to save and send cookies using a jar file (e.g. `cookies.txt`).

### Step 1: Register Account
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"name":"Tester","email":"test@univ.edu","password":"Password123!","role":"student"}'
```

### Step 2: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@univ.edu","password":"Password123!"}'
```

### Step 3: Get Current User (Sends Cookie back)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -b cookies.txt
```

### Step 4: Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

## 4. Automated Testing Guidelines (Jest & Supertest)

The automated test suite in `server/__tests__/auth.test.js` covers integration scenarios for all of these endpoints using a mocked database model strategy.

### Run Auth Tests Specifically:
```bash
npm run test -- __tests__/auth.test.js
```
This test covers:
- Successful student & recruiter registration.
- Rejection of duplicate registration emails.
- Schema validations (such as failing on weak passwords).
- Correct cookie issuance on login/register.
- Error code assertions (`401` on invalid passwords, `400` on validation failures).
- Cookie clearance assertions on logout.
