// api.js
import axios from "axios";

// Cambia SOLO esta bandera cuando quieras trabajar en local
const USE_LOCAL_API = false; // ← pon false para usar producción

const URLS = {
  LOCAL: "http://localhost/api", // ajusta si tu API local cambia
  PROD: import.meta.env.VITE_API_BASE ?? "https://dasavenasite.domcloud.dev/api",
};

export const API_BASE = USE_LOCAL_API ? URLS.LOCAL : URLS.PROD;

const api = axios.create({ baseURL: API_BASE });

// --- Auth helpers ---
const getToken = () => localStorage.getItem("access_token");
export const setToken = (t) => localStorage.setItem("access_token", t);
export const clearToken = () => localStorage.removeItem("access_token");

// --- Interceptors ---
const isDev = import.meta.env.DEV;

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  if (isDev) {
    console.log(
      "[API]",
      (config.method || "get").toUpperCase(),
      (config.baseURL || "") + (config.url || ""),
      t ? "✓ AUTH" : "✗ NO AUTH"
    );
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Token inválido / sesión expirada
      clearToken();
      // Opcional: redirigir a login
      // window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// --- Helper para URLs públicas de /storage ---
/**
 * Convierte un path de storage (p.ej. "invoices/archivo.pdf")
 * en una URL pública correcta, eliminando el sufijo "/api" de API_BASE.
 * - Si ya viene una URL absoluta, la regresa tal cual.
 */
export const storagePublicUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // ya es URL completa
  const siteBase = API_BASE.replace(/\/api\/?$/,'').replace(/\/$/,''); // http(s)://host[:puerto]
  // Normaliza por si te pasan "storage/..." o "/storage/..."
  const clean = String(path).replace(/^\/?storage\/?/,'');
  return `${siteBase}/storage/${clean}`;
};

export default api;
