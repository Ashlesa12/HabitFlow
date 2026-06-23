const API = "http://127.0.0.1:8000";

export async function loginUser(email: string, password: string) {
  return fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(res => res.json());
}

export async function register(email: string, password: string) {
  return fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then(res => res.json());
}

export async function getMe(token: string) {
  return fetch(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.json());
}