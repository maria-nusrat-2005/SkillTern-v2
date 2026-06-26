# Screen Navigation & Route Map: Skilltern

This document specifies the client-side routes, page components, layouts, access controls, and API requirements for the Skilltern UI.

## Routes & Screens Catalog

| Client URI Route | Layout | Page Component | Access Role | API Calls Required |
| --- | --- | --- | --- | --- |
| `/login` | `AuthLayout` | `LoginPage` | Guest | `POST /api/auth/login` |
| `/register` | `AuthLayout` | `RegisterPage` | Guest | `POST /api/auth/register` |
| `/onboarding` | `AuthLayout` | `OnboardingPage` | Authenticated | `PUT /api/students/profile` or `PUT /api/recruiters/profile` |
| `/` (Root redirect) | `DashboardLayout`| `DashboardPage` | Authenticated | Dynamic redirect depending on role |
| `/dashboard` | `DashboardLayout`| `StudentDashboard` | `student` | `GET /api/matches`<br>`GET /api/notifications` |
| `/recruiter/dashboard` | `DashboardLayout`| `RecruiterDashboard` | `recruiter` | `GET /api/internships` (posted by self)<br>`GET /api/applications` (pending) |
| `/internships/:id` | `DashboardLayout`| `InternshipDetails` | `student` \| `recruiter` | `GET /api/internships/:id`<br>`GET /api/matches/:id` (students only) |
| `/applications` | `DashboardLayout`| `ApplicationList` | `student` \| `recruiter` | `GET /api/applications` |
| `/profile` | `DashboardLayout`| `ProfilePage` | `student` \| `recruiter` | `GET /api/students/profile`<br>`PUT /api/students/profile` |
| `/admin` | `DashboardLayout`| `AdminDashboard` | `admin` | `GET /api/admin/users`<br>`GET /api/admin/moderation` |
