# Skilltern REST API Reference

> **Status:** Implemented in code as of this workspace snapshot. This document reflects what is actually mounted in `server/server.js` and the controllers/services that the routes call.
>
> **Companion documents:**
> - [`api-specification.md`](./api-specification.md) — high-level contract design notes.
> - [`api/routes.md`](./routes.md), [`api/controllers.md`](./controllers.md), [`api/services.md`](./services.md), [`api/validation.md`](./validation.md) — per-layer references.

---

## 1. Conventions

### 1.1 Base URL & environment
- All routes are mounted under the `/api` prefix in `server/server.js`.
- Local development base URL: `http://localhost:<PORT>/api` (PORT defaults to `5000`).
- Health probe (no prefix): `GET /health` → `{ success: true, status: 'OK', message: 'Skilltern API Server is running.' }`.

### 1.2 Authentication
- JWT is issued via `server/utils/generateToken.js` and stored in an `httpOnly`, `sameSite=strict` cookie named `token` (24 h lifetime).
- In production, the cookie is marked `secure: true`.
- The token is signed with `process.env.JWT_SECRET` and falls back to the literal string `fallback_secret_key` (never use in production).
- The `protect` middleware (`server/middleware/authMiddleware.js`) accepts the cookie OR an `Authorization: Bearer <token>` header.
- Roles: `student`, `recruiter`, `admin`. The `authorize(...roles)` middleware enforces role-based access.
- The rating feed uses a custom inline `optionalProtect` middleware — see §8 for the double-blind semantics.

### 1.3 Request & response envelope
- All controllers return:
  ```json
  { "success": true, "message": "...", "data": <payload | null> }
  ```
- All errors flow through `server/middleware/errorMiddleware.js`, which emits:
  ```json
  { "success": false, "message": "...", "errors": <array | null> }
  ```
  Status code defaults to `500` if not already set on `res`.

### 1.4 Validation
- Bodies are validated by Yup through the `validate(schema)` middleware (`server/middleware/validate.js`) with `{ abortEarly: false, stripUnknown: true }`.
- On failure the API returns HTTP `400` with an `errors` array of `{ field, message }`.

