# Open Design Questions: Skilltern

This document tracks unresolved product specifications and architectural ambiguities.

- **Question 1: Verification Scope**
  - *Context:* How strict is the admin approval workflow for recruiters?
  - *Current Design:* Recruiters can post listings immediately upon signup, but they are flagged as inactive until the administrator reviews their company profile credentials and website domains.
- **Question 2: Skill Gap Suggestions**
  - *Context:* Where should learning suggestions and online courses be sourced from?
  - *Current Design:* Static JSON maps linking specific technology categories (e.g. `Docker` or `React`) to curated learning platforms (like freecodecamp, Coursera, or documentation tutorials). In future phases, these could link dynamically to Coursera/Udemy APIs.
- **Question 3: double-blind review timing**
  - *Context:* When does an internship transition to the completed status?
  - *Current Design:* The Recruiter updates the application status to `Completed` at the end of the internship period, which triggers review forms for both parties.
