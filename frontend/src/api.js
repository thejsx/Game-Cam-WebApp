// frontend/src/api.js
export const API = import.meta.env.DEV ? 'http://localhost:10000' : '';

export function fetchLabels(params, token) {
  const q = new URLSearchParams(params || {});
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  return fetch(`${API}/api/labels${q.toString() ? `?${q}` : ''}`, { headers }).then(r => {
    if (!r.ok) {
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.reload();
      }
      throw new Error('Failed to fetch');
    }
    return r.json();
  });
}

export function buildVideoUrl(path) {
  const token = localStorage.getItem('token');
  return `${API}/api/video?path=${encodeURIComponent(path)}&token=${token}`;
}
