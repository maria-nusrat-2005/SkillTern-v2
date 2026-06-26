# User Flows & Journeys: Skilltern

This document maps out the key sequential actions and backend transitions for core user goals.

## Flow 1: Student Registration & Profile Setup
```text
[Register Page] 
  ──(Enter Email, Name, Password, Role: 'student')──> 
[Backend API: POST /api/auth/register]
  ──(Create User, Hash Password, Create empty StudentProfile)──> 
[Onboarding Page]
  ──(Input University, Skills, Interests, Upload CV)──> 
[Backend API: PUT /api/students/profile]
  ──(Save Data, Parse details)──> 
[Student Dashboard]
```

---

## Flow 2: Internship Recommendation & Match Review
```text
[Student Dashboard]
  ──(Mounts, Fetches list)──>
[Backend API: GET /api/internships]
  ──(Query listings matching student skills/interests)──>
[Matching Engine Service]
  ──(Calculate weights, save/update MatchRecord)──>
[Dashboard UI]
  ──(Render cards with % Match Badge)──>
[Student clicks card] 
  ──(Opens detail dialog / page)──>
[Match Analysis Card]
  ──(Render matched skills vs missing skills)──>
[Learning suggestions links]
```

---

## Flow 3: Internship Application & Tracking
```text
[Internship Detail Page]
  ──(Click "Apply Now")──>
[Confirmation Modal]
  ──(Confirm resume choice, click Submit)──>
[Backend API: POST /api/applications]
  ──(Validate no duplicate applications, save status as 'Applied')──>
[Notification Trigger]
  ──(Generate in-app notification & send alert email to recruiter)──>
[Application Status Page]
  ──(Render application timeline status: 'Applied' ➔ 'Under Review' ➔ 'Shortlisted')──>
```

---

## Flow 4: Recruiter Application Review & Status Update
```text
[Recruiter Dashboard]
  ──(Click "View Applications" on post)──>
[Applicants Table]
  ──(Lists candidate names, matching scores, and CV download link)──>
[Recruiter clicks candidate]
  ──(Opens profile details side-panel, edits notes, changes status to 'Shortlisted')──>
[Backend API: PUT /api/applications/:id/status]
  ──(Saves new status, triggers notification dispatch)──>
[Backend Notification Service]
  ──(Sends email alert: "Congratulations, you have been shortlisted!")──>
```
