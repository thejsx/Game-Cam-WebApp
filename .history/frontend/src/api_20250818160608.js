// frontend/src/api.js
export const API = 
  typeof window !== 'undefined'
    ? '' // in browser: same-origin (nginx will proxy /api/*)
    : "http://localhost:10000";

export function fetchLabels(params) {
  const q = new URLSearchParams(params || {});
  return fetch(`${API}/api/labels${q.toString() ? `?${q}` : ''}`).then(r => r.json());
}
