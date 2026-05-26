import api from './client';

export async function fetchHistory() {
  const { data } = await api.get('/user/history');
  return data;
}

export async function clearHistory() {
  const { data } = await api.delete('/user/history');
  return data;
}

export async function fetchBookmarks() {
  const { data } = await api.get('/user/bookmarks');
  return data;
}

export async function saveBookmark(name) {
  const { data } = await api.post('/user/bookmarks', { medicine_name: name });
  return data;
}

export async function removeBookmark(name) {
  const { data } = await api.delete(`/user/bookmarks/${encodeURIComponent(name)}`);
  return data;
}

export async function submitMedicineRequest(payload) {
  const { data } = await api.post('/requests/', payload);
  return data;
}
