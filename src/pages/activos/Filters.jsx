// src/pages/activos/Filters.jsx
import { cx } from "../../utils/format";

export default function Filters({
  q, setQ,
  status, setStatus,
  typeId, setTypeId,
  perPage, setPerPage,
  types,
  onFilterClick,
  onExcel, onPdf,
  exporting,
  classes,
}) {
  const { subTitleClr, fieldBg, fieldText, fieldRing } = classes;

  return (
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

      <div className="md:col-span-5 flex gap-2">
        <button
          onClick={onFilterClick}
          className="rounded-2xl border border-[#E9C16C] px-4 py-2 text-sm text-[#181A20] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] shadow-md hover:scale-105 transition font-semibold"
        >
          Filtrar
        </button>

        <button
          onClick={onExcel}
          disabled={exporting}
          className="rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-[#E9C16C] border border-[#E9C16C]/30 disabled:opacity-50"
          title="Exporta lo que coincide con los filtros actuales"
        >
          {exporting ? "Exportando…" : "Excel"}
        </button>

        <button
          onClick={onPdf}
          disabled={exporting}
          className="rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-[#E9C16C] border border-[#E9C16C]/30 disabled:opacity-50"
          title="Exporta lo que coincide con los filtros actuales"
        >
          {exporting ? "Exportando…" : "PDF"}
        </button>
      </div>
    </div>
  );
}
