# Core Business Services Model: Skilltern

This document specifies the service layer boundaries, responsibility breakdown, and dependencies.

## 1. MatchingService (`services/matchingService.js`)
- **Responsibility:** Main algorithm coordinator. Runs score math, builds gap reports, and manages caches.
- **Methods:**
  - **`calculateScore(studentProfile, internship)`**
    - Returns `{ score, matchedSkills, missingSkills }`.
    - Handles string normalization and array intersections.
  - **`getRecsForStudent(studentId)`**
    - Fetches the student's profile, scans published postings, runs score calculations, writes cached records to `match_records`, and returns listings sorted by score.

## 2. NotificationService (`services/notificationService.js`)
- **Responsibility:** Manages double-dispatch (in-app DB logs + external email delivery).
- **Methods:**
  - **`sendNotification(recipientId, type, title, message)`**
    - Saves notification document to database.
    - Resolves recipient profile email addresses.
    - Dispatches SMTP messages via SendGrid/Nodemailer templates.

## 3. StorageService (`services/storageService.js`)
- **Responsibility:** Integrates Cloudinary uploads and handles file checks.
- **Methods:**
  - **`uploadBuffer(fileBuffer, folder, allowedExtensions)`**
    - Streams buffers directly to Cloudinary folder locations.
    - Returns secure URL links.
