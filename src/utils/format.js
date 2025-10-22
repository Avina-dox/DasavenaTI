// src/utils/format.js
export const fmtDate = (s) => (s ? String(s).slice(0, 10) : "—");

export const fmtMoney = (n) =>
  (n ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const join = (arr) => arr.filter(Boolean).join(" / ");

export const cx = (...a) => a.filter(Boolean).join(" ");

export const fmtPhone = (v) => {
  const s = (v || "").replace(/[^\d+]/g, "");
  return s.startsWith("+")
    ? s.replace(/^(\+\d{2})(\d{2})(\d{4})(\d{4}).*/, "$1 $2 $3 $4").trim()
    : s.replace(/^(\d{2})(\d{4})(\d{4}).*/, "$1 $2 $3").trim();
};

export const safeName = (s) => String(s ?? "").replace(/[^\w\-]+/g, "_");

export const badge = (status, isDark) => {
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
