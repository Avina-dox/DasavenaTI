// api.js
import axios from "axios";

// Cambia SOLO esta bandera cuando quieras trabajar en local
const USE_LOCAL_API = true; // ← pon false para usar producción

const URLS = {
  LOCAL: "http://localhost/api", // ajusta tu puerto/ruta si aplica
  PROD: import.meta.env.VITE_API_BASE ?? "https://dasavenasite.domcloud.dev/api",
};

export const API_BASE = USE_LOCAL_API ? URLS.LOCAL : URLS.PROD;

const api = axios.create({ baseURL: API_BASE });

const getToken = () => localStorage.getItem("access_token");
export const setToken = (t) => localStorage.setItem("access_token", t);
export const clearToken = () => localStorage.removeItem("access_token");

// Adjunta Authorization y LOG para ver si viaja
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  // DEBUG: ver en consola cada request
  console.log(
    "[API]",
    (config.method || "get").toUpperCase(),
    (config.baseURL || "") + (config.url || ""),
    t ? "✓ AUTH" : "✗ NO AUTH"
  );
  return config;
});

export default api;
