# Database Indexing Strategy: Skilltern

To optimize query speeds, minimize lookup latencies, and support the matching recommendations engine, we define specific single-field and compound indexes on the MongoDB collections.

## Indexes Map

### 1. Users Collection
- `{ email: 1 }` (Unique): Mandatory for high-speed authentication lookups.

### 2. Student Profiles Collection
- `{ userId: 1 }` (Unique): High-speed mapping of core user login details to profile details.
- `{ skills: 1 }` (Multikey Index): Essential for finding student profiles containing specific skill tags during matching scans.

### 3. Internships Collection
- `{ recruiterId: 1 }`: For recruiters listing their active postings on company dashboards.
- `{ category: 1 }`: Allows quick category navigation and homepage discovery filters.
- `{ requiredSkills: 1 }` (Multikey Index): Accelerates matching engine recommendations queries comparing student skills.
- `{ status: 1, applicationDeadline: -1 }` (Compound Index): Speeds up the rendering of public feeds showing only published, unexpired internships.

### 4. Applications Collection
- `{ studentId: 1 }`: Accelerates user dashboards listing their personal applications.
- `{ internshipId: 1, studentId: 1 }` (Unique): Compound unique index preventing double applications.
- `{ internshipId: 1, status: 1 }`: Allows recruiter tables to quickly filter active applicants per job.

### 5. Bookmarks Collection
- `{ studentId: 1, internshipId: 1 }` (Unique): Speeds up searches and prevents double bookmarks.

### 6. Match Records Collection
- `{ studentId: 1, internshipId: 1 }` (Unique): For fast updates and reads of cached scores.
