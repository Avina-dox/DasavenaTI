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
    <section className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-[#E9C16C] tracking-widest drop-shadow-lg">Activos</h1>
        <div className="flex flex-wrap items-center gap-3">
          <input
            placeholder="Buscar (tag/serie/marca/modelo)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-xl bg-[#181A20] px-4 py-2 text-sm text-[#E9C16C] outline-none ring-2 ring-[#E9C16C]/30 focus:ring-[#E9C16C] transition-all shadow-lg"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl bg-[#181A20] px-4 py-2 text-sm text-[#E9C16C] ring-2 ring-[#E9C16C]/30 focus:ring-[#E9C16C] transition-all shadow-lg"
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
            className="w-24 rounded-xl bg-[#181A20] px-4 py-2 text-sm text-[#E9C16C] ring-2 ring-[#E9C16C]/30 focus:ring-[#E9C16C] transition-all shadow-lg"
          />
          <button
            onClick={() => fetchData({ page: 1 })}
            className="rounded-xl border border-[#E9C16C] px-4 py-2 text-sm text-[#181A20] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] shadow-lg hover:scale-105 transition-transform"
          >
            Filtrar
          </button>
          <Link
            to="/activos/nuevo"
            className="rounded-xl bg-[#181A20] px-4 py-2 text-sm text-[#E9C16C] border border-[#E9C16C]/30 hover:bg-[#23263a] shadow-lg transition-all"
          >
            + Nuevo activo
          </Link>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border-2 border-[#E9C16C]/30 bg-gradient-to-br from-[#181A20] via-[#23263a] to-[#181A20] shadow-2xl">
        <table className="min-w-full text-sm text-[#E9C16C]">
          <thead className="bg-gradient-to-r from-[#23263a] to-[#181A20]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold tracking-wider border-b border-[#E9C16C]/20">Tag</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wider border-b border-[#E9C16C]/20">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wider border-b border-[#E9C16C]/20">Marca / Modelo</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wider border-b border-[#E9C16C]/20">Serie</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wider border-b border-[#E9C16C]/20">Estado</th>
              <th className="px-4 py-3 text-left font-semibold tracking-wider border-b border-[#E9C16C]/20">Asignado a</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-4 text-center text-[#E9C16C]/70 animate-pulse" colSpan={6}>
                  Cargando…
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-[#E9C16C]/70" colSpan={6}>
                  Sin resultados
                </td>
              </tr>
            )}
            {rows.map((a) => (
              <tr
                key={a.id}
                className="odd:bg-[#23263a]/40 even:bg-[#181A20]/60 hover:bg-[#E9C16C]/10 transition-colors"
              >
                <td className="px-4 py-3 font-mono">{a.asset_tag}</td>
                <td className="px-4 py-3">{a.type?.name}</td>
                <td className="px-4 py-3">{[a.brand, a.model].filter(Boolean).join(" / ")}</td>
                <td className="px-4 py-3">{a.serial_number}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      a.status === "in_stock"
                        ? "bg-green-700/40 text-green-300"
                        : a.status === "assigned"
                        ? "bg-blue-700/40 text-blue-300"
                        : a.status === "repair"
                        ? "bg-yellow-700/40 text-yellow-300"
                        : a.status === "retired"
                        ? "bg-red-700/40 text-red-300"
                        : "bg-gray-700/40 text-gray-300"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {a.current_assignment?.user?.name ?? <span className="text-[#E9C16C]/40">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
