// src/pages/Activos.jsx
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Link, useNavigate } from "react-router-dom";
import api, { storagePublicUrl } from "../lib/api";
import { isPhoneType } from "../utils/isPhoneType";

// ——— utilidades de formato ———
const fmtDate = (s) => (s ? String(s).slice(0, 10) : "—");
const fmtMoney = (n) =>
  (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const join = (arr) => arr.filter(Boolean).join(" / ");
const storageUrl = storagePublicUrl;

// join de clases
const cx = (...a) => a.filter(Boolean).join(" ");

// badge por estado + modo
const badge = (status, isDark) => {
  const baseDark = {
    in_stock: "bg-green-700/30 text-green-200 border-green-400/30",
    assigned: "bg-blue-700/30 text-blue-200 border-blue-400/30",
    repair:   "bg-yellow-700/30 text-yellow-200 border-yellow-400/30",
    retired:  "bg-red-700/30 text-red-200 border-red-400/30",
    default:  "bg-gray-700/30 text-gray-200 border-gray-400/30",
  };
  const baseLight = {
    in_stock: "bg-green-100 text-green-800 border-green-300",
    assigned: "bg-blue-100 text-blue-800 border-blue-300",
    repair:   "bg-yellow-100 text-yellow-900 border-yellow-300",
    retired:  "bg-red-100 text-red-800 border-red-300",
    default:  "bg-gray-100 text-gray-800 border-gray-300",
  };
  const map = isDark ? baseDark : baseLight;
  return map[status] || map.default;
};

// breve formateo de teléfono
const fmtPhone = (v) => {
  const s = (v || "").replace(/[^\d+]/g, "");
  return s.startsWith("+")
    ? s.replace(/^(\+\d{2})(\d{2})(\d{4})(\d{4}).*/, "$1 $2 $3 $4").trim()
    : s.replace(/^(\d{2})(\d{4})(\d{4}).*/, "$1 $2 $3").trim();
};

export default function Activos() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const nav = useNavigate();

  // —— paleta de clases según modo ——
  const pageBg = isDark
    ? ""
    : "bg-gradient-to-br from-[#f6f7fb] via-white to-[#eef2ff]";

  const titleClr    = isDark ? "text-[#E9C16C]"    : "text-[#1E3A8A]";
  const subTitleClr = isDark ? "text-[#E9C16C]/70" : "text-slate-600";

  const fieldBg   = isDark ? "bg-[#23263a]"    : "bg-white";
  const fieldText = isDark ? "text-[#E9C16C]"  : "text-slate-800";
  const fieldRing = isDark ? "ring-[#E9C16C]/30 focus:ring-[#E9C16C]" : "ring-slate-300 focus:ring-slate-500";

  const cardBg = isDark
    ? "bg-gradient-to-br from-[#23263a] via-[#161922] to-[#23263a] border-[#E9C16C]/10"
    : "bg-gradient-to-br from-white via-slate-50 to-white border-slate-200";

  const pillBtn = isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10";

  const textSoft = isDark ? "text-[#E9C16C]/75" : "text-slate-700";
  const textHard = isDark ? "text-[#E9C16C]"    : "text-slate-900";

  // —— estado ——
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [types, setTypes] = useState([]);

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [typeId, setTypeId] = useState("");

  // tamaño de página
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  // debounce búsqueda
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const id = setTimeout(() => setQDebounced(q), 350);
    return () => clearTimeout(id);
  }, [q]);

  // fetch memoizado
  const fetchData = useMemo(
    () => async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await api.get("/assets", {
          params: {
            q: qDebounced,
            status,
            type_id: typeId || undefined,
            page,
            per_page: perPage,
          },
        });
        setRows(data.data || data);
        setMeta(data.meta || null);
      } finally {
        setLoading(false);
      }
    },
    [qDebounced, status, typeId, perPage]
  );

  // tipos
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

  // carga inicial y cambios de filtros
  useEffect(() => { fetchData(1); }, [fetchData]);
  useEffect(() => { fetchData(1); }, [perPage]); // eslint-disable-line

  // paginación compacta
  const pages = useMemo(() => {
    if (!meta) return [1];
    const total = meta.last_page, cur = meta.current_page;
    const arr = new Set([1, 2, cur - 1, cur, cur + 1, total - 1, total].filter(n => n >= 1 && n <= total));
    return Array.from(arr).sort((a, b) => a - b);
  }, [meta]);

  return (
    <section className={cx("min-h-screen rounded-2xl py-10 px-4 md:px-8 lg:px-16", pageBg)}>
      {/* Header / Filtros */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div>
          <h1 className={cx("text-4xl font-extrabold tracking-widest drop-shadow mb-1", titleClr)}>
            Activos
          </h1>
          <p className={cx("text-sm", subTitleClr)}>
            Gestión y seguimiento de activos tecnológicos
          </p>
        </div>

        {/* filtros */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end max-w-5xl w-full">
          <div className="md:col-span-2">
            <label className={cx("text-xs", subTitleClr)}>Buscar</label>
            <input
              placeholder="Tag / Serie / Marca / Modelo"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className={cx("w-full rounded-2xl px-4 py-2 text-sm outline-none ring-2 transition", fieldBg, fieldText, fieldRing)}
            />
          </div>

          <div>
            <label className={cx("text-xs", subTitleClr)}>Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={cx("w-full rounded-2xl px-4 py-2 text-sm transition ring-2", fieldBg, fieldText, fieldRing)}
            >
              <option value="">Todos</option>
              <option value="in_stock">Disponible</option>
              <option value="assigned">Asignado</option>
              <option value="repair">Reparación</option>
              <option value="retired">Baja</option>
            </select>
          </div>

          <div>
            <label className={cx("text-xs", subTitleClr)}>Tipo</label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className={cx("w-full rounded-2xl px-4 py-2 text-sm transition ring-2", fieldBg, fieldText, fieldRing)}
            >
              <option value="">Todos</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={cx("text-xs", subTitleClr)}>Por página</label>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className={cx("w-full rounded-2xl px-4 py-2 text-sm transition ring-2", fieldBg, fieldText, fieldRing)}
            >
              {[12, 20, 30, 40, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <div className="md:col-span-5 flex justify-between">
            <button
              onClick={() => fetchData(1)}
              className="rounded-2xl border border-[#E9C16C] px-4 py-2 text-sm text-[#181A20] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] shadow-md hover:scale-105 transition font-semibold"
            >
              Filtrar
            </button>
            <Link
              to="/activos/nuevo"
              className={cx(
                "rounded-2xl px-4 py-2 text-sm border shadow transition font-semibold",
                isDark
                  ? "from-[#E9C16C]/10 to-[#23263a] bg-gradient-to-r text-[#E9C16C] border-[#E9C16C]/30 hover:bg-[#E9C16C]/10"
                  : "from-amber-50 to-white bg-gradient-to-r text-amber-700 border-amber-200 hover:bg-amber-100/60"
              )}
            >
              + Nuevo activo
            </Link>
          </div>
        </div>
      </header>

      {/* Grid de cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {loading && (
          <div className="col-span-full flex justify-center items-center py-16">
            <span className={cx("animate-pulse text-lg", subTitleClr)}>Cargando…</span>
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="col-span-full flex justify-center items-center py-16">
            <span className={cx("text-lg", isDark ? "text-[#E9C16C]/40" : "text-slate-400")}>Sin resultados</span>
          </div>
        )}

        {!loading && rows.map((a) => {
          const brandName = a.brandRef?.name || a.brand || "";
          const invoiceUrl = storageUrl(a.invoice_path);
          const dep = a.depreciation || null;
          const isPhone = isPhoneType(a.type_id, types);

          return (
            <div
              key={a.id}
              className={cx(
                "rounded-3xl border shadow-xl p-5 flex flex-col gap-3 hover:shadow-2xl transition",
                cardBg
              )}
            >
              {/* Header card */}
              <div className="flex items-center justify-between">
                <span className={cx("font-mono text-base font-bold", textHard)}>
                  {a.asset_tag}
                </span>
                <span className={cx("px-3 py-1 rounded-full text-xs font-bold border", badge(a.status, isDark))}>
                  {a.status}
                </span>
              </div>

              {/* Cuerpo */}
              <div className="space-y-1 text-sm">
                <p className={textSoft}>
                  <span className="font-semibold">Tipo:</span>{" "}
                  <span className={textHard}>{a.type?.name ?? "—"}</span>
                </p>
                <p className={textSoft}>
                  <span className="font-semibold">Marca / Modelo:</span>{" "}
                  <span className={textHard}>{join([brandName, a.model]) || "—"}</span>
                </p>
                <p className={textSoft}>
                  <span className="font-semibold">Serie:</span>{" "}
                  <span className={textHard}>{a.serial_number || "—"}</span>
                </p>

                {/* ——— SOLO Teléfonos ——— */}
                {isPhone && (
                  <div
                    className={cx(
                      "mt-2 rounded-xl border p-2",
                      isDark ? "bg-[#0d111a]/40 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className={cx("text-xs", textSoft)}>
                        Número: <span className={textHard}>
                          {a.phone_number ? fmtPhone(a.phone_number) : "—"}
                        </span>
                      </div>
                      <div className={cx("text-xs", textSoft)}>
                        Proveedor: <span className={textHard}>{a.carrier || "—"}</span>
                      </div>
                    </div>
                    {!!a.is_unlocked && (
                      <span className={cx(
                        "mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]",
                        isDark
                          ? "border border-emerald-400/30 bg-emerald-700/20 text-emerald-200"
                          : "border border-emerald-300 bg-emerald-50 text-emerald-700"
                      )}>
                        ● Libre
                      </span>
                    )}
                  </div>
                )}

                <p className={textSoft}>
                  <span className="font-semibold">Asignado a:</span>{" "}
                  <span className={textHard}>{a.current_assignment?.user?.name ?? "—"}</span>
                </p>

                {/* Compra + Depreciación */}
                <div
                  className={cx(
                    "mt-2 rounded-xl border p-2",
                    isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                  )}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className={cx("text-xs", textSoft)}>
                      Compra: <span className={textHard}>{fmtDate(a.purchase_date)}</span>
                    </div>
                    <div className={cx("text-xs", textSoft)}>
                      Costo: <span className={textHard}>${fmtMoney(a.purchase_cost)}</span>
                    </div>
                    <div className={cx("text-xs", textSoft)}>
                      Valor actual:{" "}
                      <span className={textHard}>{dep ? `$${fmtMoney(dep.current)}` : "—"}</span>
                    </div>
                    <div className={cx("text-xs", isDark ? "text-[#E9C16C]/60" : "text-slate-500")}>
                      Dep.: 10% anual{" "}
                      {dep ? `• ${Math.floor(dep.years)}a ${Math.round((dep.years % 1) * 12)}m` : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-2 flex items-center gap-2">
                <Link
                  to={`/activos/editar/${a.id}`}
                  className={cx("rounded-xl px-3 py-1.5 text-xs", pillBtn)}
                >
                  Ver
                </Link>

                {invoiceUrl ? (
                  <a
                    href={invoiceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cx("rounded-xl px-3 py-1.5 text-xs", pillBtn)}
                    title="Ver factura"
                  >
                    Factura
                  </a>
                ) : (
                  <button
                    disabled
                    className={cx("rounded-xl px-3 py-1.5 text-xs opacity-50 cursor-not-allowed", pillBtn)}
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
          <p className={cx("text-xs", subTitleClr)}>
            Mostrando {meta.from ?? 0}-{meta.to ?? 0} de {meta.total ?? 0}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchData(Math.max(1, meta.current_page - 1))}
              disabled={meta.current_page <= 1}
              className={cx("rounded-xl px-3 py-1.5 text-sm disabled:opacity-50",
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10")}
            >
              ← Anterior
            </button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => fetchData(p)}
                className={cx("rounded-xl px-3 py-1.5 text-sm",
                  p === meta.current_page
                    ? (isDark ? "bg-white/20" : "bg-black/10")
                    : (isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10")
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => fetchData(Math.min(meta.last_page, meta.current_page + 1))}
              disabled={meta.current_page >= meta.last_page}
              className={cx("rounded-xl px-3 py-1.5 text-sm disabled:opacity-50",
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10")}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
