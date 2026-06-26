import { create } from 'zustand';
import api, { setUnauthorizedCallback } from '../services/api';

const useAuth = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Check session on app mount by calling GET /api/auth/me
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/auth/me');
      if (data.success && data.data) {
        set({ user: data.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Login action
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    }
    return data;
  },

  // Register action
  register: async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    if (data.success) {
      set({ user: data.data, isAuthenticated: true, isLoading: false });
    }
    return data;
  },

  // Logout action
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  // Direct set (for legacy compatibility)
  setAuth: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  clearAuth: () => {
    get().logout();
  },
  setLoading: (isLoading) => set({ isLoading }),
}));

// Register callback to update Zustand store state when receiving a 401 response
setUnauthorizedCallback(() => {
  useAuth.setState({ user: null, isAuthenticated: false, isLoading: false });
});

export default useAuth;
