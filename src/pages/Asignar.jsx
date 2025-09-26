import { useState } from "react";
import api from "../lib/api";

export default function Asignar(){
  const [assetId, setAssetId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const cx = "rounded-xl bg-white/10 px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-[#E9C16C] w-full";

  const onSubmit = async (e)=>{
    e.preventDefault();
    setLoading(true);
    try{
      await api.post("/assignments", {
        asset_id: Number(assetId),
        user_id: Number(userId),
        condition_out: "good",
        notes: "Entrega desde front"
      });
      alert("Asignado correctamente");
      setAssetId(""); setUserId("");
    } finally { setLoading(false); }
  };

  return (
    <section className="max-w-md">
      <h1 className="text-lg font-semibold mb-4">Asignar activo</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">Asset ID</label>
          <input className={cx} value={assetId} onChange={(e)=>setAssetId(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-white/70">User ID</label>
          <input className={cx} value={userId} onChange={(e)=>setUserId(e.target.value)} required />
        </div>
        <button disabled={loading} className="rounded-xl border border-[#E9C16C] px-4 py-2 text-sm text-black bg-gradient-to-r from-[#D6A644] to-[#E9C16C]">
          {loading ? "Asignando…" : "Asignar"}
        </button>
      </form>
    </section>
  );
}
