import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

function useDebounce(v, ms = 350) {
  const [val, setVal] = useState(v);
  useEffect(() => { const id = setTimeout(() => setVal(v), ms); return () => clearTimeout(id); }, [v, ms]);
  return val;
}

export default function Usuarios() {
  const nav = useNavigate();

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);

  const [q, setQ] = useState("");
  const dq = useDebounce(q, 350);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useMemo(() => async (term, pageNum, per) => {
    const { data } = await api.get("/users", {
      params: { search: term || "", page: pageNum, per_page: per },
    });
    // si por alguna razón el backend no pagina, normalizamos
    return {
      data: data.data || data,
      meta: data.meta || {
        current_page: pageNum,
        last_page: 1,
        from: 1,
        to: (data.data || data).length,
        total: (data.data || data).length,
      },
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await fetchUsers(dq, page, perPage);
        if (!ignore) {
          setRows(res.data);
          setMeta(res.meta);
        }
      } catch (e) {
        if (!ignore) setError(e?.response?.data?.message || "No se pudieron cargar los usuarios");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [dq, page, perPage, fetchUsers]);

  const cxInput = "rounded-xl bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-[#E9C16C]";

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(meta?.last_page || p, p + 1));

  // para números de página (compacto)
  const pages = (() => {
    if (!meta) return [1];
    const total = meta.last_page;
    const cur = meta.current_page;
    const arr = [];
    const push = (n) => { if (!arr.includes(n) && n >= 1 && n <= total) arr.push(n); };
    push(1); push(2); push(cur - 1); push(cur); push(cur + 1); push(total - 1); push(total);
    return arr.sort((a,b)=>a-b);
  })();

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg font-semibold">Usuarios</h1>
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar por nombre o correo"
            className={cxInput}
          />
          <select
            value={perPage}
            onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
            className={cxInput}
          >
            {[10,20,50,100].map(n => <option key={n} value={n}>{n} / página</option>)}
          </select>
          <button onClick={() => { setQ(""); setPage(1); }} className="rounded-xl bg-white/10 px-3 py-2 text-sm">Limpiar</button>
        </div>
      </header>

      {error && <div className="rounded-xl bg-red-500/15 text-red-200 px-3 py-2 text-sm">{error}</div>}

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Correo</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-3 py-3" colSpan={4}>Cargando…</td></tr>}
            {!loading && rows.length === 0 && (
              <tr><td className="px-3 py-3" colSpan={4}>Sin resultados</td></tr>
            )}
            {rows.map((u) => (
              <tr key={u.id} className="odd:bg-white/5 hover:bg-white/10 transition">
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.name || u.nombre}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <Link
                      to={`/usuarios/${u.id}`}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
                    >
                      Ver activos
                    </Link>
                    <button
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs hover:bg-white/20"
                      onClick={() => nav(`/asignar?user=${u.id}&n=${encodeURIComponent(u.name)}`)}
                    >
                      Asignar activo
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-xs opacity-80">
            Mostrando {meta.from ?? 0}-{meta.to ?? 0} de {meta.total ?? rows.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              disabled={meta.current_page <= 1}
              className="rounded-xl bg-white/10 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              ← Anterior
            </button>

            {pages.map((p, i) => (
              <button
                key={`${p}-${i}`}
                onClick={() => setPage(p)}
                className={`rounded-xl px-3 py-1.5 text-sm ${
                  p === meta.current_page ? "bg-white/20" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={goNext}
              disabled={meta.current_page >= meta.last_page}
              className="rounded-xl bg-white/10 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
