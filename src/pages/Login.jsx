import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav("/");
    } catch (error) {
      setErr(error?.response?.data?.message || "No se pudo iniciar sesión");
    }
  }

return (
    
    <div className="min-h-screen flex items-center justify-center  ">
        
        <div className="absolute inset-0 overflow-hidden">
        <img className="min-h-screen" src="https://dasavenasite.domcloud.dev/images/background-pattern.png" alt="background" />
</div>
        <div className="z-10 w-full max-w-4xl mx-auto bg-white/90 rounded-2xl flex flex-col md:flex-row justify-center items-center shadow-2xl border border-[#BBA4C0] backdrop-blur-md p-4 md:p-8">
            <div className="hidden md:block flex-1">
                {/* Imagen adicional */}
                <img
                    src="https://dasavenasite.domcloud.dev/images/logo.png"
                    alt="Decoración"
                    className="w-full h-full object-cover rounded-2xl"
                />
            </div>
            <div className="rounded-3xl p-6 md:p-10 w-full max-w-md flex-1 items-center">
                {/* Logo */}
                <div className="mb-3 w-30 h-30  rounded-full  to-[#BBA4C0] flex items-center justify-center shadow-lg border-4 border-[#BBA4C0] overflow-hidden mx-auto">
                    <img
                        src="https://dasavenasite.domcloud.dev/images/logo.png"
                        alt="Logo"
                        className="w-full h-full  object-contain"
                    />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#6A2C75] mb-4 tracking-tight drop-shadow-sm text-center">Iniciar sesión</h1>
                <p className="mb-6 text-[#6A2C75]/80 text-base text-center">Bienvenido, por favor ingresa tus datos</p>
                <form onSubmit={onSubmit} className="w-full flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="px-4 py-3 rounded-xl border border-[#BBA4C0] focus:outline-none focus:ring-2 focus:ring-[#6A2C75] bg-[#FFFFFF] text-[#6A2C75] placeholder-[#BBA4C0] transition shadow-sm"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="px-4 py-3 rounded-xl border border-[#BBA4C0] focus:outline-none focus:ring-2 focus:ring-[#6A2C75] bg-[#FFFFFF] text-[#6A2C75] placeholder-[#BBA4C0] transition shadow-sm"
                    />
                    <button
                        type="submit"
                        className="mt-2 py-3 rounded-xl bg-gradient-to-r from-[#6A2C75] to-[#BBA4C0] text-white font-bold text-lg shadow-lg hover:from-[#BBA4C0] hover:to-[#6A2C75] transition"
                    >
                        Entrar
                    </button>
                </form>
                {err && (
                    <p className="mt-5 text-center text-sm text-red-600 font-semibold bg-red-50 rounded-lg px-4 py-2 shadow">
                        {err}
                    </p>
                )}
                <div className="mt-8 flex flex-col items-center gap-2 ">
                    <span className="text-xs text-[#BBA4C0]">¿Olvidaste tu contraseña?</span>
                    <button className="text-[#6A2C75] hover:underline text-sm font-medium transition" ><a href="https://dasavenasite.domcloud.dev/forgot-password">Recuperar acceso</a></button>
                </div>
            </div>
        </div>
    </div>
);
}
