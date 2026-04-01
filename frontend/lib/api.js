const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vedic-astro-backend-rox2.onrender.com";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BACKEND}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) throw new Error(text || "Request failed");
    return { raw: text };
  }
  if (!res.ok) throw new Error(data.detail || "Request failed");
  return data;
}
