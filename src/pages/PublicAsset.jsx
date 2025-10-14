// src/pages/PublicAsset.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { storagePublicUrl } from "../lib/api";
import { isPhoneType } from "../utils/isPhoneType";
import { QRCodeCanvas } from "qrcode.react";

const money = (n) =>
  (n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtDate = (s) => (s ? String(s).slice(0, 10) : "—");
const join = (arr) => arr.filter(Boolean).join(" / ");

// leyenda para datos restringidos
const LOCKED = "🔒 Inicia sesión para ver";

export default function PublicAsset() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetcher = useMemo(
    () => async () => {
      setLoading(true);
      try {
        const [a, t] = await Promise.allSettled([
          api.get(`/public/assets/${id}`),
          api.get("/asset-types"),
        ]);

        // el recurso público suele venir como { data: {...} }
        if (a.status === "fulfilled") {
          setAsset(a.value.data?.data ?? a.value.data);
        }
        if (t.status === "fulfilled") setTypes(t.value.data || []);
      } finally {
        setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetcher();
  }, [fetcher]);

  if (loading) {
    return (
      <section className="min-h-screen grid place-items-center bg-[#0f1116]">
        <p className="text-[#E9C16C]/80">Cargando…</p>
      </section>
    );
  }

  if (!asset) {
    return (
      <section className="min-h-screen grid place-items-center bg-[#0f1116]">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="text-[#E9C16C] font-semibold">Activo no encontrado</p>
          <Link
            to="/"
            className="inline-block mt-3 text-sm text-[#E9C16C]/80 underline"
          >
            Ir al inicio
          </Link>
        </div>
      </section>
    );
  }

  const brandName = asset.brandRef?.name || asset.brand || "";
  const dep = asset.depreciation || null;

  // detección robusta de "teléfono"
  const typeName = (asset.type?.name || "").toLowerCase();
  const isPhone = typeName.includes("tel") || isPhoneType(asset.type_id, types);

  const invoiceUrl = storagePublicUrl(asset.invoice_path);
  const qrValue = `${window.location.origin}/#/a/${asset.id}`;

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#151823] via-[#0f121a] to-[#0b0e14] py-10 px-4 md:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#E9C16C]/20 bg-white/5 p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#E9C16C] tracking-wide">
              {asset.asset_tag}
            </h1>
            <p className="text-sm text-slate-300/80">
              Vista pública de identificación — sin edición
            </p>
          </div>
          <div className="rounded-xl bg-white p-2">
            <QRCodeCanvas value={qrValue} size={96} level="M" />
          </div>
        </div>

        {/* Datos */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Estado" value={asset.status || "—"} />
              <Field label="Condición" value={asset.condition || "—"} />
              <Field label="Tipo" value={asset.type?.name || "—"} />
              <Field label="Marca" value={brandName || "—"} />
              <Field label="Modelo" value={asset.model || "—"} />
              <Field label="Serie" value={asset.serial_number || "—"} />
            </div>

            {/* Teléfonos: mostrar SOLO datos no sensibles */}
            {isPhone && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sensible */}
                <Field label="Número telefónico" value={LOCKED} />
                {/* No sensibles */}
                <Field label="Proveedor" value={asset.carrier || "—"} />
                <Field
                  label="Equipo libre/desbloqueado"
                  value={asset.is_unlocked ? "Sí" : "No"}
                  span={2}
                />
              </div>
            )}

            <div>
              <Label>Notas</Label>
              <div className="rounded-xl bg-[#23263a] px-3 py-2 text-sm min-h-[40px] text-slate-100">
                {asset.notes || "—"}
              </div>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-4">
            {/* Compra (oculta) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold text-[#E9C16C] mb-2">Compra</h3>
              <p className="text-sm text-slate-300">{LOCKED}</p>
              {/* Si prefieres ocultar por completo, borra este bloque */}
              {/*
              <div className="space-y-1 text-sm">
                <Row k="Fecha de compra" v={fmtDate(asset.purchase_date)} />
                <Row k="Costo" v={`$${money(asset.purchase_cost)}`} />
                {dep && (
                  <>
                    <Row k="Valor actual" v={`$${money(dep.current)}`} />
                    <p className="text-xs text-[#E9C16C]/60">
                      Depreciación 10% anual • {Math.floor(dep.years)}a{" "}
                      {Math.round((dep.years % 1) * 12)}m
                    </p>
                  </>
                )}
              </div>
              */}
            </div>

            {/* Factura (oculta) */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold text-[#E9C16C] mb-2">Factura</h3>
              <p className="text-sm text-slate-300">{LOCKED}</p>
              {/* En privado podrías mostrar:
              {invoiceUrl ? (
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-xl bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm"
                >
                  Ver factura
                </a>
              ) : (
                <p className="text-sm text-slate-300/80">No disponible</p>
              )} */}
            </div>

            {/* Resumen */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-semibold text-[#E9C16C] mb-1">Resumen</h3>
              <p className="text-sm text-slate-100">
                {asset.type?.name ?? "—"} • {join([brandName, asset.model]) || "—"} •
                Serie: {asset.serial_number || "—"}
              </p>
            </div>

            <div className="flex justify-end">
              <Link
                to="/"
                className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-slate-100"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- UI helpers --- */
function Label({ children }) {
  return <label className="text-xs text-slate-300">{children}</label>;
}

function Field({ label, value, span }) {
  return (
    <div className={span ? `md:col-span-${span}` : ""}>
      <Label>{label}</Label>
      <div className="rounded-xl bg-[#23263a] px-3 py-2 text-sm min-h-[40px] text-slate-100">
        {value}
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-300">{k}</span>
      <span className="text-slate-100">{v}</span>
    </div>
  );
}
