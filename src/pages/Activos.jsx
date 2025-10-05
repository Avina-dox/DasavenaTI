import { useEffect, useMemo, useState } from "react";
import api, { API_BASE, storagePublicUrl } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

const fmtDate = (s) => (s ? String(s).slice(0, 10) : "—"); 

const badge = (status) => {
  switch (status) {
    case "in_stock": return "bg-green-700/30 text-green-200 border-green-400/30";
    case "assigned": return "bg-blue-700/30 text-blue-200 border-blue-400/30";
    case "repair":   return "bg-yellow-700/30 text-yellow-200 border-yellow-400/30";
    case "retired":  return "bg-red-700/30 text-red-200 border-red-400/30";
    default:         return "bg-gray-700/30 text-gray-200 border-gray-400/30";
  }
};

const fmtMoney = (n) => (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const join = (arr) => arr.filter(Boolean).join(" / ");
const storageUrl = storagePublicUrl;

export default function Activos() {
  const nav = useNavigate();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [types, setTypes] = useState([]);

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [typeId, setTypeId] = useState("");

  const [loading, setLoading] = useState(false);

  // para debounce de búsqueda
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const id = setTimeout(() => setQDebounced(q), 350);
    return () => clearTimeout(id);
  }, [q]);

  const fetchData = useMemo(() => async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/assets", {
        params: { q: qDebounced, status, type_id: typeId || undefined, page }
      });
      setRows(data.data || data);
      setMeta(data.meta || null);
    } finally {
      setLoading(false);
    }
  }, [qDebounced, status, typeId]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/asset-types");
        setTypes(data || []);
      } catch {
        setTypes([]);
      }
    })();
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const pages = useMemo(() => {
    if (!meta) return [1];
    const total = meta.last_page, cur = meta.current_page;
    const arr = new Set([1, 2, cur-1, cur, cur+1, total-1, total].filter(n => n>=1 && n<=total));
    return Array.from(arr).sort((a,b)=>a-b);
  }, [meta]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#111318] via-[#1a1e2a] to-[#111318] py-10 px-4">
      {/* Header / Filtros */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-[#E9C16C] tracking-widest drop-shadow mb-1">Activos</h1>
          <p className="text-[#E9C16C]/70 text-sm">Gestión y seguimiento de activos tecnológicos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end max-w-4xl w-full">
          <div className="col-span-2">
            <label className="text-xs text-[#E9C16C]/70">Buscar</label>
            <input
              placeholder="Tag / Serie / Marca / Modelo"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-2xl bg-[#23263a] px-4 py-2 text-sm text-[#E9C16C] outline-none ring-2 ring-[#E9C16C]/30 focus:ring-[#E9C16C] transition"
            />
          </div>
          <div>
            <label className="text-xs text-[#E9C16C]/70">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-2xl bg-[#23263a] px-4 py-2 text-sm text-[#E9C16C] ring-2 ring-[#E9C16C]/30 focus:ring-[#E9C16C] transition"
            >
              <option value="">Todos</option>
              <option value="in_stock">Disponible</option>
              <option value="assigned">Asignado</option>
              <option value="repair">Reparación</option>
              <option value="retired">Baja</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[#E9C16C]/70">Tipo</label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="w-full rounded-2xl bg-[#23263a] px-4 py-2 text-sm text-[#E9C16C] ring-2 ring-[#E9C16C]/30 focus:ring-[#E9C16C] transition"
            >
              <option value="">Todos</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-4 flex justify-between">
            <button
              onClick={() => fetchData(1)}
              className="rounded-2xl border border-[#E9C16C] px-4 py-2 text-sm text-[#181A20] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] shadow-md hover:scale-105 transition font-semibold"
            >
              Filtrar
            </button>
            <Link
              to="/activos/nuevo"
              className="rounded-2xl bg-gradient-to-r from-[#E9C16C]/10 to-[#23263a] px-4 py-2 text-sm text-[#E9C16C] border border-[#E9C16C]/30 hover:bg-[#E9C16C]/10 shadow transition font-semibold"
            >
              + Nuevo activo
            </Link>
          </div>
        </div>
      </header>

      {/* Grid de cards */}
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

        {!loading && rows.map((a) => {
          const brandName = a.brandRef?.name || a.brand || "";
          const invoiceUrl = storageUrl(a.invoice_path);
          const dep = a.depreciation || null;

          return (
            <div
              key={a.id}
              className="rounded-3xl bg-gradient-to-br from-[#23263a] via-[#161922] to-[#23263a] border border-[#E9C16C]/10 shadow-xl p-5 flex flex-col gap-3 hover:shadow-2xl transition"
            >
              {/* Header card */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-[#E9C16C]">{a.asset_tag}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge(a.status)}`}>
                  {a.status}
                </span>
              </div>

              {/* Cuerpo */}
              <div className="space-y-1 text-sm">
                <p className="text-[#E9C16C]/75">
                  <span className="font-semibold">Tipo:</span>{" "}
                  <span className="text-[#E9C16C]">{a.type?.name ?? "—"}</span>
                </p>
                <p className="text-[#E9C16C]/75">
                  <span className="font-semibold">Marca / Modelo:</span>{" "}
                  <span className="text-[#E9C16C]">{join([brandName, a.model]) || "—"}</span>
                </p>
                <p className="text-[#E9C16C]/75">
                  <span className="font-semibold">Serie:</span>{" "}
                  <span className="text-[#E9C16C]">{a.serial_number || "—"}</span>
                </p>
                <p className="text-[#E9C16C]/75">
                  <span className="font-semibold">Asignado a:</span>{" "}
                  <span className="text-[#E9C16C]">{a.current_assignment?.user?.name ?? "—"}</span>
                </p>

                {/* Compra + Depreciación */}
                <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-xs text-[#E9C16C]/75">
                      Compra:{" "}
                      <span className="text-[#E9C16C]">
                        {fmtDate(a.purchase_date)}
                      </span>
                    </div>
                    <div className="text-xs text-[#E9C16C]/75">
                      Costo:{" "}
                      <span className="text-[#E9C16C]">
                        ${fmtMoney(a.purchase_cost)}
                      </span>
                    </div>
                    <div className="text-xs text-[#E9C16C]/75">
                      Valor actual:{" "}
                      <span className="text-[#E9C16C]">
                        {dep ? `$${fmtMoney(dep.current)}` : "—"}
                      </span>
                    </div>
                    <div className="text-xs text-[#E9C16C]/60">
                      Dep.: 10% anual {dep ? `• ${Math.floor(dep.years)}a ${Math.round((dep.years%1)*12)}m` : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-2 flex items-center gap-2">
                <Link
                  to={`/activos/editar/${a.id}`}
                  className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs"
                >
                  Ver
                </Link>


                {invoiceUrl ? (
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-xs"
                    title="Ver factura"
                  >
                    Factura
                  </a>
                ) : (
                  <button
                    disabled
                    className="rounded-xl bg-white/5 px-3 py-1.5 text-xs opacity-50 cursor-not-allowed"
                    title="Sin factura"
                  >
                    Factura
                  </button>
                )}

                {a.status === "in_stock" && (
                  <button
                    onClick={() => nav(`/asignar?asset=${a.id}`)}
                    className="ml-auto rounded-xl border border-[#E9C16C] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] px-3 py-1.5 text-xs text-[#181A20]"
                  >
                    Asignar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {meta && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-[#E9C16C]/70">
            Mostrando {meta.from ?? 0}-{meta.to ?? 0} de {meta.total ?? 0}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchData(Math.max(1, meta.current_page - 1))}
              disabled={meta.current_page <= 1}
              className="rounded-xl bg-white/10 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              ← Anterior
            </button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => fetchData(p)}
                className={`rounded-xl px-3 py-1.5 text-sm ${
                  p === meta.current_page ? "bg-white/20" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => fetchData(Math.min(meta.last_page, meta.current_page + 1))}
              disabled={meta.current_page >= meta.last_page}
              className="rounded-xl bg-white/10 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