### 1.5 File uploads
- CV uploads use `multer.memoryStorage()` via `server/middleware/uploadMiddleware.js`.
- Field name: `cv`. Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
- Max size: 5 MB.
- The buffer is forwarded to `server/services/storageService.js`, which uploads to Cloudinary when `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are set; otherwise it writes to `server/uploads/cv/` and returns a `/uploads/cv/...` path served by `express.static`.

### 1.6 Global security middleware (from `server/server.js`)
Order of execution on every request:
1. `helmet()`
2. `cors({ origin: process.env.CLIENT_URL, credentials: true })`
3. `express.json()`
4. `express.static('uploads')`
5. `cookieParser()`
6. `express-mongo-sanitize()`
7. `rateLimit({ windowMs: 15 min, max: 100 prod / 10 000 dev })`
8. Routes
9. `errorHandler`

---

## 2. Endpoint catalog

29 endpoints across 8 route groups.

| # | Method | Path | Access | Controller |
|---|--------|------|--------|------------|
| Auth |
| 1 | POST | `/api/auth/register` | public | `authController.register` |
| 2 | POST | `/api/auth/login` | public | `authController.login` |
| 3 | POST | `/api/auth/logout` | protected | `authController.logout` |
| 4 | GET  | `/api/auth/me` | protected | `authController.getMe` |
| Student |
| 9 | GET  | `/api/students/profile` | student | `studentController.getProfile` |
| 10 | PUT  | `/api/students/profile` | student | `studentController.updateProfile` |
| 11 | POST | `/api/students/upload-cv` | student | `studentController.uploadCV` |
| Recruiter |
| 12 | GET  | `/api/recruiters/profile` | recruiter | `recruiterController.getProfile` |
| 13 | PUT  | `/api/recruiters/profile` | recruiter | `recruiterController.updateProfile` |
| Internship |
| 14 | GET  | `/api/internships` | public (+ optional student matching) | `internshipController.list` |
| 15 | GET  | `/api/internships/:id` | public (+ optional student matching) | `internshipController.getById` |
| 16 | POST | `/api/internships` | recruiter | `internshipController.create` |
| 17 | PUT  | `/api/internships/:id` | recruiter (owner) | `internshipController.update` |
| 18 | DELETE | `/api/internships/:id` | recruiter (owner) OR admin | `internshipController.deleteInternship` |
| Application |
| 19 | POST | `/api/applications` | student | `applicationController.submit` |
| 20 | GET  | `/api/applications` | any auth (role-aware) | `applicationController.listApplications` |
| 21 | PUT  | `/api/applications/:id/status` | recruiter (owner of internship) | `applicationController.updateStatus` |
| Match |
| 22 | GET  | `/api/matches` | student | `matchController.getDashboardMatches` |
| 23 | GET  | `/api/matches/:internshipId` | student | `matchController.getMatchAnalysis` |
| Rating |
| 24 | POST | `/api/ratings` | protected (student or recruiter) | `ratingController.createReview` |
| 25 | GET  | `/api/ratings/status` | protected | `ratingController.getReviewStatus` |
| 26 | GET  | `/api/ratings/internship/:internshipId` | public (double-blind) | `ratingController.getInternshipReviews` |
| 27 | GET  | `/api/ratings/user/:userId` | public (double-blind) | `ratingController.getUserReviews` |
| Admin |
| 28 | GET  | `/api/admin/recruiters` | admin | `adminController.listRecruiters` |
| 29 | PUT  | `/api/admin/recruiters/:userId/verify` | admin | `adminController.verifyRecruiter` |

---

## 3. Auth module — `/api/auth`

### 3.1 POST `/api/auth/register`
- Body (Yup `registerSchema`):
  - `name` — string, 2–50 chars
  - `email` — valid email
  - `password` — string, ≥ 8 chars, must contain 1 uppercase, 1 digit, 1 special character
  - `role` — `student` | `recruiter` (admin is never self-assignable)
- Behavior:
  - Returns `400` if the email is already registered.
  - Creates the `User` (password hashed via the `User.pre('save')` bcrypt hook) and a matching empty `StudentProfile` or `RecruiterProfile` (recruiter starts unverified).
  - Sets the JWT cookie via `generateToken`.
  - Response `201`: `{ id, name, email, role, token }` (returns the signed JWT token in JSON payload).

### 3.2 POST `/api/auth/login`
- Body (Yup `loginSchema`): `email`, `password`.
- Behavior: validates credentials with `user.comparePassword` (bcrypt). Returns `401` for unknown email or wrong password.
- Sets JWT cookie and returns `200`: `{ id, name, email, role, profileImage, token }` (returns the signed JWT token in JSON payload).

### 3.3 POST `/api/auth/logout` — protected
- Sets the `token` cookie to an empty value with `expires: new Date(0)`.
- Returns `200`: `{ success: true, data: null }`.

### 3.4 GET `/api/auth/me` — protected
- Returns the authenticated user (without password) plus the role-specific profile.
- Returns `404` if the user no longer exists.

---

## 4. Student module — `/api/students`

All endpoints require `protect` and `authorize('student')`.

### 4.1 GET `/api/students/profile`
- Returns the student's `StudentProfile` document.
- `404` if the profile is missing (defensive only; registration always creates one).

### 4.2 PUT `/api/students/profile`
- Validated by the `updateProfileSchema` in `server/routes/studentRoutes.js` (stripUnknown):
  - `university` — string
  - `degree` — string
  - `graduationYear` — integer in `[currentYear − 5, currentYear + 6]`
  - `skills` — array of strings
  - `interests` — array of strings
  - `projects` — array of `{ title, description, technologies }`
  - `experiences` — array of `{ company, role, description, startDate, endDate }`
  - `portfolioLinks` — array of valid URLs
  - `matchPreferences` — `{ locations: string[], roles: string[], internshipTypes: ['Remote','Hybrid','On-site'][] }`
- Controller only updates fields that are explicitly provided.

### 4.3 POST `/api/students/upload-cv`
- `multipart/form-data` with field `cv` (≤ 5 MB, PDF or DOCX).
- The multer middleware (`uploadMiddleware.js`) rejects wrong MIME types with `400`.
- The controller additionally double-checks MIME and size, then delegates to `storageService.uploadBuffer`.
- Returns `200`: `{ cvUrl }`. The URL is either a Cloudinary `secure_url` or `/uploads/cv/...` depending on env.

---

## 5. Recruiter module — `/api/recruiters`

All endpoints require `protect` and `authorize('recruiter')`.

### 5.1 GET `/api/recruiters/profile`
- Returns the authenticated recruiter's `RecruiterProfile` document.

### 5.2 PUT `/api/recruiters/profile`
- Yup `updateProfileSchema`:
  - `companyName` — string ≤ 100
  - `logo` — string (URL/path)
  - `website` — valid URL
  - `industry` — string
  - `companyDescription` — string ≤ 2000
- Partial updates only; missing fields are ignored.

> Until a recruiter is verified by an admin (`PUT /api/admin/recruiters/:userId/verify`), publishing internships is blocked (see §6.4).

---

## 6. Internship module — `/api/internships`

### 6.1 GET `/api/internships` — public
Query parameters:
- `page` (default `1`), `limit` (default `10`)
- `search` — case-insensitive regex on `title`
- `location` — case-insensitive regex on `location`
- `internshipType` — exact match on `Remote | Hybrid | On-site`
- `category` — case-insensitive regex on `category`

Always filters to `status: 'Published'` and sorts by `createdAt` descending.

If a JWT is present (cookie or Bearer), the controller decodes it; if the role is `student`, it runs `matchingService.calculateScore` for each returned internship, upserts a `MatchRecord`, and attaches a `match: { score, matchedSkills, missingSkills, recommendationReason }` block to each row. Invalid tokens are silently ignored.

Response `200`:
```json
{
  "success": true,
  "message": "Internships retrieved successfully.",
  "data": {
    "internships": [/* with optional `match` block */],
    "pagination": { "page": 1, "limit": 10, "total": 42, "pages": 5 }
  }
}
```

### 6.2 GET `/api/internships/:id` — public
- Returns the internship, the recruiter's `RecruiterProfile` (company name, logo, website) under `data.company`, and an optional `match` block for authenticated students.
- The student match block additionally includes `potentialImprovements` (see §9.2).

### 6.3 POST `/api/internships` — recruiter
Yup `createInternshipSchema`:
- `title` — string ≤ 100
- `category` — string
- `location` — string
- `internshipType` — `Remote | Hybrid | On-site`
- `description` — string ≥ 50
- `requiredSkills` — array of strings, ≥ 1 entry
- `responsibilities` — array of strings
- `duration` — string
- `stipend` — string
- `applicationDeadline` — date that must be in the future

The new internship starts in `Draft` status — see §6.4 for publishing.

### 6.4 PUT `/api/internships/:id` — recruiter (owner)
Yup `updateInternshipSchema`: every field is optional; `status` may transition through `Draft | Published | Closed | Archived`.

Publishing guard: when `status === 'Published'` is sent, the controller checks that the recruiter's `RecruiterProfile.verified === true`. If not, the request returns `403` with `"Your company profile must be verified by an admin before publishing internships"`.

### 6.5 DELETE `/api/internships/:id` — recruiter (owner) OR admin
Soft delete: status is set to `Archived`. Hard delete is not implemented.

---

## 7. Application module — `/api/applications`

### 7.1 POST `/api/applications` — student
Yup `submitApplicationSchema`: `internshipId` (Mongo ObjectId).
Controller-side checks:
- Internship must exist and be `Published`.
- `applicationDeadline` must still be in the future.
- Compound-unique index `{ studentId: 1, internshipId: 1 }` prevents duplicate applications; the controller also pre-checks and returns `400` with `"You have already applied to this internship"`. A duplicate-key `11000` error is caught and surfaced as the same `400`.

Response `201`: `data` is the created `Application` (status starts at `Applied`).

### 7.2 GET `/api/applications` — any authenticated user
Role-aware feed:
- `student` → applications where `studentId === req.user.id`
- `recruiter` → applications for internships where `recruiterId === req.user.id`
- `admin` → all applications

Query: `page` (1), `limit` (10), `status`.
Populates `studentId` (`name email profileImage`) and `internshipId` (`title category location recruiterId`).

### 7.3 PUT `/api/applications/:id/status` — recruiter (owner)
Yup `updateApplicationStatusSchema`:
- `status` — `Applied | Under Review | Shortlisted | Accepted | Completed | Rejected`
- `recruiterNotes` — string ≤ 2000

Recruiter must own the underlying internship; otherwise `403`.

> **Double-blind rating unlock:** only applications transitioned to `Completed` enable the rating endpoints (see §8).

---

## 8. Match module — `/api/matches`

Both endpoints require `protect` and `authorize('student')`.

### 8.1 GET `/api/matches`
Returns `getRecsForStudent(req.user.id)` from `matchingService`:
- Loads the student profile, then iterates all `Published` internships.
- Runs `calculateScore` for each, upserts a `MatchRecord`, attaches a `match` block, and returns results sorted by score descending.

### 8.2 GET `/api/matches/:internshipId`
- Returns `404` if either the student profile or internship is missing.
- Computes a fresh analysis via `calculateScore`, upserts the matching `MatchRecord`, and returns:
  ```json
  {
    "internshipId": "...",
    "title": "...",
    "score": 0,
    "matchedSkills": [],
    "missingSkills": [],
    "recommendationReason": "...",
    "potentialImprovements": [
      { "skill": "Docker", "improvementValue": 12.5, "suggestion": "...", "resourceName": "...", "resourceUrl": "..." }
    ]
  }
  ```

---

## 9. Matching engine internals

Implemented in `server/services/matchingService.js`.

### 9.1 Weighted score formula
The total score is the weighted sum of three normalized components:

| Component | Weight | What is measured |
|-----------|--------|------------------|
| Skill match | **50%** | `matchedSkills.length / requiredSkills.length × 100` (returns 100 when the role lists no skills) |
| Interest match | **30%** | Tag overlap between `internship.category` (split on `,`, `/`, `&`, ` and `) and `studentProfile.interests` |
| Experience match | **20%** | For each required skill, the student earns 1.0 if the skill appears in `project.technologies` and 0.5 if it appears in `project.title`, `project.description`, or any `experience.description / role / company`. Score = sum of credits / requiredSkills × 100 |

Final score is clamped to `[0, 100]` and rounded.

### 9.2 Recommendation reason
- Score ≥ 75 → `"Strong match! You satisfy N out of M required skills…"`
- Score 40–74 → `"Moderate match. … Acquire X, Y to boost your rating."`
- Score < 40 → `"Developing match. Focus on learning X, Y to qualify."`

### 9.3 Potential improvements
For every missing skill the controller returns:
- `improvementValue` — the score boost gained by adding the skill, computed as `(1 / requiredSkillsCount) × 0.50 × 100` (i.e., the marginal skill-match weight).
- `suggestion`, `resourceName`, `resourceUrl` — looked up via `utils/learningResources.getLearningResource(skill)`. If no entry exists, a Coursera search URL is generated as a generic fallback.

### 9.4 Cache: `MatchRecord`
Every code path that produces a score (`internshipController.list`, `internshipController.getById`, `matchController.getMatchAnalysis`, `matchingService.getRecsForStudent`) upserts a `MatchRecord` keyed by `{ studentId, internshipId }` so subsequent listings avoid recomputation.

---

## 10. Rating module — `/api/ratings`

### 10.1 POST `/api/ratings` — protected
Body:
- `internshipId`
- `revieweeId`
- `rating` — integer 1–5 (controller-side range check; duplicate-content not validated by Yup)
- `review` — optional string

Rules:
- Reviewer role determines the review `type`:
  - `student` → `StudentToCompany`. The student must have a `Completed` application for that internship, and `revieweeId` must equal `internship.recruiterId`.
  - `recruiter` → `CompanyToStudent`. The recruiter must own the internship, and the student must have a `Completed` application for it.
  - `admin` → `403` (admins do not submit reviews).
- Compound-unique enforcement: a `Rating.findOne({ internshipId, reviewerId })` pre-check plus the model's unique index prevent duplicate submissions.

### 10.2 GET `/api/ratings/status` — protected
Query: `internshipId`, `studentId`.
- Returns `403` unless the caller is the student, the recruiter who owns the internship, or an admin.
- Returns `{ studentReviewed, recruiterReviewed, studentReview, recruiterReview }`.
- Each `*Review` is only revealed when:
  - Both sides have reviewed (mutual unlock), OR
  - The caller is the author, OR
  - The caller is an admin.

### 10.3 GET `/api/ratings/internship/:internshipId` — double-blind
- Public endpoint guarded by the inline `optionalProtect` middleware inside `server/routes/ratingRoutes.js`. This middleware decodes the cookie or Bearer token if present but **never rejects** anonymous callers.
- Iterates every `StudentToCompany` review for the internship:
  - The reviewer can always see their own review.
  - Other reviews are only included if a paired `CompanyToStudent` review exists (mutual unlock). Otherwise the review is hidden.

### 10.4 GET `/api/ratings/user/:userId` — double-blind
- Same `optionalProtect` semantics.
- Iterates every review where `revieweeId === userId` and applies the same mutual-unlock rule (a review is visible to anyone only after the other party has reciprocated).

> **Why `optionalProtect`?** Listing pages (internship detail, profile pages) need to show rating widgets for anonymous visitors, but the controller still needs `req.user.id` to decide whether a particular caller is the author of a review. The middleware satisfies both needs without forcing login.

---

## 11. Admin module — `/api/admin`

`server/routes/adminRoutes.js` applies `protect` and `authorize('admin')` at the router level — there are no public admin endpoints.

### 11.1 GET `/api/admin/recruiters`
- Returns every `RecruiterProfile`, populated with `userId` (`name email role profileImage`), sorted by `createdAt` desc.

### 11.2 PUT `/api/admin/recruiters/:userId/verify`
- Flips `verified = true` on the matching `RecruiterProfile`. There is currently no "un-verify" endpoint; once verified, the recruiter can publish internships (§6.4).

---

## 12. Error model

| Status | When |
|--------|------|
| 400 | Yup validation failure, duplicate application/review, invalid file, business rule violation (e.g. expired deadline, unverified recruiter) |
| 401 | Missing/invalid JWT (handled by `protect` or inline `optionalProtect`-backed flows) |
| 403 | Role mismatch (`authorize`), ownership mismatch, admin-only action attempted by recruiter/student |
| 404 | Document not found (user, profile, internship, application) |
| 500 | Unhandled exception routed to `errorHandler` |

The error middleware also logs `err.message` and `err.stack` to stdout.

---

## 13. Smoke tests (curl)

Replace `$TOKEN` with the JWT from `POST /api/auth/login` (cookie or `Authorization: Bearer …`).

```bash
# Register a student
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada Lovelace","email":"ada@example.com","password":"Strong1!Pass","role":"student"}'

