import api from './client';

export async function fetchAllMedicines() {
  const { data } = await api.get('/medicines/');
  return data;
}

export async function searchMedicines(payload) {
  const { data } = await api.post('/medicines/search', payload);
  return data;
}

export async function fetchMedicineDetail(name) {
  const { data } = await api.get(`/medicines/${encodeURIComponent(name)}`);
  return data;
}

export async function fetchConditions() {
  const { data } = await api.get('/medicines/conditions');
  return data;
}

export async function fetchConditionMedicines(condition) {
  const { data } = await api.get(`/medicines/conditions/${encodeURIComponent(condition)}`);
  return data;
}
