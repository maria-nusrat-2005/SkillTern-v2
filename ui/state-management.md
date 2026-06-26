# Client State Architecture: Skilltern

This document specifies the global client-side state architecture, detailing store schemas and actions managed using Zustand.

## Zustand Auth Store Schema (`src/redux/useAuthStore.js` or `src/hooks/useAuthStore.js`)
We use Zustand to manage core identity parameters without high component re-render overhead:

```javascript
import create from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setAuth: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  clearAuth: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading })
}));

export default useAuthStore;
```

---

## Client Cache Strategy (TanStack Query)
To avoid manual fetch state handling, all asynchronous database fetch tasks are routed through React Query hooks:

- **Internships Cache:** Key: `['internships', filters]`
  - Automatic stale-time cache management.
- **Match Feed Cache:** Key: `['matches', userId]`
- **Applicant Fetch Cache:** Key: `['applicants', internshipId]`
- **Cache Invalidation:**
  - Posting a new internship triggers invalidation of `['internships']` to refresh listing boards.
  - Submitting an application invalidates `['applications']`.
