import axios from 'axios';

import { getAccessToken, getCsrfToken } from './session';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  const csrfToken = getCsrfToken();
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes((config.method || 'get').toLowerCase())) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  return config;
});

export default api;
