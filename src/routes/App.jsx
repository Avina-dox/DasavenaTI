// src/routes/App.jsx
import React from "react";
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

import NavBar from "../components/Navbar.jsx";

// Páginas
import Activos from "../pages/Activos";
import ActivoNuevo from "../pages/ActivoNuevo";
import Asignaciones from "../pages/Asignaciones";
import Asignar from "../pages/Asignar";
import Usuarios from "../pages/Usuarios";
import UsuarioDetalle from "../pages/UsuarioDetalle";
import Login from "../pages/Login";
import Health from "../pages/Healt.jsx";
import Inicio from "../pages/Inicio.jsx";
import ActivoEditar from "../pages/ActivoEditar.jsx";

import PublicAsset from "../pages/PublicAsset.jsx";

function RequireAuth({ children }) {
  const auth = useAuth();
  if (!auth) return null;
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

// Usa HashRouter en build (producción) para evitar 404 del servidor
const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;
// Si quieres probar rápido, puedes forzar siempre HashRouter:
// const Router = HashRouter;

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Pública */}
        <Route path="/a/:id" element={<PublicAsset />} />
        <Route path="/login" element={<Login />} />
        <Route path="/health" element={<Health />} />

        {/* Privada */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <LayoutPrivate>
                <Inicio />
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
          path="/activos/editar/:id"
          element={
            <RequireAuth>
              <LayoutPrivate>
                <ActivoEditar />
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
    </Router>
  );
}
