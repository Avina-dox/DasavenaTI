// src/pages/activos/index.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import { cx } from "../../utils/format";
import api from "../../lib/api";

import { useAssets } from "./useAssets";
import Filters from "./Filters";
import AssetCard from "./AssetCard";
import { exportToExcel, exportToPDF } from "./Exports";

export default function ActivosPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const {
    rows,
    meta,
    types,
    loading,
    pages,
    q, setQ,
    status, setStatus,
    typeId, setTypeId,
    perPage, setPerPage,
    fetchData,
  } = useAssets();

  const [exporting, setExporting] = useState(false);

  const classes = {
    pageBg: isDark ? "" : "bg-gradient-to-br from-[#f6f7fb] via-white to-[#eef2ff]",
    titleClr: isDark ? "text-[#E9C16C]" : "text-[#1E3A8A]",
    subTitleClr: isDark ? "text-[#E9C16C]/70" : "text-slate-600",
    fieldBg: isDark ? "bg-[#23263a]" : "bg-white",
    fieldText: isDark ? "text-[#E9C16C]" : "text-slate-800",
    fieldRing: isDark ? "ring-[#E9C16C]/30 focus:ring-[#E9C16C]" : "ring-slate-300 focus:ring-slate-500",
    cardBg: isDark
      ? "bg-gradient-to-br from-[#23263a] via-[#161922] to-[#23263a] border-[#E9C16C]/10"
      : "bg-gradient-to-br from-white via-slate-50 to-white border-slate-200",
    pillBtn: isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10",
    textSoft: isDark ? "text-[#E9C16C]/75" : "text-slate-700",
    textHard: isDark ? "text-[#E9C16C]" : "text-slate-900",
  };

  /** Trae TODOS los activos que coinciden con los filtros actuales (paginando por dentro). */
  async function fetchAllFiltered() {
    let page = 1;
    let results = [];
    let last = 1;

    do {
      const { data } = await api.get("/assets", {
        params: {
          q: q || undefined,
          status: status || undefined,
          type_id: typeId || undefined,
          page,
          per_page: 100, // batch grande
        },
      });

      const items = data?.data || data || [];
      const metaResp = data?.meta || null;

      results = results.concat(items);
      last = metaResp?.last_page ?? page;
      page++;
    } while (page <= last);

    return results;
  }

  async function handleExcel() {
    setExporting(true);
    try {
      await exportToExcel(fetchAllFiltered, { q, status, typeId });
    } finally {
      setExporting(false);
    }
  }

  async function handlePdf() {
    setExporting(true);
    try {
      await exportToPDF(fetchAllFiltered, { q, status, typeId });
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className={cx("min-h-screen rounded-2xl py-10 px-4 md:px-8 lg:px-16", classes.pageBg)}>
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div>
          <h1 className={cx("text-4xl font-extrabold tracking-widest drop-shadow mb-1", classes.titleClr)}>
            Activos
          </h1>
          <p className={cx("text-sm", classes.subTitleClr)}>Gestión y seguimiento de activos tecnológicos</p>
        </div>

        <Filters
          q={q} setQ={setQ}
          status={status} setStatus={setStatus}
          typeId={typeId} setTypeId={setTypeId}
          perPage={perPage} setPerPage={setPerPage}
          types={types}
          onFilterClick={() => fetchData(1)}
          onExcel={handleExcel}
          onPdf={handlePdf}
          exporting={exporting}
          classes={classes}
        />
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {loading && (
          <div className="col-span-full flex justify-center items-center py-16">
            <span className={cx("animate-pulse text-lg", classes.subTitleClr)}>Cargando…</span>
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="col-span-full flex justify-center items-center py-16">
            <span className={cx("text-lg", isDark ? "text-[#E9C16C]/40" : "text-slate-400")}>Sin resultados</span>
          </div>
        )}

        {!loading && rows.map((a) => (
          <AssetCard key={a.id} a={a} types={types} isDark={isDark} classes={classes} />
        ))}
      </div>

      {meta && (
        <div className="mt-8 flex items-center justify-between">
          <p className={cx("text-xs", classes.subTitleClr)}>
            Mostrando {meta.from ?? 0}-{meta.to ?? 0} de {meta.total ?? 0}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchData(Math.max(1, meta.current_page - 1))}
              disabled={meta.current_page <= 1}
              className={cx(
                "rounded-xl px-3 py-1.5 text-sm disabled:opacity-50",
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
              )}
            >
              ← Anterior
            </button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => fetchData(p)}
                className={cx(
                  "rounded-xl px-3 py-1.5 text-sm",
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
              className={cx(
                "rounded-xl px-3 py-1.5 text-sm disabled:opacity-50",
                isDark ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"
              )}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
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
    </section>
  );
}
