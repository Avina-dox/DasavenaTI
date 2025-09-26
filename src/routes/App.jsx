import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import NavBar from "../components/Navbar.jsx";

// Páginas
import Activos from "../pages/Activos";
import ActivoNuevo from "../pages/ActivoNuevo";
import Asignaciones from "../pages/Asignaciones";
import Asignar from "../pages/Asignar";
import Usuarios from "../pages/Usuarios";
import UsuarioDetalle from "../pages/UsuarioDetalle";
import Login from "../pages/Login";  // ya la tienes
import Health from "../pages/Healt.jsx"; // opcional

function RequireAuth({ children }) {
  const auth = useAuth();          // puede ser null si algo falla
  if (!auth) return null;          // evita crasheo si no hay provider
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function LayoutPrivate({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/health" element={<Health />} />

        {/* Privada */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <LayoutPrivate>
                <Activos />
              </LayoutPrivate>
            </RequireAuth>
          }
        />
        <Route
          path="/activos"
          element={
            <RequireAuth>
              <LayoutPrivate>
                <Activos />
              </LayoutPrivate>
            </RequireAuth>
          }
        />
        <Route
          path="/activos/nuevo"
          element={
            <RequireAuth>
              <LayoutPrivate>
                <ActivoNuevo />
              </LayoutPrivate>
            </RequireAuth>
          }
        />
        <Route
          path="/asignaciones"
          element={
            <RequireAuth>
              <LayoutPrivate>
                <Asignaciones />
              </LayoutPrivate>
            </RequireAuth>
          }
        />
        <Route
          path="/asignar"
          element={
            <RequireAuth>
              <LayoutPrivate>
                <Asignar />
              </LayoutPrivate>
            </RequireAuth>
          }
        />
        <Route
          path="/usuarios"
          element={
            <RequireAuth>
              <LayoutPrivate>
                <Usuarios />
              </LayoutPrivate>
            </RequireAuth>
          }
        />
        <Route
          path="/usuarios/:id"
          element={
            <RequireAuth>
              <LayoutPrivate>
                <UsuarioDetalle />
              </LayoutPrivate>
            </RequireAuth>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
