// frontend/src/api.js
export const API = import.meta.env.DEV ? 'http://localhost:10000' : '';

export function fetchLabels(params) {
  const q = new URLSearchParams(params || {});
  return fetch(`${API}/api/labels${q.toString() ? `?${q}` : ''}`).then(r => r.json());
}
