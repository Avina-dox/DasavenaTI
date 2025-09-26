import { useEffect, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function ActivoNuevo() {
  const nav = useNavigate();
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({
    type_id: "", brand: "", model: "", serial_number: "", condition: "good", notes: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // si agregaste endpoint /asset-types
    (async () => {
      try {
        const { data } = await api.get("/asset-types");
        setTypes(data);
      } catch {
        setTypes([]); // si no existe, deja input manual de type_id
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/assets", {
        ...form,
        type_id: Number(form.type_id)
      });
      nav("/activos");
    } finally {
      setSaving(false);
    }
  };

  const cx = "rounded-xl bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-[#E9C16C] w-full";

  return (
    <section className="max-w-3xl">
      <h1 className="mb-4 text-lg font-semibold">Nuevo activo</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Tipo</label>
          {types.length > 0 ? (
            <select className={cx} value={form.type_id} onChange={(e)=>setForm(f=>({...f,type_id:e.target.value}))} required>
              <option value="">Selecciona tipo…</option>
              {types.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          ) : (
            <input className={cx} placeholder="Type ID" value={form.type_id}
              onChange={(e)=>setForm(f=>({...f,type_id:e.target.value}))} required />
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Condición</label>
          <select className={cx} value={form.condition} onChange={(e)=>setForm(f=>({...f,condition:e.target.value}))}>
            <option value="new">new</option>
            <option value="good">good</option>
            <option value="fair">fair</option>
            <option value="poor">poor</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Marca</label>
          <input className={cx} value={form.brand} onChange={(e)=>setForm(f=>({...f,brand:e.target.value}))} />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Modelo</label>
          <input className={cx} value={form.model} onChange={(e)=>setForm(f=>({...f,model:e.target.value}))} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Serie</label>
          <input className={cx} value={form.serial_number} onChange={(e)=>setForm(f=>({...f,serial_number:e.target.value}))} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Notas</label>
          <textarea rows="3" className={cx} value={form.notes} onChange={(e)=>setForm(f=>({...f,notes:e.target.value}))} />
        </div>

        <div className="md:col-span-2 flex justify-end gap-2">
          <button type="button" onClick={()=>nav(-1)} className="rounded-xl bg-white/10 px-4 py-2 text-sm">Cancelar</button>
          <button disabled={saving} className="rounded-xl border border-[#E9C16C] px-4 py-2 text-sm text-black bg-gradient-to-r from-[#D6A644] to-[#E9C16C]">
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}
