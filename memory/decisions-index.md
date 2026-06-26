# Architectural Decisions Index (ADR): Skilltern

This document indexes all formalized Architectural Decision Records (ADRs) generated for the Skilltern project.

| ADR ID | Date | Decision Title | Status |
| --- | --- | --- | --- |
| **ADR-0001** | 2026-06-06 | [Core Technology Stack Choice](file:///c:/SMUCT_Project/SkillTern/decisions/0001-project-foundation.md) | **Approved** |
| **ADR-0002** | 2026-06-06 | On-Demand Math Scoring Cache Strategy | **Approved** |

---

## Summaries of key decisions

- **ADR-0001 (Core Technology Stack Choice):** Adopts React with Zustand and Tailwind CSS for the client, with Express, Node, and MongoDB Atlas (Mongoose) handling backend storage. Establishes basic MVC separation.
- **ADR-0002 (On-Demand Math Scoring Cache Strategy):** Decides to calculate matching scores on-demand when student pages request recommendations, storing calculations inside the `match_records` collection to limit overhead on subsequent views.
