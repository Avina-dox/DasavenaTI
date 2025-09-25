import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const doLogout = async () => {
    try { await logout(); } finally { nav("/login"); }
  };

  const linkClass = ({ isActive }) =>
    [
      "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-300 hover:text-white hover:bg-slate-800/60",
    ].join(" ");

return (
    <header className="sticky top-0 z-50  border-[#a673af] bg-gradient-to-b from-[#6A2C75] via-[#6A2C75] to-[#BBA4C0] backdrop-blur supports-[backdrop-filter]:bg-[#BBA4C0]/70 shadow-lg">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-3">
                <span className="grid h-20 w-20 rounded-2xl text-white font-extrabold text-lg ">
                    <img src="https://dasavenasite.domcloud.dev/images/logo.png" alt="logo" />
                </span>
                <span className="hidden text-white sm:inline font-bold tracking-wide text-lg drop-shadow">
                    DasavenaActivosTI
                </span>
            </NavLink>

            {/* Botón menú móvil */}
            <button
                className="inline-flex items-center gap-2 rounded-xl border border-[#6A2C75] px-4 py-2 text-white md:hidden hover:bg-[#BBA4C0]/60 transition-colors shadow"
                onClick={() => setOpen(!open)}
                aria-label="Abrir menú"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>

            {/* Links desktop */}
            <nav className="hidden items-center gap-4 md:flex">
                <NavLink to="/" className={linkClass}>Inicio</NavLink>
                <NavLink to="/" className={linkClass}>Inicio</NavLink>
                <NavLink to="/" className={linkClass}>Inicio</NavLink>
                {/* Agrega más: <NavLink to="/perfil" className={linkClass}>Perfil</NavLink> */}

                <div className="ml-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-[#6A2C75] px-3 py-2 shadow-inner">
                        <div className="grid h-8 w-8 place-content-center rounded-full bg-[#D6a644] text-black text-base font-bold shadow">
                            {(user?.name ?? "U").slice(0,1).toUpperCase()}
                        </div>
                        <span className="max-w-[160px] truncate text-white text-base font-medium">
                            {user?.name}
                        </span>
                    </div>
                    <button
                        onClick={doLogout}
                        className="rounded-xl border border-[#D6a644] px-4 py-2 text-base text-black bg-gradient-to-r from-[#D6a644] to-[#E9C16C] hover:from-[#E9C16C] hover:to-[#D6a644] transition-colors shadow"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </nav>
        </div>

        {/* Links móvil */}
        <div
            className={`md:hidden transition-[max-height] duration-300 overflow-hidden ${
                open ? "max-h-96" : "max-h-0"
            }`}
        >
            <nav className="mx-auto flex max-w-6xl flex-col gap-2 px-6 pb-4">
                <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>
                    Inicio
                </NavLink>
                <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>
                    Inicio
                </NavLink>
                <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>
                    Inicio
                </NavLink>
                {/* Más links móviles… */}

                <div className="mt-2 flex items-center justify-between rounded-2xl border border-[#D6a644] bg-gradient-to-r from-[#D6a644] to-[#E9C16C] px-4 py-3 shadow">
                    <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-content-center rounded-full bg-[#D6a644] text-black text-lg font-bold shadow">
                            {(user?.name ?? "U").slice(0,1).toUpperCase()}
                        </div>
                        <div className="leading-tight">
                            <p className="text-black text-base font-semibold">{user?.name}</p>
                            <p className="text-[#6A2C75] text-xs">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { setOpen(false); doLogout(); }}
                        className="rounded-xl border border-[#D6a644] px-4 py-2 text-base text-black bg-gradient-to-r from-[#D6a644] to-[#E9C16C] hover:from-[#E9C16C] hover:to-[#D6a644] transition-colors shadow"
                    >
                        Salir
                    </button>
                </div>
            </nav>
        </div>
    </header>
);
}