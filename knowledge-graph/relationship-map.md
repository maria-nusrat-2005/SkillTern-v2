# Physical Database Relationships Map: Skilltern

This document describes the physical primary and foreign key references linking MongoDB collections.

## Foreign Keys & Joins Manifest

### 1. `student_profiles` Collection
- `userId` ➔ References `users._id` (One-to-One).
- **Rule:** If `users._id` is deleted, trigger Cascade Delete to remove `student_profiles`.

### 2. `recruiter_profiles` Collection
- `userId` ➔ References `users._id` (One-to-One).
- **Rule:** If `users._id` is deleted, trigger Cascade Delete to remove `recruiter_profiles`.

### 3. `internships` Collection
- `recruiterId` ➔ References `users._id` (One-to-Many).
- **Rule:** If the recruiter is deleted, restrict listing deletion if active applications exist, or soft-delete listing.

### 4. `applications` Collection
- `studentId` ➔ References `users._id` (One-to-Many).
- `internshipId` ➔ References `internships._id` (One-to-Many).
- **Rule:** Unique compound index `{ studentId: 1, internshipId: 1 }` prevents duplicate applications.

### 5. `bookmarks` Collection
- `studentId` ➔ References `users._id` (One-to-Many).
- `internshipId` ➔ References `internships._id` (One-to-Many).
- **Rule:** Unique compound index `{ studentId: 1, internshipId: 1 }` prevents duplicate bookmarks.

### 6. `match_records` Collection
- `studentId` ➔ References `users._id` (One-to-Many).
- `internshipId` ➔ References `internships._id` (One-to-Many).
- **Rule:** Clean up matching cache records when the corresponding student profile or internship is deleted.
