// ============================================================
//  utils/api.js  — All API calls in ONE place
//  Base URL points to FastAPI backend on port 8000
// ============================================================

const BASE = 'http://localhost:8000/api'

// Helper: get the JWT token stored after login
const getToken = () => localStorage.getItem('mess_token')

// Helper: build headers (with or without auth token)
const headers = (auth = false) => ({
  'Content-Type': 'application/json',
  ...(auth ? { Authorization: `Bearer ${getToken()}` } : {}),
})

// Helper: handle fetch response — throws error with message if not OK
async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Something went wrong')
  }
  return res.json()
}

// ── Public APIs (no login needed) ───────────────────────────

export const submitFeedback = (data) =>
  fetch(`${BASE}/feedback`, { method: 'POST', headers: headers(), body: JSON.stringify(data) })
    .then(handle)

export const getAllMess = () =>
  fetch(`${BASE}/mess`).then(handle)

export const getQRCode = (messName) =>
  `${BASE}/qr/${encodeURIComponent(messName)}`  // Returns URL string (used in <img src>)

// ── Auth APIs ────────────────────────────────────────────────

export const login = (email, password) =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ email, password }),
  }).then(handle)

export const setupAdmin = (email, password) =>
  fetch(`${BASE}/auth/setup`, {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ email, password }),
  }).then(handle)

// ── Admin APIs (token required) ──────────────────────────────

export const getDashboard = () =>
  fetch(`${BASE}/dashboard`, { headers: headers(true) }).then(handle)

export const getInsights = () =>
  fetch(`${BASE}/insights`, { headers: headers(true) }).then(handle)

export const createMess = (name, institution) =>
  fetch(`${BASE}/mess`, {
    method: 'POST', headers: headers(true),
    body: JSON.stringify({ name, institution }),
  }).then(handle)

export const deleteMess = (id) =>
  fetch(`${BASE}/mess/${id}`, { method: 'DELETE', headers: headers(true) }).then(handle)
