import api from './client';

export async function fetchAdminRequests() {
  const { data } = await api.get('/admin/requests');
  return data;
}

export async function updateAdminRequest(id, status) {
  const { data } = await api.patch(`/admin/requests/${id}`, { status });
  return data;
}

export async function fetchAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}
