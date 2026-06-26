# Request Validation Schemas: Skilltern

This document specifies the validation rules applied to incoming payloads using Yup syntax, guaranteeing clean data before database updates.

## 1. Auth Validation Schemas

### User Registration Schema
```javascript
const RegisterValidationSchema = yup.object({
  name: yup.string().required("Name is required").min(2).max(50),
  email: yup.string().required("Email is required").email("Invalid email format"),
  password: yup.string().required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain an uppercase letter")
    .matches(/[0-9]/, "Password must contain a number")
    .matches(/[^A-Za-z0-9]/, "Password must contain a special character"),
  role: yup.string().required("Role is required").oneOf(['student', 'recruiter'], "Invalid role selection")
});
```

### User Login Schema
```javascript
const LoginValidationSchema = yup.object({
  email: yup.string().required("Email is required").email("Invalid email format"),
  password: yup.string().required("Password is required")
});
```

---

## 2. Onboarding & Profiles Validation Schemas

### Student Profile Onboarding Schema
```javascript
const StudentProfileValidationSchema = yup.object({
  university: yup.string().required("University is required").trim(),
  degree: yup.string().required("Degree is required").trim(),
  graduationYear: yup.number().required("Graduation year is required")
    .integer().min(new Date().getFullYear() - 5).max(new Date().getFullYear() + 6),
  skills: yup.array().of(yup.string().trim()).min(1, "Specify at least 1 skill"),
  interests: yup.array().of(yup.string().trim()),
  projects: yup.array().of(yup.object({
    title: yup.string().required("Project title is required").trim(),
    description: yup.string().required("Project description is required").trim(),
    technologies: yup.array().of(yup.string().trim())
  }))
});
```

---

## 3. Internship Validation Schema
```javascript
const InternshipValidationSchema = yup.object({
  title: yup.string().required("Title is required").trim().max(100),
  category: yup.string().required("Category is required").trim(),
  location: yup.string().required("Location is required").trim(),
  internshipType: yup.string().required("Internship type is required").oneOf(['Remote', 'Hybrid', 'On-site']),
  description: yup.string().required("Description is required").min(50, "Description must be at least 50 characters"),
  requiredSkills: yup.array().of(yup.string().trim()).min(1, "At least 1 required skill is mandatory"),
  duration: yup.string().required("Duration description is required"),
  stipend: yup.string().required("Stipend description is required"),
  applicationDeadline: yup.date().required("Application deadline is required").min(new Date(), "Deadline must be in the future")
});
```
