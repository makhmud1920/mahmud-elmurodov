/**
 * Backend bilan aloqa qatlami.
 * Manzil .env dagi VITE_API_URL orqali (deploy'da Render backend).
 * Admin so'rovlari cookie (httpOnly JWT) + CSRF token bilan himoyalangan.
 */
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getCookie(name) {
  const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return m ? decodeURIComponent(m.pop()) : "";
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  // yozish so'rovlarida CSRF token (cookie'dan o'qiladi)
  if (auth && method !== "GET") {
    const csrf = getCookie("csrf_token");
    if (csrf) headers["X-CSRF-Token"] = csrf;
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include", // cookie yuborilishi uchun
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Xatolik: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Ommaviy (o'qish)
  listPosts: () => request("/api/posts/"),
  getPost: (slug) => request(`/api/posts/${slug}`),

  // Auth
  login: (username, password) =>
    request("/api/auth/login", { method: "POST", body: { username, password } }),
  logout: () => request("/api/auth/logout", { method: "POST", auth: true }),
  me: () => request("/api/auth/me"),

  // Admin (mavzularni boshqarish)
  adminPosts: () => request("/api/posts/admin/all"),
  createPost: (data) => request("/api/posts/", { method: "POST", body: data, auth: true }),
  updatePost: (id, data) =>
    request(`/api/posts/${id}`, { method: "PUT", body: data, auth: true }),
  deletePost: (id) => request(`/api/posts/${id}`, { method: "DELETE", auth: true }),
};

export { API_URL };
