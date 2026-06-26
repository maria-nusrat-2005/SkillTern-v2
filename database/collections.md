# Database Collection Schemas: Skilltern

This document defines the schema types, validations, and default values for each MongoDB collection using Mongoose definitions.

## 1. Users Schema
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'recruiter', 'admin'] },
  oauthProvider: { type: String, default: 'local', enum: ['local', 'google', 'linkedin'] },
  profileImage: { type: String, default: '' }
}, { timestamps: true });
```

## 2. StudentProfiles Schema
```javascript
const StudentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  university: { type: String, trim: true, default: '' },
  degree: { type: String, trim: true, default: '' },
  graduationYear: { type: Number, required: true },
  skills: [{ type: String, index: true }],
  interests: [{ type: String }],
  projects: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }]
  }],
  experiences: [{
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String },
    description: { type: String }
  }],
  cvUrl: { type: String, default: '' },
  portfolioLinks: [{ type: String }],
  matchPreferences: {
    locations: [{ type: String }],
    roles: [{ type: String }],
    internshipTypes: [{ type: String, enum: ['Remote', 'Hybrid', 'On-site'] }]
  }
});
```

## 3. RecruiterProfiles Schema
```javascript
const RecruiterProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, trim: true, default: '' },
  logo: { type: String, default: '' },
  website: { type: String, trim: true },
  industry: { type: String, trim: true },
  companyDescription: { type: String, trim: true },
  verified: { type: Boolean, default: false }
}, { timestamps: true });
```

## 4. Internships Schema
```javascript
const InternshipSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, index: true },
  location: { type: String, required: true },
  internshipType: { type: String, required: true, enum: ['Remote', 'Hybrid', 'On-site'] },
  description: { type: String, required: true },
  requiredSkills: [{ type: String, index: true }],
  responsibilities: [{ type: String }],
  duration: { type: String, required: true },
  stipend: { type: String, required: true },
  applicationDeadline: { type: Date, required: true },
  status: { type: String, default: 'Draft', enum: ['Draft', 'Published', 'Closed', 'Archived'] }
}, { timestamps: true });
```

## 5. Applications Schema
```javascript
const ApplicationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  status: { 
    type: String, 
    default: 'Applied', 
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Completed', 'Rejected'] 
  },
  appliedAt: { type: Date, default: Date.now },
  recruiterNotes: { type: String, default: '' }
}, { timestamps: true });
```

## 6. Ratings Schema
```javascript
const RatingSchema = new mongoose.Schema({
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['StudentToCompany', 'CompanyToStudent'] 
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' }
}, { timestamps: true });

// Prevent duplicate reviews (one review per reviewer per internship)
RatingSchema.index({ internshipId: 1, reviewerId: 1 }, { unique: true });
```
