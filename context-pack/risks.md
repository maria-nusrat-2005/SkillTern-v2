# Risks & Mitigations: Skilltern

This document lists potential operational, security, and integration risks identified for the Skilltern project, along with mitigation strategies.

| Risk Category | Threat / Scenario | Impact | Mitigation Strategy |
| --- | --- | --- | --- |
| **Security** | Fake recruiter registration posting spam/fraudulent jobs. | High | - Default all recruiters to `verified: false` status.<br>- Require admin moderation of recruiter accounts before postings become visible to students. |
| **Performance** | Matching calculations cause server latency on large listings arrays. | Medium | - Compute match scores on-demand and cache results in `match_records` collection.<br>- Set up compound database indexes on student skills arrays. |
| **Security** | CV upload abuse (uploading scripts/malware). | High | - Strictly validate file extensions (`.pdf`, `.docx` only).<br>- Implement file size validation (max 5MB limit).<br>- Stream uploads directly to Cloudinary (no local disk persistence on server). |
| **Database** | Incomplete student profiles lead to poor match accuracy. | Medium | - Display profile completion progress meter on dashboard (using LinkedIn-style gamification).<br>- Block matching feature access until a minimum profile strength (e.g. 50%) is completed. |
| **Security** | Brute force attacks on auth endpoints. | Medium | - Apply rate-limiting middleware (`express-rate-limit`) restricting login requests to 100 per 15 minutes. |
