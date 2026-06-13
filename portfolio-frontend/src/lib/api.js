/**
 * Backend bilan aloqa qatlami.
 * Barcha so'rovlar shu yerdan o'tadi — manzil o'zgarsa, faqat .env'ni o'zgartirasiz.
 */
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Xatolik: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Loyihalar
  getProjects: () => request("/api/projects/"),

  // Aloqa formasi (keyingi bosqichda backend'ga messages routeri qo'shiladi)
  sendMessage: (data) =>
    request("/api/contact/", { method: "POST", body: JSON.stringify(data) }),
};

export { API_URL };
