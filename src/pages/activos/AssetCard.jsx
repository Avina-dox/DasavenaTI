// src/pages/activos/AssetCard.jsx
import { Link, useNavigate } from "react-router-dom";
import { cx, join, fmtDate, fmtMoney, fmtPhone, badge } from "../../utils/format";
import { storagePublicUrl } from "../../lib/api";
import { isPhoneType } from "../../utils/isPhoneType";

export default function AssetCard({ a, types, isDark, classes }) {
  const nav = useNavigate();
  const { cardBg, textSoft, textHard, pillBtn } = classes;

  const brandName = a.brandRef?.name || a.brand || "";
  const invoiceUrl = storagePublicUrl(a.invoice_path);
  const dep = a.depreciation || null;
  const isPhone = isPhoneType(a.type_id, types);

  return (
    <div className={cx("rounded-3xl border shadow-xl p-5 flex flex-col gap-3 hover:shadow-2xl transition", cardBg)}>
      <div className="flex items-center justify-between">
        <span className={cx("font-mono text-base font-bold", textHard)}>{a.asset_tag}</span>
        <span className={cx("px-3 py-1 rounded-full text-xs font-bold border", badge(a.status, isDark))}>
          {a.status}
        </span>
      </div>

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

        {isPhone && (
          <div className={cx("mt-2 rounded-xl border p-2", isDark ? "bg-[#0d111a]/40 border-white/10" : "bg-slate-50 border-slate-200")}>
            <div className="grid grid-cols-2 gap-2">
              <div className={cx("text-xs", textSoft)}>
                Número: <span className={textHard}>{a.phone_number ? fmtPhone(a.phone_number) : "—"}</span>
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

        <div className={cx("mt-2 rounded-xl border p-2", isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")}>
          <div className="grid grid-cols-2 gap-2">
            <div className={cx("text-xs", textSoft)}>
              Compra: <span className={textHard}>{fmtDate(a.purchase_date)}</span>
            </div>
            <div className={cx("text-xs", textSoft)}>
              Costo: <span className={textHard}>${fmtMoney(a.purchase_cost)}</span>
            </div>
            <div className={cx("text-xs", textSoft)}>
              Valor actual: <span className={textHard}>{dep ? `$${fmtMoney(dep.current)}` : "—"}</span>
            </div>
            <div className={cx("text-xs", isDark ? "text-[#E9C16C]/60" : "text-slate-500")}>
              Dep.: 10% anual {dep ? `• ${Math.floor(dep.years)}a ${Math.round((dep.years % 1) * 12)}m` : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Link to={`/activos/editar/${a.id}`} className={cx("rounded-xl px-3 py-1.5 text-xs", pillBtn)}>
          Ver
        </Link>

        {invoiceUrl ? (
          <a href={invoiceUrl} target="_blank" rel="noreferrer" className={cx("rounded-xl px-3 py-1.5 text-xs", pillBtn)} title="Ver factura">
            Factura
          </a>
        ) : (
          <button disabled className={cx("rounded-xl px-3 py-1.5 text-xs opacity-50 cursor-not-allowed", pillBtn)} title="Sin factura">
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
}
