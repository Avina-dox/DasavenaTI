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
      setRows(data.data || data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#181A20] via-[#23263a] to-[#181A20] py-10 px-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-[#E9C16C] tracking-widest drop-shadow-lg mb-1">Activos</h1>
          <p className="text-[#E9C16C]/60 text-sm">Gestión y seguimiento de activos tecnológicos</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            placeholder="Buscar (tag/serie/marca/modelo)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-2xl bg-[#23263a] px-4 py-2 text-sm text-[#E9C16C] outline-none ring-2 ring-[#E9C16C]/30 focus:ring-[#E9C16C] transition-all shadow-md"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl bg-[#23263a] px-4 py-2 text-sm text-[#E9C16C] ring-2 ring-[#E9C16C]/30 focus:ring-[#E9C16C] transition-all shadow-md"
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
            className="w-24 rounded-2xl bg-[#23263a] px-4 py-2 text-sm text-[#E9C16C] ring-2 ring-[#E9C16C]/30 focus:ring-[#E9C16C] transition-all shadow-md"
          />
          <button
            onClick={() => fetchData({ page: 1 })}
            className="rounded-2xl border border-[#E9C16C] px-4 py-2 text-sm text-[#181A20] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] shadow-md hover:scale-105 transition-transform font-semibold"
          >
            Filtrar
          </button>
          <Link
            to="/activos/nuevo"
            className="rounded-2xl bg-gradient-to-r from-[#E9C16C]/10 to-[#23263a] px-4 py-2 text-sm text-[#E9C16C] border border-[#E9C16C]/30 hover:bg-[#E9C16C]/10 shadow-md transition-all font-semibold"
          >
            + Nuevo activo
          </Link>
        </div>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && (
          <div className="col-span-full flex justify-center items-center py-16">
            <span className="text-[#E9C16C]/70 animate-pulse text-lg">Cargando…</span>
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div className="col-span-full flex justify-center items-center py-16">
            <span className="text-[#E9C16C]/40 text-lg">Sin resultados</span>
          </div>
        )}
        {!loading && rows.map((a) => (
          <div
            key={a.id}
            className="rounded-3xl bg-gradient-to-br from-[#23263a] via-[#181A20] to-[#23263a] border border-[#E9C16C]/10 shadow-xl p-6 flex flex-col gap-3 hover:scale-[1.025] hover:shadow-2xl transition-transform group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-lg font-bold text-[#E9C16C]">{a.asset_tag}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border
                  ${
                    a.status === "in_stock"
                      ? "bg-green-700/30 text-green-200 border-green-400/30"
                      : a.status === "assigned"
                      ? "bg-blue-700/30 text-blue-200 border-blue-400/30"
                      : a.status === "repair"
                      ? "bg-yellow-700/30 text-yellow-200 border-yellow-400/30"
                      : a.status === "retired"
                      ? "bg-red-700/30 text-red-200 border-red-400/30"
                      : "bg-gray-700/30 text-gray-200 border-gray-400/30"
                  }
                `}
              >
                {a.status}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[#E9C16C]/70 font-semibold">Tipo:</span>
                <span className="text-[#E9C16C]">{a.type?.name ?? <span className="text-[#E9C16C]/30">—</span>}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#E9C16C]/70 font-semibold">Marca / Modelo:</span>
                <span className="text-[#E9C16C]">{[a.brand, a.model].filter(Boolean).join(" / ") || <span className="text-[#E9C16C]/30">—</span>}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#E9C16C]/70 font-semibold">Serie:</span>
                <span className="text-[#E9C16C]">{a.serial_number || <span className="text-[#E9C16C]/30">—</span>}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#E9C16C]/70 font-semibold">Asignado a:</span>
                <span className="text-[#E9C16C]">{a.current_assignment?.user?.name ?? <span className="text-[#E9C16C]/30">—</span>}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
