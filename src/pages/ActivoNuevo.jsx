import { useEffect, useState, useMemo } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

// Depreciación lineal: 10% anual prorrateado por mes (sin valor de rescate)
function calcDepreciation(cost, purchaseDate, asOf = new Date()) {
  const c = Number(cost || 0);
  if (!c || !purchaseDate) return { years: 0, months: 0, factor: 1, current: c };

  const start = new Date(purchaseDate);
  const months =
    (asOf.getFullYear() - start.getFullYear()) * 12 +
    (asOf.getMonth() - start.getMonth());
  const m = Math.max(0, months);
  const years = m / 12;
  const rate = 0.10; // 10% por año
  const factor = Math.max(0, 1 - rate * years);
  const current = +(c * factor).toFixed(2);
  return { years, months: m, factor, current };
}

export default function ActivoNuevo() {
  const nav = useNavigate();

  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);

  const [form, setForm] = useState({
    type_id: "",
    brand_id: "",
    model: "",
    serial_number: "",
    condition: "good",
    notes: "",
    purchase_date: "",
    purchase_cost: "",
    invoice: null,
  });

  const [saving, setSaving] = useState(false);

  // cargar catálogos
  useEffect(() => {
    (async () => {
      try {
        const [t, b] = await Promise.all([
          api.get("/asset-types"),
          api.get("/brands"),
        ]);
        setTypes(t.data || []);
        setBrands(b.data || []);
      } catch {
        setTypes([]);
        setBrands([]);
      }
    })();
  }, []);

  const dep = useMemo(
    () => calcDepreciation(form.purchase_cost, form.purchase_date),
    [form.purchase_cost, form.purchase_date]
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      // Sólo mandamos campos con valor
      Object.entries({
        ...form,
        type_id: Number(form.type_id || 0) || "",
        brand_id: form.brand_id ? Number(form.brand_id) : "",
      }).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") fd.append(k, v);
      });
      if (form.invoice) fd.append("invoice", form.invoice);

      await api.post("/assets", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      nav("/activos");
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo guardar el activo");
    } finally {
      setSaving(false);
    }
  };

  const cx =
    "rounded-xl bg-[#23232a] px-3 py-2 text-sm text-white outline-none ring-1 ring-[#E9C16C]/20 focus:ring-2 focus:ring-[#E9C16C] transition-all w-full";

  return (
    <section className="max-w-2xl mx-auto mt-14 p-8 bg-[#18181b] rounded-3xl shadow-2xl border border-[#E9C16C]/20">
      <h1 className="mb-8 text-3xl font-bold text-[#E9C16C] text-center tracking-tight">
        Nuevo Activo
      </h1>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">
              Tipo
            </label>
            {types.length > 0 ? (
              <select
                className={cx}
                value={form.type_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type_id: e.target.value }))
                }
                required
              >
                <option value="">Selecciona tipo…</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={cx}
                placeholder="Type ID"
                value={form.type_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type_id: e.target.value }))
                }
                required
              />
            )}
          </div>

          {/* Condición */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">
              Condición
            </label>
            <select
              className={cx}
              value={form.condition}
              onChange={(e) =>
                setForm((f) => ({ ...f, condition: e.target.value }))
              }
            >
              <option value="new">Nuevo</option>
              <option value="good">Bueno</option>
              <option value="fair">Regular</option>
              <option value="poor">Malo</option>
            </select>
          </div>

          {/* Marca (select) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">
              Marca
            </label>
            <select
              className={cx}
              value={form.brand_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, brand_id: e.target.value }))
              }
            >
              <option value="">Selecciona marca…</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Modelo */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">
              Modelo
            </label>
            <input
              className={cx}
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
            />
          </div>

          {/* Serie (col-span-2 en mobile si quieres) */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">
              Serie
            </label>
            <input
              className={cx}
              value={form.serial_number}
              onChange={(e) =>
                setForm((f) => ({ ...f, serial_number: e.target.value }))
              }
            />
          </div>

          {/* Fecha de compra */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">
              Fecha de compra
            </label>
            <input
              type="date"
              className={cx}
              value={form.purchase_date}
              onChange={(e) =>
                setForm((f) => ({ ...f, purchase_date: e.target.value }))
              }
            />
          </div>

          {/* Costo */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">
              Costo (MXN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={cx}
              value={form.purchase_cost}
              onChange={(e) =>
                setForm((f) => ({ ...f, purchase_cost: e.target.value }))
              }
            />
          </div>

          {/* Factura */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">
              Factura (PDF/JPG/PNG)
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className={cx}
              onChange={(e) =>
                setForm((f) => ({ ...f, invoice: e.target.files?.[0] || null }))
              }
            />
            {form.invoice && (
              <p className="mt-1 text-xs opacity-80">
                Archivo: <b>{form.invoice.name}</b>
              </p>
            )}
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="mb-1 block text-sm font-medium text-[#E9C16C]">
            Notas
          </label>
          <textarea
            rows="3"
            className={cx + " resize-none"}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </div>

        {/* Vista previa de depreciación */}
        <div className="rounded-2xl bg-white/5 border border-[#E9C16C]/20 p-3 text-sm">
          <div className="flex flex-wrap gap-4">
            <div>
              Antigüedad:{" "}
              <b>
                {Math.floor(dep.years)} años {Math.round((dep.years % 1) * 12)} meses
              </b>
            </div>
            <div>
              Factor actual: <b>{(dep.factor * 100).toFixed(2)}%</b>
            </div>
            <div>
              Valor actual estimado:{" "}
              <b>${dep.current.toLocaleString()}</b>
            </div>
          </div>
          <p className="opacity-70 mt-1">
            Fórmula: valor_actual = costo × (1 − 0.10 × años). Prorrateado por meses.
          </p>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="rounded-xl px-6 py-2 text-sm font-medium text-[#E9C16C] border border-[#E9C16C] bg-transparent hover:bg-[#E9C16C]/10 transition-all"
          >
            Cancelar
          </button>
          <button
            disabled={saving}
            className="rounded-xl px-6 py-2 text-sm font-semibold text-[#18181b] bg-gradient-to-r from-[#E9C16C] to-[#D6A644] shadow-md transition-all disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}
