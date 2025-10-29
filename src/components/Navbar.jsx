import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useTheme } from "@mui/material/styles"; // ← para saber si está dark/light
import { useColorMode } from "../components/ThemeProvider.jsx"; // ← toggle del tema


const linkBase =
  "px-4 py-2 rounded-lg text-base font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9C16C] focus-visible:ring-offset-2 shadow-sm border border-transparent";

function TopLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          linkBase,
          isActive
            ? "bg-[#fafafa29] text-white border-[#E9C16C] shadow hover:animate"
            : "bg-gradient-to-b from-[#6A2C75] to-[#752b62ad] px-4 py-2 rounded-xl shadow-lg hover:animate-pulse hover:bg-amber-100 hover:border-[#E9C16C]",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

function DesktopDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleButtonClick = () => setOpen((v) => !v);
  const handleOptionClick = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`${linkBase}  bg-gradient-to-b from-[#6A2C75] to-[#752b62ad] px-4 py-2 rounded-xl shadow-lg hover:animate-pulse inline-flex items-center gap-2`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={handleButtonClick}
      >
        {label}
        <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
          <path d="M6 9l6 6 6-6" fill="currentColor" />
        </svg>
      </button>
      <div
        className={`absolute right-0 mt-3 w-72 rounded-xl border border-white/10 bg-white/90 backdrop-blur-lg p-2 shadow-2xl transition-all ${
          open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2"
        }`}
        role="menu"
      >
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            onClick={handleOptionClick}
            className={({ isActive }) =>
              [
                "flex items-center gap-4  rounded-lg px-3 py-2 text-base transition-all border border-transparent ",
                isActive
                  ? "bg-white text-[#6A2C75] border-[#E9C16C] shadow"
                  : "bg-gradient-to-b from-[#6a2c7559] to-[#e9c26c3e] px-4 py-2 rounded-xl shadow-lg hover:animate-pulse hover:bg-amber-100 hover:border-[#E9C16C]",
              ].join(" ")
            }
          >
            <span className="grid h-8 w-8 place-content-center rounded-lg bg-[#F5F5F5] text-[#6A2C75]">
              {it.icon}
            </span>
            <div className="flex-1">
              <p className="font-semibold leading-5">{it.label}</p>
              {it.desc && <p className="text-xs opacity-70">{it.desc}</p>}
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  // tema
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { toggle } = useColorMode();   // ← alterna entre claro/oscuro

  useEffect(() => {
    setMobileOpen(false);
  }, [loc.pathname]);

  const doLogout = async () => {
    try {
      await logout();
    } finally {
      nav("/login");
    }
  };

  const activosMenu = [
    {
      to: "/activos",
      label: "Inventario",
      desc: "Listado, filtros y búsqueda",
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M4 4h16v4H4zM4 10h16v4H4zM4 16h16v4H4z" />
        </svg>
      ),
    },
    {
      to: "/activos/nuevo",
      label: "Nuevo activo",
      desc: "Registrar equipo/consumible",
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
        </svg>
      ),
    },
    {
      to: "/usuarios",
      label: "Usuarios",
      desc: "Ver activos por usuario",
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12 12a5 5 0 10-5-5 5 5 0 005 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
        </svg>
      ),
    },
  ];

  const asignacionesMenu = [
    {
      to: "/asignaciones",
      label: "Historial",
      desc: "Entregas y devoluciones",
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" />
        </svg>
      ),
    },
    {
      to: "/asignar",
      label: "Asignar activo",
      desc: "Entrega a colaborador",
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M21 12l-4 4v-3H8v-2h9V8zM4 6h8v2H4zm0 10h8v2H4z" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#E9C16C]/30 bg-[#6A2C75] backdrop-blur-xl shadow-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-4">
          <img
            src="https://dasavenasite.domcloud.dev/images/logo.png"
            alt="Dasavena"
            className="h-20 w-20 "
          />
          <span className="hidden sm:inline text-2xl  pr-10 font-bold tracking-wide text-white drop-shadow-lg ">
            Activos TI 
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
          <TopLink class="" to="/">Inicio</TopLink>
          <DesktopDropdown label="Activos" items={activosMenu} />
          <DesktopDropdown label="Asignaciones" items={asignacionesMenu} />
          <TopLink to="/reportes">Reportes</TopLink>

          {/* Perfil / Toggle / Logout */}
          <div className="ml-1 flex items-center gap-4">
            {/* Botón de modo claro/oscuro */}
            <button
              onClick={toggle}
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-3 py-2 text-white hover:bg-white/10 transition-all shadow"
            >
              {isDark ? (
                <>
                  {/* Ícono Sol (pasar a claro) */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10-9h-2v3h2V4zm7.04-.95l-1.41-1.41-1.79 1.8 1.41 1.41 1.79-1.8zM17 11h3v2h-3v-2zm-5 5a4 4 0 100-8 4 4 0 000 8zm4.24 3.16l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM13 20h-2v3h2v-3zM4.24 17.66l-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42z" />
                  </svg>
                  <span className="text-sm">Claro</span>
                </>
              ) : (
                <>
                  {/* Ícono Luna (pasar a oscuro) */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.74 2a9 9 0 108.52 12.06A7 7 0 0112.74 2z" />
                  </svg>
                  <span className="text-sm">Oscuro</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-inner border border-[#E9C16C]/30">
              <div className="grid h-9 w-9 place-content-center rounded-full bg-[#E9C16C] text-[#6A2C75] text-lg font-bold shadow">
                {(user?.name ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <span className="max-w-[180px] truncate text-[#6A2C75] text-base font-semibold">
                {(user?.name ?? "u" ).slice(0,7).toUpperCase()}
              </span>
            </div>
            <button
              onClick={doLogout}
              className="rounded-lg border border-[#e9c26c7d] px-5 py-1 text-base text-[#e7dbe9] bg-[#f5f5f517] hover:bg-[#f5f5f54c] transition-all shadow bg-gradient-to-br from-[#f5f5f538] via-[#e9c26c57] to-[#6a2c7577]"
            >
              Cerrar sesión
            </button> 
          </div>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex items-center gap-2 rounded-xl border border-white/30 px-3 py-2 text-white hover:bg-white/10 transition-all shadow"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-[max-height] duration-300 overflow-hidden ${
          mobileOpen ? "max-h-[600px]" : "max-h-0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 pb-4">
          <TopLink to="/">Inicio</TopLink>

          {/* Botón de tema también en móvil */}
          <button
            onClick={toggle}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E9C16C]/40 bg-white px-4 py-2 text-[#6A2C75] hover:bg-[#F5F5F5] transition-all shadow"
          >
            {isDark ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10-9h-2v3h2V4zm7.04-.95l-1.41-1.41-1.79 1.8 1.41 1.41 1.79-1.8zM17 11h3v2h-3v-2zm-5 5a4 4 0 100-8 4 4 0 000 8zm4.24 3.16l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM13 20h-2v3h2v-3zM4.24 17.66l-1.79 1.8 1.41 1.41 1.8-1.79-1.42-1.42z" />
                </svg>
                <span className="text-sm font-medium">Modo claro</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.74 2a9 9 0 108.52 12.06A7 7 0 0112.74 2z" />
                </svg>
                <span className="text-sm font-medium">Modo oscuro</span>
              </>
            )}
          </button>

          {/* Grupos móviles */}
          <div className="rounded-xl border border-[#E9C16C]/20 bg-white/90 backdrop-blur-lg shadow-lg">
            <p className="px-4 pt-4 text-xs font-bold uppercase tracking-wide text-[#6A2C75]/80">Activos</p>
            <div className="p-2">
              {activosMenu.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-lg px-4 py-2 text-base transition-all border border-transparent",
                      isActive
                        ? "bg-white text-[#6A2C75] border-[#E9C16C] shadow"
                        : "text-[#6A2C75] hover:bg-[#F5F5F5] hover:text-[#E9C16C] hover:border-[#E9C16C]",
                    ].join(" ")
                  }
                >
                  <span className="grid h-8 w-8 place-content-center rounded-lg bg-[#F5F5F5]">{it.icon}</span>
                  {it.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#E9C16C]/20 bg-white/90 backdrop-blur-lg shadow-lg">
            <p className="px-4 pt-4 text-xs font-bold uppercase tracking-wide text-[#6A2C75]/80">Asignaciones</p>
            <div className="p-2">
              {asignacionesMenu.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-lg px-4 py-2 text-base transition-all border border-transparent",
                      isActive
                        ? "bg-white text-[#6A2C75] border-[#E9C16C] shadow"
                        : "text-[#6A2C75] hover:bg-[#F5F5F5] hover:text-[#E9C16C] hover:border-[#E9C16C]",
                    ].join(" ")
                  }
                >
                  <span className="grid h-8 w-8 place-content-center rounded-lg bg-[#F5F5F5]">{it.icon}</span>
                  {it.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Perfil + logout */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-[#E9C16C]/40 bg-white px-5 py-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-content-center rounded-full bg-[#E9C16C] text-[#6A2C75] text-xl font-bold shadow">
                {(user?.name ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-[#6A2C75] text-base font-bold">{user?.name}</p>
                <p className="text-[#6A2C75]/70 text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={doLogout}
              className="rounded-lg border border-[#E9C16C] px-4 py-2 text-base text-[#6A2C75] bg-white hover:bg-[#F5F5F5] transition-all shadow"
            >
              Salir
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
