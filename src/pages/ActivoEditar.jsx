// src/pages/ActivoEditar.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { storagePublicUrl } from "../lib/api";
import { isPhoneType } from "../utils/isPhoneType";
import { QRCodeCanvas } from "qrcode.react";

const money = (n) =>
  (n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const join = (arr) => arr.filter(Boolean).join(" / ");
const toInputDate = (s) => (s ? String(s).slice(0, 10) : "");

/* --- Toast minimalista (sin dependencias) --- */
function Toast({ show, type = "success", children }) {
  if (!show) return null;
  const base =
    "fixed right-4 top-4 z-[9999] rounded-xl px-4 py-3 shadow-2xl text-sm flex items-center gap-2";
  const tone =
    type === "success"
      ? "bg-emerald-600/90 text-white"
      : "bg-rose-600/90 text-white";
  return (
    <div className={`${base} ${tone}`}>
      <span className="inline-block h-2 w-2 rounded-full bg-white/90" />
      {children}
    </div>
  );
}

export default function ActivoEditar() {
  const { id } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);

  // QR
  const [showQR, setShowQR] = useState(false);

  // toast state
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const showToast = (msg, type = "success", ms = 1600) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), ms);
  };

  const fetchAll = useMemo(
    () => async () => {
      const [a, t, b] = await Promise.allSettled([
        api.get(`/assets/${id}`),
        api.get("/asset-types"),
        api.get("/brands"),
      ]);
      if (a.status === "fulfilled") setData(a.value.data);
      if (t.status === "fulfilled") setTypes(t.value.data || []);
      if (b.status === "fulfilled") setBrands(b.value.data || []);
    },
    [id]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onChange = (k, v) => setData((d) => ({ ...d, [k]: v }));

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();

      // IDs como número
      const base = {
        type_id: data.type_id ? Number(data.type_id) : "",
        brand_id: data.brand_id ? Number(data.brand_id) : "",
        model: data.model ?? "",
        serial_number: data.serial_number ?? "",
        condition: data.condition ?? "",
        status: data.status ?? "",
        notes: data.notes ?? "",
        purchase_date: toInputDate(data.purchase_date) || data.purchase_date || "",
        purchase_cost: data.purchase_cost ?? "",
      };

      // Solo los que traen valor
      Object.entries(base).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") form.append(k, v);
      });

      // Campos de teléfono (solo si aplica)
      if (isPhoneType(data.type_id, types)) {
        form.append("phone_number", data.phone_number ?? "");
        form.append("carrier", data.carrier ?? "");
        form.append("is_unlocked", data.is_unlocked ? "1" : "0");
      }

      if (file) form.append("invoice", file);

      // Mejor compatibilidad: override
      form.append("_method", "PUT");

      await api.post(`/assets/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Toast inmediato y redirección suave
      showToast("Cambios guardados.");
      setTimeout(() => nav("/activos", { replace: true }), 900);
    } catch (err) {
      console.error(err?.response || err);
      showToast(
        err?.response?.data?.message || "No se pudo guardar",
        "error",
        2200
      );
    } finally {
      setSaving(false);
    }
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
  const isPhone = isPhoneType(data.type_id, types);

  /* ---- QR helpers (usar brandName ya definido) ---- */
  const qrData =
    data && {
      v: 1,
      id: data.id,
      tag: data.asset_tag,
      type: data.type?.name || "",
      brand: brandName,
      model: data.model || "",
      serial: data.serial_number || "",
      status: data.status || "",
      url: `${window.location.origin}/a/${data.id}`,
    };
  const qrString = JSON.stringify(qrData);

  // descarga PNG del QR
  const downloadQR = () => {
    const canvas = document.getElementById("asset-qr-canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = `${data.asset_tag}-QR.png`;
    a.click();
  };

  // imprime una etiqueta sencilla 50x30 mm
  const printLabel = () => {
    const w = window.open("", "_blank", "width=400,height=600");
    if (!w) return;
    const qrPng = document
      .getElementById("asset-qr-canvas")
      ?.toDataURL("image/png");
    w.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${data.asset_tag} – Etiqueta</title>
          <style>
            @page { size: 50mm 30mm; margin: 0; }
            body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
            .label {
              width: 50mm; height: 30mm;
              display: grid; grid-template-columns: 1fr 1.4fr; gap: 4mm;
              align-items: center; padding: 3mm;
            }
            .qr { display:flex; align-items:center; justify-content:center; }
            .meta { font-size: 10px; line-height: 1.2; }
            .meta b { font-size: 11px; }
            .tag { font-weight: 800; font-size: 12px; margin-bottom: 2px; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="qr">
              <img src="${qrPng}" style="width: 22mm; height: 22mm;" />
            </div>
            <div class="meta">
              <div class="tag">${data.asset_tag}</div>
              <div>${data.type?.name || "—"} • ${brandName || "—"}</div>
              <div>${data.model || "—"}</div>
              <div>SN: ${data.serial_number || "—"}</div>
            </div>
          </div>
          <script>window.print(); setTimeout(()=>window.close(), 300);</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  return (
    <>
      <Toast show={toast.show} type={toast.type}>
        {toast.msg}
      </Toast>

      <section className="rounded-xl px-6 py-2 text-sm font-medium text-[#E9C16C] border border-[#E9C16C] bg-transparent hover:bg-[#E9C16C]/10 transition-all">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#E9C16C]">{data.asset_tag}</h1>
            <p className="opacity-70">Detalle y edición del activo</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQR(true)}
              className="rounded-xl bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20"
            >
              QR
            </button>
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
                  onChange={(e) => onChange("status", e.target.value)}
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
                  onChange={(e) => onChange("condition", e.target.value)}
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
                  onChange={(e) => onChange("type_id", e.target.value)}
                  className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                >
                  <option value="">Selecciona…</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs opacity-70">Marca</label>
                <select
                  value={data.brand_id ?? ""}
                  onChange={(e) => onChange("brand_id", e.target.value)}
                  className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                >
                  <option value="">Selecciona…</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs opacity-70">Modelo</label>
                <input
                  value={data.model ?? ""}
                  onChange={(e) => onChange("model", e.target.value)}
                  className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                  placeholder="Modelo"
                />
              </div>

              <div>
                <label className="text-xs opacity-70">Serie</label>
                <input
                  value={data.serial_number ?? ""}
                  onChange={(e) => onChange("serial_number", e.target.value)}
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
                onChange={(e) => onChange("notes", e.target.value)}
                className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm resize-none"
                placeholder="Observaciones…"
              />
            </div>
          </div>

          {/* Campos teléfono (solo si el tipo es Teléfono) */}
          {isPhone && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs opacity-70">Número telefónico</label>
                <input
                  value={data.phone_number ?? ""}
                  onChange={(e) => onChange("phone_number", e.target.value)}
                  className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                  placeholder="+52XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="text-xs opacity-70">Proveedor</label>
                <select
                  value={data.carrier ?? ""}
                  onChange={(e) => onChange("carrier", e.target.value)}
                  className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                >
                  <option value="">Selecciona…</option>
                  {[
                    "Telcel",
                    "AT&T",
                    "Movistar",
                    "Bait",
                    "Unefon",
                    "Virgin Mobile",
                    "Otro",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="is_unlocked"
                  type="checkbox"
                  checked={!!data.is_unlocked}
                  onChange={(e) => onChange("is_unlocked", e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="is_unlocked" className="text-sm">
                  Equipo <b>libre / desbloqueado</b>
                </label>
              </div>
            </div>
          )}

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
                    onChange={(e) => onChange("purchase_date", e.target.value)}
                    className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs opacity-70">Costo</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.purchase_cost ?? ""}
                    onChange={(e) => onChange("purchase_cost", e.target.value)}
                    className="w-full rounded-xl bg-[#23263a] px-3 py-2 text-sm"
                  />
                </div>
              </div>
              {dep && (
                <div className="mt-3 rounded-xl bg-white/5 p-2 text-sm">
                  <div>
                    Valor actual: <b>${money(dep.current)}</b>
                  </div>
                  <div className="opacity-70 text-xs">
                    Depreciación 10% anual • {Math.floor(dep.years)}a{" "}
                    {Math.round((dep.years % 1) * 12)}m
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold mb-2">Factura</h3>
              {invoiceUrl ? (
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
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
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-xs"
              />
              {file && (
                <p className="text-xs opacity-70 mt-1">Archivo: {file.name}</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold mb-1">Resumen</h3>
              <p className="text-sm opacity-80">
                {data.type?.name ?? "—"} • {join([brandName, data.model]) || "—"} •
                Serie: {data.serial_number || "—"}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => nav(-1)}
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

      {/* Modal QR */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowQR(false)}
          />
          {/* Card */}
          <div className="relative z-10 w-[min(90vw,520px)] rounded-2xl bg-[#111318] border border-[#E9C16C]/25 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#E9C16C] font-semibold">
                Código QR – {data.asset_tag}
              </h3>
              <button
                className="text-sm bg-white/10 px-2 py-1 rounded hover:bg-white/20"
                onClick={() => setShowQR(false)}
              >
                Cerrar
              </button>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <QRCodeCanvas
                id="asset-qr-canvas"
                value={`${window.location.origin}/a/${data.id}`}
                size={256}
                level="M"
                includeMargin
                style={{ background: "white", padding: 8, borderRadius: 8 }}
              />
              <p className="text-xs text-[#E9C16C]/70 text-center">
                Contiene: tag, tipo, marca, modelo, serie, estado y un enlace de
                vuelta ({window.location.origin}).
              </p>
            </div>

            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={downloadQR}
                className="rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm"
              >
                Descargar PNG
              </button>
              <button
                onClick={printLabel}
                className="rounded-xl border border-[#E9C16C] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] px-3 py-1.5 text-sm text-[#181A20]"
              >
                Imprimir etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
