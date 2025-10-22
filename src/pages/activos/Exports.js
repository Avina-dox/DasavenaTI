// src/pages/activos/Exports.js
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* Util */
const safe = (s) => String(s ?? "").replace(/[^\w\-]+/g, "_");

/* Aplana un activo a una fila para Excel/PDF */
const mapRow = (a) => {
  const brandName = a?.brandRef?.name || a?.brand || "";
  const assigned =
    a?.current_assignment?.user?.name ||
    a?.currentAssignment?.user?.name ||
    "";
  const dep = a?.depreciation || null;

  return {
    Tag: a?.asset_tag || "",
    Tipo: a?.type?.name || "",
    Marca: brandName,
    Modelo: a?.model || "",
    Serie: a?.serial_number || "",
    Estado: a?.status || "",
    Condición: a?.condition || "",
    "Asignado a": assigned,
    "Fecha compra": a?.purchase_date ? String(a.purchase_date).slice(0, 10) : "",
    Costo: a?.purchase_cost ?? "",
    "Valor actual": dep?.current ?? "",
    Proveedor: a?.carrier || a?.provider || "",
    "Número tel.": a?.phone_number || "",
  };
};

/* =============== EXCEL =============== */
export async function exportToExcel(fetchAll, opts = {}) {
  // fetchAll: función que trae TODOS los activos filtrados (paginando por dentro)
  const list = await fetchAll();
  const rows = (list || []).map(mapRow);

  const ws = XLSX.utils.json_to_sheet(rows);

  // ancho cómodo por columna
  ws["!cols"] = [
    { wch: 12 }, // Tag
    { wch: 16 }, // Tipo
    { wch: 16 }, // Marca
    { wch: 22 }, // Modelo
    { wch: 22 }, // Serie
    { wch: 12 }, // Estado
    { wch: 12 }, // Condición
    { wch: 28 }, // Asignado a
    { wch: 12 }, // Fecha
    { wch: 12 }, // Costo
    { wch: 12 }, // Valor actual
    { wch: 14 }, // Proveedor
    { wch: 16 }, // Número tel.
  ];

  // filtro en encabezado
  const endCol = 12; // 0..12 (13 columnas)
  ws["!autofilter"] = {
    ref: XLSX.utils.encode_range({
      s: { r: 0, c: 0 },
      e: { r: rows.length, c: endCol },
    }),
  };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Activos");

  const f = `Activos_${safe(opts.status || "todos")}_${safe(
    opts.typeId || "tipos"
  )}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  XLSX.writeFile(wb, f);
}

/* =============== PDF =============== */
export async function exportToPDF(fetchAll, opts = {}) {
  const { status = "", typeId = "", q = "" } = opts;

  const list = await fetchAll();

  const head = [["Tag", "Tipo", "Marca/Modelo", "Serie", "Estado", "Asignado a"]];
  const body = (list || []).map((a) => {
    const brandName = a?.brandRef?.name || a?.brand || "";
    const mm = [brandName, a?.model].filter(Boolean).join(" / ");
    const assigned =
      a?.current_assignment?.user?.name ||
      a?.currentAssignment?.user?.name ||
      "";
    return [a?.asset_tag, a?.type?.name || "", mm, a?.serial_number || "", a?.status || "", assigned];
  });

  // pt para tener control de anchos
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });

  // título
  doc.setFontSize(12);
  doc.text("Listado de Activos", 24, 24);

  autoTable(doc, {
    head,
    body,
    startY: 40,
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [233, 193, 108], textColor: [24, 26, 32] },
    margin: { left: 18, right: 18 },
    tableWidth: "auto",
    columnStyles: {
      0: { cellWidth: 80 },  // Tag
      1: { cellWidth: 90 },  // Tipo
      2: { cellWidth: 230 }, // Marca/Modelo
      3: { cellWidth: 130 }, // Serie
      4: { cellWidth: 80 },  // Estado
      5: { cellWidth: 180 }, // Asignado a
    },
    didDrawPage: () => {
      const h = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      const filtros = `Generado: ${new Date().toLocaleString()}  •  Filtros: estado=${status || "todos"}, tipo=${typeId || "todos"}${q ? `, q=${q}` : ""}`;
      doc.text(filtros, 24, h - 10);
    },
  });

  const f = `Activos_${safe(status || "todos")}_${safe(
    typeId || "tipos"
  )}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(f);
}
