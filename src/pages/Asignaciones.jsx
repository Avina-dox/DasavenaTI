import { useEffect, useState } from "react";
import api from "../lib/api";

function fmt(dt) {
  try { return new Date(dt).toLocaleString(); } catch { return "—"; }
}

export default function Asignaciones() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  // filtros
  const [q, setQ] = useState("");
  const [state, setState] = useState("all"); // current | returned | all
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/assignments", {
        params: { q, state, from, to, page },
      });
      // pagination {data, meta}
      setRows(data.data || data);
      setMeta(data.meta || null);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); /* primera carga */ }, []);

  const devolver = async (assignment) => {
    if (!confirm(`¿Devolver ${assignment.asset?.asset_tag} de ${assignment.user?.name}?`)) return;
    try {
      await api.post(`/assignments/${assignment.id}/return`, {
        condition_in: "good",
        notes: "Devuelto desde panel",
      });
      await fetchData(meta?.current_page || 1);
      alert("Devuelto correctamente");
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo devolver");
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Historial de asignaciones</h1>
          <p className="text-sm opacity-70">Filtra por activo, usuario, estado o fechas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            placeholder="Buscar (tag/serie/marca/modelo/usuario)"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-[#E9C16C]"
          />
          <select
            value={state}
            onChange={(e)=>setState(e.target.value)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 focus:ring-[#E9C16C]"
          >
            <option value="all">Todos</option>
            <option value="current">Vigentes</option>
            <option value="returned">Devueltos</option>
          </select>
          <input
            type="date" value={from} onChange={(e)=>setFrom(e.target.value)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 focus:ring-[#E9C16C]"
          />
          <input
            type="date" value={to} onChange={(e)=>setTo(e.target.value)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 focus:ring-[#E9C16C]"
          />
          <button
            onClick={()=>fetchData(1)}
            className="rounded-xl border border-[#E9C16C] px-3 py-2 text-sm text-black bg-gradient-to-r from-[#D6A644] to-[#E9C16C]"
          >
            Filtrar
          </button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Fecha asignación</th>
              <th className="px-3 py-2 text-left">Activo</th>
              <th className="px-3 py-2 text-left">Usuario</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Devuelto</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-3 py-3" colSpan={6}>Cargando…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td className="px-3 py-3" colSpan={6}>Sin resultados</td></tr>
            )}
            {rows.map((r)=> {
              const vigente = !r.returned_at;
              return (
                <tr key={r.id} className="odd:bg-white/5">
                  <td className="px-3 py-2">{fmt(r.assigned_at)}</td>
                  <td className="px-3 py-2">
                    <div className="font-mono">{r.asset?.asset_tag}</div>
                    <div className="opacity-70">
                      {[r.asset?.brand, r.asset?.model].filter(Boolean).join(" / ")}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>{r.user?.name}</div>
                    <div className="opacity-70">{r.user?.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    {vigente ? <span className="text-amber-300">Vigente</span> : "Devuelto"}
                  </td>
                  <td className="px-3 py-2">{r.returned_at ? fmt(r.returned_at) : "—"}</td>
                  <td className="px-3 py-2">
                    {vigente ? (
                      <button
                        onClick={()=>devolver(r)}
                        className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                      >
                        Devolver
                      </button>
                    ) : (
                      <span className="opacity-60 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* paginación simple */}
      {meta && (
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={!meta.prev_page_url}
            onClick={()=>fetchData(meta.current_page - 1)}
            className="rounded-xl bg-white/10 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="text-sm opacity-80">
            Página {meta.current_page} de {meta.last_page}
          </span>
          <button
            disabled={!meta.next_page_url}
            onClick={()=>fetchData(meta.current_page + 1)}
            className="rounded-xl bg-white/10 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </section>
  );
}
