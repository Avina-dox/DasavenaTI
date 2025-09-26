import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function Activos() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [typeId, setTypeId] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get("/assets", { params: { q, status, type_id: typeId, ...params } });
      setRows(data.data || data); // si tu paginación viene como {data, meta}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // primera carga

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg font-semibold">Activos</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            placeholder="Buscar (tag/serie/marca/modelo)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-[#E9C16C]"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 focus:ring-[#E9C16C]"
          >
            <option value="">Estado</option>
            <option value="in_stock">Disponible</option>
            <option value="assigned">Asignado</option>
            <option value="repair">Reparación</option>
            <option value="retired">Baja</option>
          </select>
          <input
            type="number"
            min="1"
            placeholder="Type ID"
            value={typeId}
            onChange={(e) => setTypeId(e.target.value)}
            className="w-24 rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/10 focus:ring-[#E9C16C]"
          />
          <button
            onClick={() => fetchData({ page: 1 })}
            className="rounded-xl border border-[#E9C16C] px-3 py-2 text-sm text-black bg-gradient-to-r from-[#D6A644] to-[#E9C16C]"
          >
            Filtrar
          </button>
          <Link
            to="/activos/nuevo"
            className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
          >
            + Nuevo activo
          </Link>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Tag</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Marca / Modelo</th>
              <th className="px-3 py-2 text-left">Serie</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Asignado a</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-3 py-3" colSpan={6}>Cargando…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td className="px-3 py-3" colSpan={6}>Sin resultados</td></tr>
            )}
            {rows.map((a) => (
              <tr key={a.id} className="odd:bg-white/5">
                <td className="px-3 py-2 font-mono">{a.asset_tag}</td>
                <td className="px-3 py-2">{a.type?.name}</td>
                <td className="px-3 py-2">{[a.brand, a.model].filter(Boolean).join(" / ")}</td>
                <td className="px-3 py-2">{a.serial_number}</td>
                <td className="px-3 py-2">{a.status}</td>
                <td className="px-3 py-2">
                  {a.current_assignment?.user?.name ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
