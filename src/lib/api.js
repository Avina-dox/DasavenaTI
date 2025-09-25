import axios from 'axios';

export const API_BASE =
    import.meta.env.VITE_API_BASE ?? "https://dasavenasite.domcloud.dev/";

const api = axios.create({ baseURL: API_BASE });

const getToken = () => localStorage.getItem("access_token");
export const setToken = (t) => localStorage.setItem("access_token", t);
export const clearToken = () => localStorage.removeItem("access_token");

// Adjunta Authorization si hay token
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;


