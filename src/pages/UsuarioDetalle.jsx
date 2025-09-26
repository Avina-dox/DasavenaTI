import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function UsuarioDetalle(){
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    (async ()=>{
      setLoading(true);
      try{
        const { data } = await api.get(`/users/${id}/assets`);
        setRows(data);
      } finally { setLoading(false); }
    })();
  },[id]);

  return (
    <section className="space-y-3">
      <h1 className="text-lg font-semibold">Activos del usuario #{id}</h1>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="px-3 py-2 text-left">Asset</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-left">Asignado</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td className="px-3 py-3" colSpan={3}>Cargando…</td></tr>}
            {!loading && rows.length === 0 && <tr><td className="px-3 py-3" colSpan={3}>Sin activos asignados</td></tr>}
            {rows.map(r => (
              <tr key={r.id} className="odd:bg-white/5">
                <td className="px-3 py-2 font-mono">{r.asset?.asset_tag}</td>
                <td className="px-3 py-2">{r.asset?.type?.name}</td>
                <td className="px-3 py-2">{new Date(r.assigned_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
