import { Link } from "react-router-dom";

export default function Usuarios(){
  // Puedes conectar a un endpoint de usuarios luego. Por ahora, instructivo:
  return (
    <section>
      <h1 className="text-lg font-semibold mb-3">Usuarios</h1>
      <p className="opacity-80 mb-4">Crea una tabla más adelante. Por ahora, entra manualmente al detalle:
        <code className="ml-2 rounded bg-white/10 px-2 py-1">/usuarios/1</code>
      </p>
      <Link to="/usuarios/1" className="rounded-xl bg-white/10 px-3 py-2 text-sm">Ver usuario 1</Link>
    </section>
  );
}
