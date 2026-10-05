const BASE = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "elite_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = token =>
  token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

let onUnauthorized = () => {};
export const setUnauthorizedHandler = fn => { onUnauthorized = fn; };

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// The backend uses a few error shapes: { message }, { error }, { errors: [...] }
function errorMessage(body, status) {
  if (body?.message) return body.message;
  if (body?.error) return body.error;
  if (Array.isArray(body?.errors) && body.errors.length) {
    return body.errors.map(e => `${e.path}: ${e.msg}`).join(", ");
  }
  return `Request failed (${status})`;
}

export async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    // requireLogin answers 401 (no/expired user) or 400 (bad token)
    if (auth && token && (res.status === 401 || (res.status === 400 && /login/i.test(data?.message)))) {
      onUnauthorized();
    }
    throw new ApiError(errorMessage(data, res.status), res.status);
  }
  return data;
}

export const api = {
  login: (username, password) =>
    request("/login", { method: "POST", body: { username, password }, auth: false }),
  signup: (username, email, password) =>
    request("/signup", { method: "POST", body: { username, email, password }, auth: false }),
  me: () => request("/me"),
  updatePassword: (passwordCurrent, password) =>
    request("/updatePassword", { method: "PATCH", body: { passwordCurrent, password } }),
  getSealed: (set, limit) =>
    request(`/getSealed?${new URLSearchParams({ set, limit: String(limit) })}`),
  saveProducts: (set, products) =>
    request("/saveDb", { method: "POST", body: { set, products } }),
  getProducts: () => request("/products"),
  removeProduct: tcgPlayerId =>
    request(`/products/${encodeURIComponent(tcgPlayerId)}`, { method: "DELETE" })
};
