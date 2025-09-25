import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function ProtectedRoute({ children }) {
  const { loading, authed } = useAuth();
  if (loading) return <div style={{padding:16}}>⏳ Cargando sesión…</div>;
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}
