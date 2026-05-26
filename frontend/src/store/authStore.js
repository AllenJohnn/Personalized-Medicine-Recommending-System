import { create } from 'zustand';

import { fetchCsrfToken, loginRequest, logoutRequest, refreshRequest, registerRequest } from '../api/auth';
import { clearSession, setAccessToken, setCsrfToken } from '../api/session';

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  csrfToken: null,
  isHydrating: false,
  error: null,
  setSession: (user, accessToken) => {
    setAccessToken(accessToken);
    set({ user, accessToken, error: null });
  },
  setUser: (user) => set({ user }),
  clearAuth: () => {
    clearSession();
    set({ user: null, accessToken: null, csrfToken: null, error: null });
  },
  bootstrap: async () => {
    set({ isHydrating: false });
    try {
      const csrfToken = await fetchCsrfToken();
      setCsrfToken(csrfToken);
      set({ csrfToken });

      const refreshPayload = await refreshRequest();
      const accessToken = refreshPayload?.data?.access_token || null;
      const user = refreshPayload?.data?.user || null;

      if (accessToken && user) {
        get().setSession(user, accessToken);
      }
    } catch (error) {
      clearSession();
      set({ user: null, accessToken: null, csrfToken: null, error: null });
    } finally {
      set({ isHydrating: false });
    }
  },
  login: async (credentials) => {
    await get().bootstrapCsrf();
    const payload = await loginRequest(credentials);
    const user = payload?.data?.user || null;
    const accessToken = payload?.data?.access_token || null;
    if (user && accessToken) {
      get().setSession(user, accessToken);
    }
    return payload;
  },
  register: async (credentials) => {
    await get().bootstrapCsrf();
    const payload = await registerRequest(credentials);
    const user = payload?.data?.user || null;
    const accessToken = payload?.data?.access_token || null;
    if (user && accessToken) {
      get().setSession(user, accessToken);
    }
    return payload;
  },
  logout: async () => {
    try {
      await logoutRequest();
    } finally {
      get().clearAuth();
    }
  },
  bootstrapCsrf: async () => {
    if (get().csrfToken) {
      return get().csrfToken;
    }
    const csrfToken = await fetchCsrfToken();
    setCsrfToken(csrfToken);
    set({ csrfToken });
    return csrfToken;
  },
}));

export default useAuthStore;
