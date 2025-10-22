// src/pages/Asignar.jsx
import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { useSearchParams } from "react-router-dom";

/* ====== helpers ====== */
function useDebounce(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

function ResultItem({ title, subtitle, right, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl px-3 py-2 hover:bg-white/10 transition flex items-center justify-between"
    >
      <div>
        <p className="font-medium">{title}</p>
        {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
      </div>
      {right && <div className="text-xs opacity-70">{right}</div>}
    </button>
  );
}

function AsyncSelect({ label, placeholder, fetcher, mapper, onSelect, valueLabel }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const dq = useDebounce(q, 300);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!dq) { setItems([]); return; }
      setLoading(true);
      try {
        const res = await fetcher(dq);
        if (!ignore) setItems(res || []);
      } finally { setLoading(false); }
    })();
    return () => { ignore = true; };
  }, [dq, fetcher]);

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase tracking-wide text-white/70">{label}</label>

      {!valueLabel && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-[#E9C16C]"
        />
      )}

      {valueLabel && (
        <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
          <span className="text-sm">{valueLabel}</span>
          <button type="button" className="text-xs underline opacity-80" onClick={() => { onSelect(null); }}>
            cambiar
          </button>
        </div>
      )}

      {!valueLabel && dq && (
        <div className="rounded-xl border border-white/10 bg-white/5">
          {loading && <div className="px-3 py-2 text-sm opacity-70">Buscando…</div>}
          {!loading && items.length === 0 && <div className="px-3 py-2 text-sm opacity-70">Sin resultados</div>}
          {!loading && items.map((it) => {
            const m = mapper(it);
            return (
              <ResultItem
                key={m.id}
                title={m.title}
                subtitle={m.subtitle}
                right={m.right}
                onClick={() => { onSelect(it); setItems([]); setQ(""); }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ====== pantalla ====== */
export default function Asignar() {
  const [searchParams] = useSearchParams();

  // usuario
  const [usuario, setUsuario] = useState(null);
  const pendingName = searchParams.get("n") || "";

  // notificaciones
  const [noti, setNoti] = useState({ type: "", msg: "" });
  const notify = (msg, type = "ok", ms = 3500) => {
    setNoti({ type, msg });
    setTimeout(() => setNoti({ type: "", msg: "" }), ms);
  };

  // ======= precarga usuario desde ?user=ID (&n=Nombre opcional) =======
  useEffect(() => {
    const uid = searchParams.get("user");
    if (!uid) return;

    let ignore = false;
    (async () => {
      try {
        const { data } = await api.get(`/users/${uid}`);
        if (!ignore) setUsuario(data);
      } catch {
        try {
          const { data } = await api.get("/users", { params: { search: uid } });
          const list = data.data || data;
          const found = list.find((u) => String(u.id) === String(uid));
          if (!ignore && found) setUsuario(found);
        } catch {}
      }
    })();

    return () => { ignore = true; };
  }, [searchParams]);

  // ======= buscadores =======
  const fetchUsuarios = useMemo(() => async (term) => {
    const { data } = await api.get("/users", { params: { search: term } });
    return data.data || data;
  }, []);

  // ======= filtros / tabla de activos (multi) =======
  const [q, setQ] = useState("");
  const qDebounced = useDebounce(q, 350);
  const [typeId, setTypeId] = useState("");
  const [types, setTypes] = useState([]);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(20);

  // selección múltiple
  const [selected, setSelected] = useState(() => new Set()); // ids

  // cargar tipos
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

  // fetch de activos disponibles
  const fetchAssets = useMemo(
    () => async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await api.get("/assets", {
          params: {
            status: "in_stock",
            q: qDebounced || undefined,
            type_id: typeId || undefined,
            page,
            per_page: perPage,
          },
        });
        const arr = data.data || data;
        setRows(arr);
        setMeta(data.meta || null);
      } finally {
        setLoading(false);
      }
    },
    [qDebounced, typeId, perPage]
  );

  useEffect(() => { fetchAssets(1); }, [fetchAssets]);

  // paginación (simple — vecinos y extremos)
  const pages = (() => {
    if (!meta) return [1];
    const total = meta.last_page, cur = meta.current_page;
    const arr = new Set([1, 2, cur - 1, cur, cur + 1, total - 1, total].filter(n => n >= 1 && n <= total));
    return Array.from(arr).sort((a, b) => a - b);
  })();

  // helpers selección
  const toggleOne = (id) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const pageIds = rows.map(r => r.id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const togglePage = () => {
    setSelected((s) => {
      const next = new Set(s);
      if (allOnPageSelected) pageIds.forEach(id => next.delete(id));
      else pageIds.forEach(id => next.add(id));
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  // ======= asignación masiva =======
  const onAssign = async () => {
    if (!usuario?.id) return notify("Selecciona un usuario.", "err");
    if (selected.size === 0) return notify("No hay activos seleccionados.", "err");

    const ids = Array.from(selected);
    if (!confirm(`Asignar ${ids.length} activo(s) a ${usuario.name}?`)) return;

    try {
      const results = await Promise.allSettled(
        ids.map((asset_id) =>
          api.post("/assignments", {
            user_id: Number(usuario.id),
            asset_id: Number(asset_id),
            condition_out: "good",
            notes: "Entrega desde panel (asignación múltiple)",
          })
        )
      );
      const ok = results.filter(r => r.status === "fulfilled").length;
      const fail = results.length - ok;

      if (ok > 0) notify(`Asignados ${ok} activo(s).`, "ok");
      if (fail > 0) notify(`Fallaron ${fail} asignación(es).`, "err", 4500);

      clearSelection();
      fetchAssets(meta?.current_page || 1);
    } catch (e) {
      console.error(e?.response || e);
      notify("No se completó la asignación.", "err");
    }
  };

  const fmtDate = (s) => (s ? String(s).slice(0, 10) : "—");

  return (
    <section className="max-w-6xl space-y-6">
      <h1 className="text-lg font-semibold">Asignar activo</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 rounded-xl px-6 py-2 text-sm font-medium text-[#E9C16C] border border-[#E9C16C] bg-transparent hover:bg-[#E9C16C]/10 transition-all">
        {/* Columna izquierda: usuario + filtros */}
        <div className="space-y-4 lg:col-span-1">
          <AsyncSelect
            label="Usuario"
            placeholder="Nombre, correo…"
            fetcher={fetchUsuarios}
            mapper={(u) => ({
              id: u.id,
              title: u.name || u.nombre || `ID ${u.id}`,
              subtitle: u.email,
              right: u.departamento?.nombre || u.department?.name,
            })}
            onSelect={setUsuario}
            valueLabel={
              usuario
                ? `${usuario.name || usuario.nombre} (${usuario.email})`
                : pendingName
            }
          />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-2">Buscar activos disponibles</h3>

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tag / Serie / Marca / Modelo"
              className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm mb-2"
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
              >
                <option value="">Todos los tipos</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
              >
                {[12, 20, 30, 40, 50, 100].map(n => (
                  <option key={n} value={n}>{n} / pág</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => fetchAssets(1)}
                className="rounded-xl border border-[#E9C16C] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] px-3 py-1.5 text-sm text-[#181A20]"
              >
                Filtrar
              </button>
              <button
                onClick={() => { setQ(""); setTypeId(""); fetchAssets(1); }}
                className="rounded-xl bg-white/10 px-3 py-1.5 text-sm"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-2">Acciones</h3>
            <p className="text-sm text-[#E9C16C]/80 mb-3">
              Seleccionados: <b>{selected.size}</b>
            </p>
            <div className="flex gap-2">
              <button
                onClick={onAssign}
                className="rounded-xl border border-[#E9C16C] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] px-3 py-1.5 text-sm text-[#181A20] disabled:opacity-60"
                disabled={!usuario || selected.size === 0}
              >
                Asignar {selected.size > 0 ? `(${selected.size})` : ""}
              </button>
              <button
                onClick={clearSelection}
                className="rounded-xl bg-white/10 px-3 py-1.5 text-sm disabled:opacity-60"
                disabled={selected.size === 0}
              >
                Limpiar selección
              </button>
            </div>

            {noti.msg && (
              <div className={`mt-3 rounded-xl px-3 py-2 text-sm ${noti.type === "ok" ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"}`}>
                {noti.msg}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: tabla */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Activos disponibles</h3>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pageIds.length > 0 && allOnPageSelected}
                onChange={togglePage}
              />
              <span className="text-sm">Seleccionar página</span>
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-left">
                  <th className="p-3"></th>
                  <th className="p-3">Tag</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Marca / Modelo</th>
                  <th className="p-3">Serie</th>
                  <th className="p-3">Compra</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className="p-6 text-center opacity-70">Cargando…</td></tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr><td colSpan={6} className="p-6 text-center opacity-50">Sin resultados</td></tr>
                )}

                {!loading && rows.map((a) => {
                  const brandName = a.brandRef?.name || a.brand || "";
                  return (
                    <tr key={a.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selected.has(a.id)}
                          onChange={() => toggleOne(a.id)}
                        />
                      </td>
                      <td className="p-3 font-mono">{a.asset_tag}</td>
                      <td className="p-3">{a.type?.name ?? "—"}</td>
                      <td className="p-3">{[brandName, a.model].filter(Boolean).join(" / ") || "—"}</td>
                      <td className="p-3">{a.serial_number || "—"}</td>
                      <td className="p-3">{fmtDate(a.purchase_date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* paginación */}
          {meta && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs opacity-70">
                Mostrando {meta.from ?? 0}-{meta.to ?? 0} de {meta.total ?? 0}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchAssets(Math.max(1, meta.current_page - 1))}
                  disabled={meta.current_page <= 1}
                  className="rounded-xl bg-white/10 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  ← Anterior
                </button>
                {pages.map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchAssets(p)}
                    className={`rounded-xl px-3 py-1.5 text-sm ${p === meta.current_page ? "bg-white/20" : "bg-white/10 hover:bg-white/20"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => fetchAssets(Math.min(meta.last_page, meta.current_page + 1))}
                  disabled={meta.current_page >= meta.last_page}
                  className="rounded-xl bg-white/10 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
