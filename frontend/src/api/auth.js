import api from './client';

export async function fetchCsrfToken() {
  const { data } = await api.get('/auth/csrf-token');
  return data?.data?.csrf_token || null;
}

export async function loginRequest(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function registerRequest(payload) {
  const { data } = await api.post('/auth/register', payload);
  return data;
}

export async function refreshRequest() {
  const { data } = await api.post('/auth/refresh');
  return data;
}

export async function logoutRequest() {
  const { data } = await api.post('/auth/logout');
  return data;
}

export async function meRequest() {
  const { data } = await api.get('/auth/me');
  return data;
}
