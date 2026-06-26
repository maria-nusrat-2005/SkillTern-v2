# Known Issues & Workarounds: Skilltern

This document tracks unresolved bugs, code limitations, and active technical debt.

## Technical Debt & Limitations
- **Local Storage Dependency:** The client Zustand store will fallback to mock persistent data if secure cookies are blocked by cross-origin local network restrictions during early browser evaluations.
- **Stipend Currency formatting:** Internship stipends are currently captured as plain strings. We need to standardize them as structured objects containing currency keys if global listings are added.

## Bug Tracker
- *No active bugs are recorded at this stage of the bootstrapping process.*
