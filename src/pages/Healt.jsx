// src/pages/Health.jsx
import { useEffect, useState } from "react";
import api, { API_BASE } from "../lib/api";
export default function Health(){
  const [out,setOut]=useState("Probando /api/ping ...");
  useEffect(()=>{
    (async()=>{
      try {
        const {data} = await api.get("/api/ping");
        setOut("✅ " + JSON.stringify(data));
      } catch(e) {
        console.error(e);
        setOut("❌ " + (e?.message || "ver consola"));
      }
    })();
  },[]);
  return <pre style={{padding:16}}>API_BASE={API_BASE}\n{out}</pre>;
}
