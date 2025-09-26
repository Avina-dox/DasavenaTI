import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

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

// Select asíncrono minimal (sin libs)
function AsyncSelect({
  label,
  placeholder,
  fetcher,         // async (q) => items
  mapper,          // (item) => { id, title, subtitle, right }
  onSelect,
  valueLabel,      // string a mostrar cuando ya hay selección
}) {
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
      <label className="block text-xs font-semibold uppercase tracking-wide text-white/70">
        {label}
      </label>

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
          <button
            type="button"
            className="text-xs underline opacity-80"
            onClick={() => { setQ(""); onSelect(null); }}
          >
            cambiar
          </button>
        </div>
      )}

      {!valueLabel && dq && (
        <div className="rounded-xl border border-white/10 bg-white/5">
          {loading && <div className="px-3 py-2 text-sm opacity-70">Buscando…</div>}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-sm opacity-70">Sin resultados</div>
          )}
          {!loading &&
            items.map((it) => {
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

export default function Asignar() {
  const [usuario, setUsuario] = useState(null);
  const [activo, setActivo] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [noti, setNoti] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  // Trae detalle del activo seleccionado (por si cambió de estado)
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!activo?.id) { setDetalle(null); return; }
      try {
        const { data } = await api.get(`/assets/${activo.id}`);
        if (!ignore) setDetalle(data);
      } catch {
        if (!ignore) setDetalle(null);
      }
    })();
    return () => { ignore = true; };
  }, [activo?.id]);

  // Fetchers
  const fetchActivos = useMemo(
    () => async (term) => {
      const { data } = await api.get("/assets", {
        params: { status: "in_stock", q: term },
      });
      return data.data || data; // por si viene paginado
    },
    []
  );

  const fetchUsuarios = useMemo(
    () => async (term) => {
      // Ajusta a tu endpoint real; ideal: /users?search=term
      const { data } = await api.get("/users", { params: { search: term } });
      // si tu backend regresa {data:[]}, ajusta:
      return data.data || data;
    },
    []
  );

  const asignar = async () => {
    if (!usuario?.id || !activo?.id) return;
    setLoading(true);
    setNoti({ type: "", msg: "" });
    try {
      await api.post("/assignments", {
        asset_id: Number(activo.id),
        user_id: Number(usuario.id),
        condition_out: "good",
        notes: "Entrega desde panel",
      });
      setNoti({ type: "ok", msg: "✅ Asignación realizada" });
      setUsuario(null);
      setActivo(null);
      setDetalle(null);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        "No se pudo asignar. Verifica que el activo esté disponible.";
      setNoti({ type: "err", msg });
    } finally {
      setLoading(false);
      setTimeout(() => setNoti({ type: "", msg: "" }), 4000);
    }
  };

  const activoOcupado =
    detalle && detalle.status && detalle.status !== "in_stock";

  return (
    <section className="max-w-4xl space-y-6">
      <h1 className="text-lg font-semibold">Asignar activo</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Columna izquierda: selects */}
        <div className="space-y-4">
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
              usuario ? `${usuario.name || usuario.nombre} (${usuario.email})` : ""
            }
          />

          <AsyncSelect
            label="Activo disponible"
            placeholder="Tag, marca, modelo, serie…"
            fetcher={fetchActivos}
            mapper={(a) => ({
              id: a.id,
              title: `${a.asset_tag} · ${a.brand ?? ""} ${a.model ?? ""}`.trim(),
              subtitle: `${a.type?.name ?? ""}${a.serial_number ? ` · SN: ${a.serial_number}` : ""}`,
              right: a.condition,
            })}
            onSelect={setActivo}
            valueLabel={
              activo ? `${activo.asset_tag} · ${activo.brand ?? ""} ${activo.model ?? ""}` : ""
            }
          />

          <div className="flex gap-2">
            <button
              onClick={asignar}
              disabled={!usuario || !activo || loading || activoOcupado}
              className="rounded-xl border border-[#E9C16C] px-4 py-2 text-sm text-black bg-gradient-to-r from-[#D6A644] to-[#E9C16C] disabled:opacity-60"
            >
              {loading ? "Asignando…" : "Asignar"}
            </button>
            <button
              type="button"
              onClick={() => { setUsuario(null); setActivo(null); setDetalle(null); }}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm"
            >
              Limpiar
            </button>
          </div>

          {noti.msg && (
            <div
              className={`rounded-xl px-3 py-2 text-sm ${
                noti.type === "ok"
                  ? "bg-green-500/20 text-green-200"
                  : "bg-red-500/20 text-red-200"
              }`}
            >
              {noti.msg}
            </div>
          )}
        </div>

        {/* Columna derecha: ficha del activo */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 font-semibold">Ficha del activo</h2>
          {!detalle && <p className="opacity-70 text-sm">Selecciona un activo…</p>}
          {detalle && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-70">Tag</span>
                <span className="font-mono">{detalle.asset_tag}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Tipo</span>
                <span>{detalle.type?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Marca / Modelo</span>
                <span>{[detalle.brand, detalle.model].filter(Boolean).join(" / ") || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Serie</span>
                <span>{detalle.serial_number || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Condición</span>
                <span>{detalle.condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Estado</span>
                <span className={activoOcupado ? "text-red-300" : ""}>
                  {detalle.status}
                </span>
              </div>
              {detalle.currentAssignment?.user && (
                <div className="rounded-xl bg-red-500/10 p-2 text-red-200">
                  Ya asignado a: <b>{detalle.currentAssignment.user.name}</b>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
