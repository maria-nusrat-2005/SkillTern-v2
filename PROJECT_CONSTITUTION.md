# Project Constitution: Skilltern

This document is the highest-level governance authority for the Skilltern repository. All code additions, architectural decisions, and documentation updates must comply with the principles recorded here.

---

## 1. Core Principles

### Principle 1: Single Source of Truth
- `project-brief.md` remains the primary product spec.
- Sub-system configurations must match the `/context-pack` schemas. No unscheduled features may be introduced.

### Principle 2: Document First
- Any structural database change or new API endpoint must be declared in `/database/collections.md` or `/api/api-specification.md` before the actual code is written.

### Principle 3: Zero Context Loss
- Project memory documents inside `/memory` must be updated continuously. Coding sessions must start with an analysis of the current system state.

---

## 2. Architecture & Design Rules
- **Layer Separation:** Controllers handle HTTP transport; Services execute business algorithms; Repositories manage database access.
- **Secure by Default:** Passwords must be hashed. Private routes require authentication validation. CORS lists must restrict unauthorized cross-origin requests.

---

## 3. Governance Compliance
- Code modifications that violate this constitution will be rejected by the reviewer.
- ADR files must be created for any major technical shifts.
