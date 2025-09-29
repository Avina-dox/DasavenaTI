import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // ← MUY IMPORTANTE: pasar un objeto { email, password }
      await login({ email, password });
      nav("/");
    } catch (error) {
      // Mensaje limpio desde AuthProvider (o fallback)
      const msg =
        error?.message ||
        error?.response?.data?.message ||
        "No se pudo iniciar sesión";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const cx =
    "px-4 py-3 rounded-xl border border-[#BBA4C0] focus:outline-none focus:ring-2 focus:ring-[#6A2C75] bg-[#FFFFFF] text-[#6A2C75] placeholder-[#BBA4C0] transition shadow-sm w-full";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <img
          className="min-h-screen"
          src="https://dasavenasite.domcloud.dev/images/background-pattern.png"
          alt="background"
        />
      </div>

      <div className="z-10 w-full max-w-4xl mx-auto bg-white/90 rounded-2xl flex flex-col md:flex-row justify-center items-center shadow-2xl border border-[#BBA4C0] backdrop-blur-md p-4 md:p-8">
        <div className="hidden md:block flex-1">
          <img
            src="https://dasavenasite.domcloud.dev/images/logo.png"
            alt="Decoración"
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        <div className="rounded-3xl p-6 md:p-10 w-full max-w-md flex-1 items-center">
          <div className="mb-3 w-30 h-30 rounded-full to-[#BBA4C0] flex items-center justify-center shadow-lg border-4 border-[#BBA4C0] overflow-hidden mx-auto">
            <img
              src="https://dasavenasite.domcloud.dev/images/logo.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#6A2C75] mb-4 tracking-tight drop-shadow-sm text-center">
            Iniciar sesión
          </h1>
          <p className="mb-6 text-[#6A2C75]/80 text-base text-center">
            Bienvenido, por favor ingresa tus datos
          </p>

          <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
            <input
              type="email"
              placeholder="correo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cx}
            />

            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={cx}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A2C75]/80 text-sm"
                aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showPwd ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            {err && (
              <p className="mt-1 text-center text-sm text-red-600 font-semibold bg-red-50 rounded-lg px-4 py-2 shadow">
                {"Contraseña o correo incorrecto"}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 rounded-xl bg-gradient-to-r from-[#6A2C75] to-[#BBA4C0] text-white font-bold text-lg shadow-lg hover:from-[#BBA4C0] hover:to-[#6A2C75] transition disabled:opacity-70"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-xs text-[#BBA4C0]">¿Olvidaste tu contraseña?</span>
            <a
              href="https://dasavenasite.domcloud.dev/forgot-password"
              className="text-[#6A2C75] hover:underline text-sm font-medium transition"
            >
              Recuperar acceso
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
