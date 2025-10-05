import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { storagePublicUrl } from "../lib/api";

const money = (n) => (n ?? 0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
const join = (arr) => arr.filter(Boolean).join(" / ");

// Formatea fecha para input type="date"
const toInputDate = (s) => (s ? String(s).slice(0,10) : "");

export default function ActivoEditar() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);       // asset
  const [types, setTypes] = useState([]);       // select tipos
  const [brands, setBrands] = useState([]);     // select marcas
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);       // nueva factura

  const fetchAll = useMemo(() => async () => {
    const [a, t, b] = await Promise.allSettled([
      api.get(`/assets/${id}`),
      api.get("/asset-types"),
      api.get("/brands"),
    ]);
    if (a.status === "fulfilled") setData(a.value.data);
    if (t.status === "fulfilled") setTypes(t.value.data || []);
    if (b.status === "fulfilled") setBrands(b.value.data || []);
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onChange = (k, v) => setData(d => ({ ...d, [k]: v }));

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      // Campos simples
      [
        "type_id","brand_id","model","serial_number",
        "condition","status","notes","purchase_date","purchase_cost"
      ].forEach(k => {
        if (data?.[k] !== undefined && data?.[k] !== null) form.append(k, data[k]);
      });
      if (file) form.append("invoice", file); // factura nueva (opcional)

      await api.put(`/assets/${id}`, form);
      await fetchAll(); // refresca
      alert("Guardado.");
    } catch (err) {
      alert(err?.response?.data?.message || "No se pudo guardar");
    } finally { setSaving(false); }
  };

  if (!data) {
    return (
      <section className="p-6">
        <p className="text-[#E9C16C]">Cargando activo…</p>
      </section>
    );
  }

  const dep = data.depreciation || null;
  const invoiceUrl = storagePublicUrl(data.invoice_path);
  const brandName = data.brandRef?.name || data.brand || "";

  return (
    <section className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#E9C16C]">{data.asset_tag}</h1>
          <p className="opacity-70">Detalle y edición del activo</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => nav(`/asignar?asset=${data.id}`)}
            className="rounded-xl border border-[#E9C16C] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] px-3 py-1.5 text-sm text-[#181A20]"
          >
            Asignar
          </button>
          <button
            onClick={() => nav(-1)}
            className="rounded-xl bg-white/10 px-3 py-1.5 text-sm"
          >
            Volver
          </button>
        </div>
      </header>

      {/* Datos principales */}
      <form onSubmit={onSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs opacity-70">Estado</label>
              <select
                value={data.status ?? ""}
                onChange={(e)=>onChange("status", e.target.value)}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
              >
                <option value="in_stock">Disponible</option>
                <option value="assigned">Asignado</option>
                <option value="repair">Reparación</option>
                <option value="retired">Baja</option>
              </select>
            </div>

            <div>
              <label className="text-xs opacity-70">Condición</label>
              <select
                value={data.condition ?? "good"}
                onChange={(e)=>onChange("condition", e.target.value)}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
              >
                <option value="new">Nuevo</option>
                <option value="good">Bueno</option>
                <option value="fair">Regular</option>
                <option value="poor">Malo</option>
              </select>
            </div>

            <div>
              <label className="text-xs opacity-70">Tipo</label>
              <select
                value={data.type_id ?? ""}
                onChange={(e)=>onChange("type_id", e.target.value)}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
              >
                <option value="">Selecciona…</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs opacity-70">Marca</label>
              <select
                value={data.brand_id ?? ""}
                onChange={(e)=>onChange("brand_id", e.target.value)}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
              >
                <option value="">Selecciona…</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs opacity-70">Modelo</label>
              <input
                value={data.model ?? ""}
                onChange={(e)=>onChange("model", e.target.value)}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                placeholder="Modelo"
              />
            </div>

            <div>
              <label className="text-xs opacity-70">Serie</label>
              <input
                value={data.serial_number ?? ""}
                onChange={(e)=>onChange("serial_number", e.target.value)}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                placeholder="Número de serie"
              />
            </div>
          </div>

          <div>
            <label className="text-xs opacity-70">Notas</label>
            <textarea
              rows={3}
              value={data.notes ?? ""}
              onChange={(e)=>onChange("notes", e.target.value)}
              className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm resize-none"
              placeholder="Observaciones…"
            />
          </div>
        </div>

        {/* Compra / Depreciación / Factura */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-2">Compra</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs opacity-70">Fecha de compra</label>
                <input
                type="date"
                value={toInputDate(data.purchase_date)}
                onChange={(e)=>onChange("purchase_date", e.target.value)}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs opacity-70">Costo</label>
                <input
                  type="number" min="0" step="0.01"
                  value={data.purchase_cost ?? ""}
                  onChange={(e)=>onChange("purchase_cost", e.target.value)}
                  className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                />
              </div>
            </div>
            {dep && (
              <div className="mt-3 rounded-xl bg-white/5 p-2 text-sm">
                <div>Valor actual: <b>${money(dep.current)}</b></div>
                <div className="opacity-70 text-xs">
                  Depreciación 10% anual • {Math.floor(dep.years)}a {Math.round((dep.years%1)*12)}m
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-2">Factura</h3>
            {invoiceUrl ? (
              <a
                href={invoiceUrl}
                target="_blank" rel="noreferrer"
                className="inline-block rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm mb-2"
              >
                Ver factura actual
              </a>
            ) : (
              <p className="text-sm opacity-70 mb-2">Sin factura cargada</p>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e)=>setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs"
            />
            {file && <p className="text-xs opacity-70 mt-1">Archivo: {file.name}</p>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="font-semibold mb-1">Resumen</h3>
            <p className="text-sm opacity-80">
              {data.type?.name ?? "—"} • {join([brandName, data.model]) || "—"} • Serie: {data.serial_number || "—"}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={()=>nav(-1)}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm"
            >
              Cancelar
            </button>
            <button
              disabled={saving}
              className="rounded-xl border border-[#E9C16C] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] px-4 py-2 text-sm text-[#181A20] disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
