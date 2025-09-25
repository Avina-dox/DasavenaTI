import { createContext, useContext, useEffect, useState } from "react";
import api, { setToken, clearToken } from "../lib/api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(null);

  // Rehidrata desde localStorage (sin /api/me)
  useEffect(() => {
    const t = localStorage.getItem("access_token");
    const u = localStorage.getItem("user_json");
    if (t && u) {
      setAuthed(true);
      try { setUser(JSON.parse(u)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/api/login", { email, password });
    // Tu API devuelve { user, token }
    if (data?.token) setToken(data.token);
    if (data?.user) {
      setUser(data.user);
      localStorage.setItem("user_json", JSON.stringify(data.user));
    }
    setAuthed(true);
  };

  const logout = async () => {
    // No tienes /api/logout, así que limpiamos local
    clearToken();
    localStorage.removeItem("user_json");
    setUser(null);
    setAuthed(false);
  };

  return (
    <Ctx.Provider value={{ loading, authed, user, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}
