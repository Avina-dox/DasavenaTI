import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const linkBase =
  "px-3 py-2 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-[#E9C16C]";

function TopLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          linkBase,
          isActive
            ? "bg-black/20 text-white"
            : "text-slate-100/90 hover:text-white hover:bg-white/10",
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

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`${linkBase} text-slate-100/90 hover:text-white hover:bg-white/10 inline-flex items-center gap-2`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {label}
        <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-80">
          <path d="M6 9l6 6 6-6" fill="currentColor" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className={`absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#2B2030]/95 backdrop-blur p-2 shadow-xl transition-all ${
          open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"
        }`}
        role="menu"
      >
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-200 hover:bg-white/10 hover:text-white",
              ].join(" ")
            }
          >
            <span className="grid h-7 w-7 place-content-center rounded-lg bg-white/10">
              {it.icon}
            </span>
            <div className="flex-1">
              <p className="font-medium leading-5">{it.label}</p>
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

  useEffect(() => {
    // Cierra menú móvil al navegar
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M4 4h16v4H4zM4 10h16v4H4zM4 16h16v4H4z" />
        </svg>
      ),
    },
    {
      to: "/activos/nuevo",
      label: "Nuevo activo",
      desc: "Registrar equipo/consumible",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
        </svg>
      ),
    },
    {
      to: "/usuarios",
      label: "Usuarios",
      desc: "Ver activos por usuario",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
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
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" />
        </svg>
      ),
    },
    {
      to: "/asignar",
      label: "Asignar activo",
      desc: "Entrega a colaborador",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M21 12l-4 4v-3H8v-2h9V8zM4 6h8v2H4zm0 10h8v2H4z" />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-b from-[#6A2C75] via-[#6A2C75] to-[#BBA4C0] backdrop-blur supports-[backdrop-filter]:bg-[#BBA4C0]/70 shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3">
          <img
            src="https://dasavenasite.domcloud.dev/images/logo.png"
            alt="Dasavena"
            className="h-9 w-9 rounded-xl shadow"
          />
          <span className="hidden text-white sm:inline font-semibold tracking-wide">
            Dasavena Activos TI
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <TopLink to="/">Inicio</TopLink>

          <DesktopDropdown label="Activos" items={activosMenu} />
          <DesktopDropdown label="Asignaciones" items={asignacionesMenu} />

          <TopLink to="/reportes">Reportes</TopLink>

          <div className="ml-4 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 shadow-inner">
              <div className="grid h-8 w-8 place-content-center rounded-full bg-[#E9C16C] text-black text-sm font-bold shadow">
                {(user?.name ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <span className="max-w-[180px] truncate text-white text-sm font-medium">
                {user?.name}
              </span>
            </div>
            <button
              onClick={doLogout}
              className="rounded-xl border border-[#E9C16C] px-3 py-2 text-sm text-black bg-gradient-to-r from-[#D6A644] to-[#E9C16C] hover:from-[#E9C16C] hover:to-[#D6A644] transition-colors shadow"
            >
              Cerrar sesión
            </button>
          </div>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-[max-height] duration-300 overflow-hidden ${
          mobileOpen ? "max-h-[480px]" : "max-h-0"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-2 px-4 pb-4">
          <TopLink to="/">Inicio</TopLink>

          {/* Grupos móviles */}
          <div className="rounded-2xl border border-white/10 bg-white/5">
            <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-white/70">Activos</p>
            <div className="p-2">
              {activosMenu.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-200 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  <span className="grid h-7 w-7 place-content-center rounded-lg bg-white/10">{it.icon}</span>
                  {it.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5">
            <p className="px-3 pt-3 text-xs font-semibold uppercase tracking-wide text-white/70">Asignaciones</p>
            <div className="p-2">
              {asignacionesMenu.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-200 hover:bg-white/10 hover:text-white",
                    ].join(" ")
                  }
                >
                  <span className="grid h-7 w-7 place-content-center rounded-lg bg-white/10">{it.icon}</span>
                  {it.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Perfil + logout */}
          <div className="mt-2 flex items-center justify-between rounded-2xl border border-[#D6A644]/40 bg-gradient-to-r from-[#D6A644]/80 to-[#E9C16C]/80 px-4 py-3 shadow">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-content-center rounded-full bg-[#E9C16C] text-black text-base font-bold shadow">
                {(user?.name ?? "U").slice(0, 1).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-black text-sm font-semibold">{user?.name}</p>
                <p className="text-[#6A2C75] text-xs">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={doLogout}
              className="rounded-xl border border-[#D6A644] px-3 py-2 text-sm text-black bg-white/80 hover:bg-white"
            >
              Salir
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
