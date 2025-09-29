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
    <section className="max-w-xl mx-auto mt-14 p-8 bg-[#18181b] rounded-3xl shadow-2xl border border-[#E9C16C]/20">
      <h1 className="mb-8 text-3xl font-bold text-[#E9C16C] text-center tracking-tight">Nuevo Activo</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">Tipo</label>
            {types.length > 0 ? (
              <select
                className="rounded-xl bg-[#23232a] px-3 py-2 text-sm text-white outline-none ring-1 ring-[#E9C16C]/20 focus:ring-2 focus:ring-[#E9C16C] transition-all"
                value={form.type_id}
                onChange={(e)=>setForm(f=>({...f,type_id:e.target.value}))}
                required
              >
                <option value="">Selecciona tipo…</option>
                {types.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            ) : (
              <input
                className="rounded-xl bg-[#23232a] px-3 py-2 text-sm text-white outline-none ring-1 ring-[#E9C16C]/20 focus:ring-2 focus:ring-[#E9C16C] transition-all"
                placeholder="Type ID"
                value={form.type_id}
                onChange={(e)=>setForm(f=>({...f,type_id:e.target.value}))}
                required
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">Condición</label>
            <select
              className="rounded-xl bg-[#23232a] px-3 py-2 text-sm text-white outline-none ring-1 ring-[#E9C16C]/20 focus:ring-2 focus:ring-[#E9C16C] transition-all"
              value={form.condition}
              onChange={(e)=>setForm(f=>({...f,condition:e.target.value}))}
            >
              <option value="new">Nuevo</option>
              <option value="good">Bueno</option>
              <option value="fair">Regular</option>
              <option value="poor">Malo</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">Marca</label>
            <input
              className="rounded-xl bg-[#23232a] px-3 py-2 text-sm text-white outline-none ring-1 ring-[#E9C16C]/20 focus:ring-2 focus:ring-[#E9C16C] transition-all"
              value={form.brand}
              onChange={(e)=>setForm(f=>({...f,brand:e.target.value}))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#E9C16C]">Modelo</label>
            <input
              className="rounded-xl bg-[#23232a] px-3 py-2 text-sm text-white outline-none ring-1 ring-[#E9C16C]/20 focus:ring-2 focus:ring-[#E9C16C] transition-all"
              value={form.model}
              onChange={(e)=>setForm(f=>({...f,model:e.target.value}))}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#E9C16C]">Serie</label>
          <input
            className="rounded-xl bg-[#23232a] px-3 py-2 text-sm text-white outline-none ring-1 ring-[#E9C16C]/20 focus:ring-2 focus:ring-[#E9C16C] transition-all w-full"
            value={form.serial_number}
            onChange={(e)=>setForm(f=>({...f,serial_number:e.target.value}))}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#E9C16C]">Notas</label>
          <textarea
            rows="3"
            className="rounded-xl bg-[#23232a] px-3 py-2 text-sm text-white outline-none ring-1 ring-[#E9C16C]/20 focus:ring-2 focus:ring-[#E9C16C] transition-all w-full resize-none"
            value={form.notes}
            onChange={(e)=>setForm(f=>({...f,notes:e.target.value}))}
          />
        </div>
        <div className="flex justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={()=>nav(-1)}
            className="rounded-xl px-6 py-2 text-sm font-medium text-[#E9C16C] border border-[#E9C16C] bg-transparent hover:bg-[#E9C16C]/10 transition-all"
          >
            Cancelar
          </button>
          <button
            disabled={saving}
            className="rounded-xl px-6 py-2 text-sm font-semibold text-[#18181b] bg-gradient-to-r from-[#E9C16C] to-[#D6A644] shadow-md transition-all disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}
