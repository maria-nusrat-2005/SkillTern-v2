# Database Schema Context: Skilltern

This document describes the schema collections, data attributes, and types for the Skilltern MongoDB database.

## Collections Map

### 1. Users Collection (`users`)
- Core account identity and credentials.
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,          // Unique index
  role: String,           // 'student', 'recruiter', 'admin'
  password: String,       // Hashed
  oauthProvider: String,  // 'local', 'google', 'linkedin'
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. StudentProfiles Collection (`student_profiles`)
- Extends the student identity with academic and career metadata.
```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // References users._id
  university: String,
  degree: String,
  graduationYear: Number,
  skills: [String],       // Indexed for matching queries
  interests: [String],
  projects: [{
    title: String,
    description: String,
    technologies: [String]
  }],
  experiences: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],
  cvUrl: String,
  portfolioLinks: [String],
  matchPreferences: {
    locations: [String],
    roles: [String],
    internshipTypes: [String] // 'Remote', 'Hybrid', 'On-site'
  }
}
```

### 3. RecruiterProfiles Collection (`recruiter_profiles`)
- Extends the recruiter identity with company metadata.
```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // References users._id
  companyName: String,
  logo: String,
  website: String,
  industry: String,
  companyDescription: String,
  verified: Boolean       // Managed by admin approval workflow
}
```

### 4. Internships Collection (`internships`)
- Job board opportunities posted by verified recruiters.
```javascript
{
  _id: ObjectId,
  recruiterId: ObjectId,  // References users._id (or recruiter_profiles._id)
  title: String,
  category: String,
  location: String,
  internshipType: String, // 'Remote', 'Hybrid', 'On-site'
  description: String,
  requiredSkills: [String],
  responsibilities: [String],
  duration: String,
  stipend: String,
  applicationDeadline: Date,
  status: String,         // 'Draft', 'Published', 'Closed', 'Archived'
  createdAt: Date
}
```

### 5. Applications Collection (`applications`)
- Tracks user applications to internships.
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,    // References users._id
  internshipId: ObjectId, // References internships._id
  status: String,         // 'Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Completed', 'Rejected'
  appliedAt: Date,
  recruiterNotes: String,
  updatedAt: Date
}
```

### 6. Bookmarks Collection (`bookmarks`)
- Saved listings for student quick access.
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,    // References users._id
  internshipId: ObjectId, // References internships._id
  createdAt: Date
}
```

### 7. MatchRecords Collection (`match_records`)
- Cached output of the matching algorithm.
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  internshipId: ObjectId,
  score: Number,          // 0 to 100
  matchedSkills: [String],
  missingSkills: [String],
  recommendationReason: String,
  createdAt: Date
}
```

### 8. Notifications Collection (`notifications`)
- System and email notifications logs.
```javascript
{
  _id: ObjectId,
  recipientId: ObjectId,  // References users._id
  type: String,           // 'Match', 'ApplicationStatus', 'Alert'
  title: String,
  message: String,
  isRead: Boolean,
  createdAt: Date
}
```

### 9. Ratings Collection (`ratings`)
- Double-blind feedback system completed after internship completion.
```javascript
{
  _id: ObjectId,
  internshipId: ObjectId,
  reviewerId: ObjectId,    // User submitting review
  revieweeId: ObjectId,    // User being reviewed
  type: String,            // 'StudentToCompany', 'CompanyToStudent'
  rating: Number,          // 1 to 5
  review: String,
  createdAt: Date
}
```
