# Component Composition Catalog: Skilltern

This document maps out UI components, differentiating between core, page-specific, and atomic components.

## Component Hierarchy

### 1. Global / Layout Components (`components/`)
- `SidebarNavigation`: Role-based left sidebar panel.
- `HeaderNavbar`: User profile avatar dropdown menu, quick global search inputs, notification bells.
- `Footer`: Shared copyright, site links.

### 2. General UI Reusables (`components/ui/` - Atomic)
- `Button`: Custom variants (`default`, `outline`, `destructive`, `ghost`).
- `Card`: standard wrapper with Header, Title, Content, and Footer divisions.
- `Dialog`: Accessible overlay popup dialog box wrappers.
- `DropdownMenu`: RADIX-based trigger popovers.
- `Input` & `TextArea`: Structured form fields.
- `Badge`: Categorized labels (`stipend`, `remote`, `match percentage`).

### 3. Page Widgets / Features (`features/`)
- **Matching Feature:**
  - `MatchBadge`: Animated circular progress indicator showing match score percentage.
  - `MatchDetailsCard`: Shows list of matched vs missing skills (red/green).
- **Profile Feature:**
  - `SkillsSelector`: Interactive tag management field to add/remove skills.
  - `ProjectFormCard`: Sub-form elements to capture title, description, and technologies.
- **Application Feature:**
  - `ApplicationStatusTimeline`: Vertical visual tracker showing steps: Applied ➔ Under Review ➔ Shortlisted.
