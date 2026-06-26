# Database Relationships & Integrity Rules: Skilltern

MongoDB is a document database, but our application architecture must enforce clear relationship constraints, reference lookups, and deletion rules.

## Core Database Deletion Rules

### 1. User Account Deletion (Cascade Deletes)
- **Constraint:** If a `User` account is deleted, all dependent profiles must be cleaned up to prevent orphaned documents.
- **Rule:** Trigger database hooks to:
  - Remove corresponding `StudentProfile` or `RecruiterProfile`.
  - Remove all corresponding `Bookmarks` created by that user.
  - Remove all `Notifications` mapped to that user.
  - Archive/soft-delete `Applications` submitted by that student.
  - Archive/soft-delete `Internships` posted by that recruiter.

### 2. Internship Deletion (Cascade / Restrict)
- **Rule:** If an internship is deleted/archived:
  - Remove related `Bookmarks`.
  - Update all related active `Applications` status to `Closed`.
  - Keep historical application records for accounting/audit reasons (do not hard-delete applications).

---

## Data Integrity Validations
- **Reference Validation:** Before saving an `Application`, controllers must verify that:
  - The `studentId` points to a valid user with the role `student`.
  - The `internshipId` points to an active internship that is `Published` and whose `applicationDeadline` is in the future.
- **Verification Lock:** Recruiters can create internships, but the status cannot be set to `Published` unless the parent recruiter profile has `verified: true`.
