import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setToken as saveToken, clearToken as dropToken } from "../lib/api";

const AuthCtx = createContext(null);

export function useAuth() {
  return useContext(AuthCtx);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem("access_token") || "");
  const isAuthenticated = !!token;

  // Hidrata usuario si tienes un endpoint /me (opcional)
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) return;
      try {
        const { data } = await api.get("/me"); // si no tienes /me, comenta esto
        if (!ignore) setUser(data);
      } catch {
        // Token inválido → limpia
        if (!ignore) {
          dropToken();
          setTokenState("");
          setUser(null);
        }
      }
    })();
    return () => { ignore = true; };
  }, [token]);

  const login = async ({ email, password }) => {
    const { data } = await api.post("/login", { email, password });
    const t = data.token;   // ajusta si tu campo de token tiene otro nombre
    const u = data.user;
    saveToken(t);
    setTokenState(t);
    setUser(u ?? null);
    return { user: u, token: t };
  };

  const logout = async () => {
    // Si tienes endpoint para revocar, puedes llamarlo aquí
    dropToken();
    setTokenState("");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, setUser, token, isAuthenticated, login, logout }),
    [user, token, isAuthenticated]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
