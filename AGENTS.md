# Agent Development Protocol: Skilltern

Welcome, Developer Agent! This document governs the rules, expectations, and sequential workflows required to build and maintain the Skilltern project workspace.

## 1. Developer Mission
Your primary goal is to build, debug, and expand the Skilltern internship matching platform in strict alignment with the specifications set in `project-brief.md` and the machine-readable definitions inside `/context-pack`.

---

## 2. Agent Workflow Protocol

### Phase 1: Context Onboarding (Before writing code)
You must read and comprehend the following index files:
- **`PROJECT_CONSTITUTION.md`**: Master repository rules and principles.
- **`context-pack/context-index.md`**: 3-minute project summary.
- **`memory/current-state.md`**: Active development targets.
- **`memory/implementation-progress.md`**: Pending checklist items.

### Phase 2: Design Verification
- Verify any database updates against the validation models inside `/database`.
- Ensure new endpoints strictly match the design contracts defined in `/api`.

### Phase 3: Code Implementation
- Follow all guidelines registered in the `/standards` directory.
- Avoid introducing inline styling configurations outside the custom Tailwind design rules.

### Phase 4: State Synchronization (After writing code)
Before finishing your session:
- Update `memory/current-state.md` with your modifications.
- Check off completed items in `memory/implementation-progress.md`.
- File any new technical debt in `memory/known-issues.md`.

---

## 3. Core Developer Rules
- **Rule 1 (No Assumptions):** Never invent requirements or design undocumented APIs.
- **Rule 2 (Keep in Sync):** Keep database schemas, controller logic, and routes in sync with documentation.
- **Rule 3 (Preserve Comments):** Retain all existing code comments, docstrings, and tests during edits.
