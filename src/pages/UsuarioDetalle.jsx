import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { hour12: false });
  } catch {
    return "—";
  }
}

export default function UsuarioDetalle() {
  const { id } = useParams(); // user id

  // cada row representa una asignación: { id, assigned_at, returned_at, asset: {..., type: {...}} }
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // ids de asignaciones en proceso de devolución
  const [returningAssignIds, setReturningAssignIds] = useState([]);
  const returningSet = useMemo(() => new Set(returningAssignIds), [returningAssignIds]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchAssets() {
      setLoading(true);
      setError(null);
      try {
        // Espera una lista de asignaciones con asset/type anidados e "id" de la asignación
        const { data } = await api.get(`/users/${id}/assets`, { signal: controller.signal });
        if (!isMounted) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error cargando activos del usuario:", err);
        if (isMounted) setError("No se pudieron cargar los activos. Intenta de nuevo.");
      } finally {
        isMounted && setLoading(false);
      }
    }

    fetchAssets();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id, refreshCounter]);

  const handleRefresh = () => setRefreshCounter((c) => c + 1);

  const handleReturn = async (assetId, assignmentId) => {
    if (!assetId || !assignmentId) return;
    if (returningSet.has(assignmentId)) return;
    if (!window.confirm("¿Deseas devolver este activo?")) return;

    setReturningAssignIds((prev) => [...prev, assignmentId]);
    try {
      await api.post(`/assignments/${assignmentId}/return`, {
        condition_in: "good",
        notes: "Devuelto desde UsuarioDetalle",
      });
      handleRefresh();
    } catch (err) {
      console.error("Error al devolver activo:", err);
      alert(err?.response?.data?.message || "No se pudo devolver el activo.");
      handleRefresh(); // asegura estado consistente si el backend cambió algo
    } finally {
      setReturningAssignIds((prev) => prev.filter((x) => x !== assignmentId));
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Activos del usuario #{id}</h1>
        <button
          onClick={handleRefresh}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Asset</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Asignado</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-left">Devuelto</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <>
                {[...Array(3)].map((_, i) => (
                  <tr key={`sk-${i}`} className="odd:bg-white/5 animate-pulse">
                    <td className="px-3 py-3">
                      <div className="h-4 w-28 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-24 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-36 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-20 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-20 rounded bg-white/10" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-6 w-40 rounded bg-white/10" />
                    </td>
                  </tr>
                ))}
              </>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-white/70" colSpan={6}>
                  Sin activos asignados
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((r) => {
                // r = asignación
                const assignmentId = r.id;
                const assetId = r.asset?.id;
                const assetTag = r.asset?.asset_tag ?? "—";
                const typeName = r.asset?.type?.name ?? "—";
                const assignedAt = fmtDate(r.assigned_at);
                const returnedAt = fmtDate(r.returned_at);
                const vigente = !r.returned_at;
                const disabledReturn = !assetId || returningSet.has(assignmentId);

                // opcional: si tu API trae URL de factura en el asset
                const invoiceUrl = r.asset?.invoice_url ?? null;

                return (
                  <tr key={assignmentId} className="odd:bg-white/5">
                    <td className="px-3 py-2 font-mono">{assetTag}</td>
                    <td className="px-3 py-2">{typeName}</td>
                    <td className="px-3 py-2">{assignedAt}</td>
                    <td className="px-3 py-2">
                      {vigente ? <span className="text-amber-300">Vigente</span> : "Devuelto"}
                    </td>
                    <td className="px-3 py-2">{vigente ? "—" : returnedAt}</td>

                    <td className="px-3 py-2">
                      <div className="mt-2 flex items-center gap-2">
                        {assetId ? (
                          <Link
                            to={`/activos/editar/${assetId}`} // misma ruta que la vista que ya te funciona
                            className="rounded-xl px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20"
                            title={`Ver ${assetTag}`}
                          >
                            Ver
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="rounded-xl px-3 py-1.5 text-xs opacity-50 cursor-not-allowed bg-white/10"
                            title="Sin ID de activo"
                          >
                            Ver
                          </button>
                        )}

                        {invoiceUrl ? (
                          <a
                            href={invoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20"
                            title="Ver factura"
                          >
                            Factura
                          </a>
                        ) : (
                          <button
                            disabled
                            className="rounded-xl px-3 py-1.5 text-xs opacity-50 cursor-not-allowed bg-white/10"
                            title="Sin factura"
                          >
                            Factura
                          </button>
                        )}

                        {vigente ? (
                          <button
                            onClick={() => handleReturn(assetId, assignmentId)}
                            className="ml-auto rounded-xl border border-[#E9C16C] bg-gradient-to-r from-[#D6A644] to-[#E9C16C] px-3 py-1.5 text-xs text-[#181A20] disabled:opacity-50"
                            disabled={disabledReturn}
                          >
                            {returningSet.has(assignmentId) ? "Devolviendo…" : "Devolver"}
                          </button>
                        ) : (
                          <span className="opacity-60 text-xs ml-auto">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