# Log in (cookie jar)
curl -c jar.txt -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ada@example.com","password":"Strong1!Pass"}'

# Fetch the current user
curl -b jar.txt http://localhost:5000/api/auth/me

# Update student profile
curl -b jar.txt -X PUT http://localhost:5000/api/students/profile \
  -H 'Content-Type: application/json' \
  -d '{"skills":["React","Node.js"],"interests":["Web Development"],"graduationYear":2027}'

# List published internships with match scores
curl -b jar.txt 'http://localhost:5000/api/internships?page=1&limit=5'

# Get dashboard recommendations
curl -b jar.txt http://localhost:5000/api/matches
```

---

## 14. Implementation status

| Area | Status | Notes |
|------|--------|-------|
| Auth (local JWT) | ✅ Implemented | Token returned in payload and stored in cookie; mock OAuth removed |
| Student profile + CV upload | ✅ Implemented | Cloudinary when env is set, local disk fallback otherwise |
| Recruiter profile | ✅ Implemented | Verification gate enforced on publish |
| Internship CRUD + publish/verify flow | ✅ Implemented | Soft delete via `Archived` status |
| Applications + status workflow | ✅ Implemented | Compound-unique prevents duplicates |
| Matching engine + `MatchRecord` cache | ✅ Implemented | 50/30/20 weighting, dynamic reasons, learning resources |
| Ratings with double-blind unlock | ✅ Implemented | `optionalProtect` middleware enables public reads |
| Admin recruiter verification | ✅ Implemented | No un-verify path yet |
| Bookmarks | ⏳ Schema only | `Bookmark` model exists; no controller/route mounted |
| Notifications | ⏳ Schema only | `Notification` model exists; no controller/route mounted |
| Refresh tokens / logout-everywhere | ❌ Not implemented | Logout clears the cookie only |
| OAuth (Google/LinkedIn) | ❌ Removed | Simulated/Mock OAuth removed |
| Pagination cursor links | ⚠️ Partial | Page/limit/total/pages are returned, no `next`/`prev` URLs |

---

## 15. Source-of-truth pointers

- Server bootstrap & middleware order: `server/server.js`
- Routes & Yup schemas: `server/routes/*.js`
- Controllers (request/response shape): `server/controllers/*.js`
- Validation helper: `server/middleware/validate.js`
- Auth helper: `server/middleware/authMiddleware.js`, `server/utils/generateToken.js`
- File storage: `server/services/storageService.js`
- Matching engine: `server/services/matchingService.js`
- Data models: `server/models/*.js` (User, StudentProfile, RecruiterProfile, Internship, Application, MatchRecord, Bookmark, Notification, Rating)
