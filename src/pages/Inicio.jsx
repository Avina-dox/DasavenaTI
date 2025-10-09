import {
  Card, CardContent, Typography, Grid, Box, Divider, Avatar, Stack,
  TextField, InputAdornment, Chip, Skeleton, Tabs, Tab, Tooltip, IconButton
} from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip as ChartTooltip, Legend
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "../lib/api";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

const COLORS = ["#6b8afd","#22c55e","#fbbf24","#ef4444","#a78bfa","#22d3ee","#fb923c","#14b8a6","#f472b6","#84cc16"];

const money = (n=0) => (Number(n) || 0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2});
const safe = (v, d=0) => (v === null || v === undefined) ? d : v;

export default function Inicio(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // filtros
  const [q, setQ] = useState("");
  const [tab, setTab] = useState(0); // 0=Todos, 1=Disponibles, 2=Asignados, 3=Reparación, 4=Baja

  // -------- fetch con acumulación de TODAS las páginas --------
  const fetchData = async () => {
    setLoading(true);
    try {
      const base = {};
      if (q) base.q = q;
      if (tab === 1) base.status = "in_stock";
      if (tab === 2) base.status = "assigned";
      if (tab === 3) base.status = "repair";
      if (tab === 4) base.status = "retired";

      const per_page = 200;           // pide lotes grandes
      let page = 1;
      let all = [];
      let guard = 0;                  // evita bucles infinitos

      while (true) {
        const { data } = await api.get("/assets", { params: { ...base, page, per_page }});
        const items = data?.data || data || [];
        all = all.concat(items);

        const meta = data?.meta;
        if (!meta || meta.current_page >= meta.last_page) break;

        page = meta.current_page + 1;
        guard++;
        if (guard > 200) break;      // safety net (200 páginas máx)
      }

      setRows(all);
    } finally {
      setLoading(false);
    }
  };
  // ------------------------------------------------------------

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [tab]);
  useEffect(() => {
    const id = setTimeout(fetchData, 300);
    return () => clearTimeout(id);
  }, [q]); // debounce

  // KPIs
  const kpis = useMemo(() => {
    const total = rows.length;
    const asignados = rows.filter(a => a.status === "assigned").length;
    const disponibles = rows.filter(a => a.status === "in_stock").length;
    const book = rows.reduce((acc,a)=> acc + safe(a?.depreciation?.current,0), 0);
    return { total, asignados, disponibles, book };
  }, [rows]);

  // Pie: por tipo
  const pieData = useMemo(() => {
    const counts = rows.reduce((acc,a)=>{
      const k = a.type?.name || "Otro";
      acc[k] = (acc[k]||0)+1; return acc;
    },{});
    return {
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts), backgroundColor: COLORS, borderWidth: 2, borderColor: "#0b1020" }]
    };
  }, [rows]);

  // Barras: por marca
  const barData = useMemo(() => {
    const counts = rows.reduce((acc,a)=>{
      const k = a.brandRef?.name || a.brand || "Otro";
      acc[k] = (acc[k]||0)+1; return acc;
    },{});
    return {
      labels: Object.keys(counts),
      datasets: [{
        label: "Activos por marca",
        data: Object.values(counts),
        backgroundColor: COLORS,
        borderRadius: 8,
        maxBarThickness: 36
      }]
    };
  }, [rows]);

  // agrupado por usuario
  const porUsuario = useMemo(() => {
    const map = new Map();
    rows.forEach(a=>{
      const user = a.current_assignment?.user?.name ?? "Sin asignar";
      if(!map.has(user)) map.set(user, []);
      map.get(user).push(a);
    });
    return Array.from(map.entries()).sort((a,b)=>b[1].length - a[1].length);
  }, [rows]);

  const statusChip = (s) => {
    if (s==="in_stock") return <Chip size="small" label="disponible" color="success" />;
    if (s==="assigned") return <Chip size="small" label="asignado" color="primary" />;
    if (s==="repair") return <Chip size="small" label="reparación" color="warning" />;
    if (s==="retired") return <Chip size="small" label="baja" color="error" />;
    return <Chip size="small" label={s || "—"} />;
  };

  return (
    <Box sx={{ maxWidth: 1280, mx:"auto", p:{xs:2, md:4} }}>
      {/* Header */}
      <Card sx={{ borderRadius:4, mb:3, background:"linear-gradient(135deg,#2d1b3d 0%,#2a2e45 100%)", color:"#fff" }}>
        <CardContent sx={{ py:3 }}>
          <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src="https://dasavenasite.domcloud.dev/images/logo.png" sx={{ width:64, height:64, border:"3px solid rgba(255,255,255,.35)" }}/>
              <Box>
                <Typography variant="h5" fontWeight={800}>Dashboard de Activos</Typography>
                <Typography variant="body2" sx={{ opacity:.85 }}>
                  Visión general de inventario, uso y valor contable.
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs:"column", sm:"row" }} spacing={1} alignItems={{xs:"stretch", sm:"center"}}>
              <TextField
                size="small"
                value={q}
                onChange={(e)=>setQ(e.target.value)}
                placeholder="Buscar tag / serie / marca / usuario…"
                sx={{ minWidth: 280, bgcolor:"#fff", borderRadius:2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon color="primary" /></InputAdornment>
                  ),
                }}
              />
              <IconButton onClick={fetchData} sx={{ color:"#fff" }} aria-label="refrescar">
                <RefreshIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Tabs
            value={tab}
            onChange={(_,v)=>setTab(v)}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ mt:2 }}
          >
            <Tab label="Todos" />
            <Tab label="Disponibles" />
            <Tab label="Asignados" />
            <Tab label="Reparación" />
            <Tab label="Baja" />
          </Tabs>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb:1 }}>
        {[
          {label:"Activos totales", value:kpis.total, sub:"unidades"},
          {label:"Asignados", value:kpis.asignados, sub:"en uso"},
          {label:"Disponibles", value:kpis.disponibles, sub:"inventario"},
          {label:"Valor contable", value:`$ ${money(kpis.book)}`, sub:"depreciado"}
        ].map((k, i)=>(
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ borderRadius:3, boxShadow:3 }}>
              <CardContent>
                <Typography sx={{ opacity:.7, fontSize:13 }}>{k.label}</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt:.5 }}>{k.value}</Typography>
                <Typography variant="caption" sx={{ opacity:.6 }}>{k.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Pie por tipo */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius:3, height:"100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700}>Distribución por tipo</Typography>
              <Divider sx={{ my:1.5 }} />
              {loading
                ? <Skeleton variant="rounded" height={240} />
                : <Box sx={{ height:240, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Pie data={pieData} />
                  </Box>
              }
              <Box sx={{ mt:1, display:"flex", flexWrap:"wrap", gap:0.5 }}>
                {pieData.labels.map((l,i)=>(
                  <Chip key={l} size="small"
                    label={`${l} (${pieData.datasets[0].data[i]})`}
                    sx={{ bgcolor: COLORS[i%COLORS.length], color:"#fff" }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Barras por marca */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius:3, height:"100%" }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700}>Activos por marca</Typography>
              <Divider sx={{ my:1.5 }} />
              {loading
                ? <Skeleton variant="rounded" height={260} />
                : <Box sx={{ height:260 }}>
                    <Bar
                      data={barData}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false }},
                        scales: {
                          x:{ grid:{ display:false }, ticks:{ font:{ size:12 }}},
                          y:{ beginAtZero:true, grid:{ color:"#eee" }, ticks:{ stepSize:1 }}
                        }
                      }}
                    />
                  </Box>
              }
            </CardContent>
          </Card>
        </Grid>

        {/* Activos por usuario */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius:3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700}>Activos por usuario</Typography>
              <Divider sx={{ my:1.5 }} />
              <Grid container spacing={2}>
                {loading && Array.from({length:6}).map((_,i)=>(
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <Skeleton variant="rounded" height={120} />
                  </Grid>
                ))}
                {!loading && porUsuario.map(([user, assets])=>(
                  <Grid item xs={12} sm={6} md={4} lg={3} key={user}>
                    <Card sx={{ p:2, borderLeft:`6px solid ${user==="Sin asignar"?"#fbbf24":"#6b8afd"}` }}>
                      <Typography fontWeight={800} sx={{ mb:.5 }}>
                        {user==="Sin asignar" ? "— Sin asignar" : user}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity:.65 }}>
                        {assets.length} activo{assets.length!==1?"s":""}
                      </Typography>
                      <Divider sx={{ my:1 }} />
                      <Stack spacing={0.5}>
                        {assets.slice(0,3).map(a=>(
                          <Stack direction="row" key={a.id} spacing={1} alignItems="center">
                            <Tooltip title={a.type?.name || ""}>
                              <Avatar sx={{ width:22, height:22, bgcolor:COLORS[(a.id||0)%COLORS.length], fontSize:12 }}>
                                {a.type?.name?.[0] || "?"}
                              </Avatar>
                            </Tooltip>
                            <Typography variant="body2" sx={{ flex:1 }}>
                              <b>{a.asset_tag}</b> · {a.brandRef?.name || a.brand || ""} {a.model || ""}
                            </Typography>
                            {statusChip(a.status)}
                          </Stack>
                        ))}
                        {assets.length>3 &&
                          <Typography variant="caption" sx={{ opacity:.6 }}>
                            +{assets.length-3} más…
                          </Typography>
                        }
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Últimos activos (compacto) */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius:3 }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="subtitle1" fontWeight={700}>Últimos activos</Typography>
                <Typography variant="body2" sx={{ ml:"auto", opacity:.7 }}>
                  Total: <b>{rows.length}</b>
                </Typography>
              </Stack>
              <Divider sx={{ my:1.5 }} />
              <Grid container spacing={1.5}>
                {(loading ? Array.from({length:8}) : rows.slice(0,12)).map((a,i)=>(
                  <Grid item xs={12} sm={6} md={4} lg={3} key={a?.id || i}>
                    {loading
                      ? <Skeleton variant="rounded" height={88} />
                      : <Card sx={{ p:1.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width:28, height:28, bgcolor:COLORS[(a.id||0)%COLORS.length], color:"#fff" }}>
                              {a.type?.name?.[0] || "?"}
                            </Avatar>
                            <Box sx={{ flex:1 }}>
                              <Typography variant="body2" fontWeight={700}>{a.asset_tag}</Typography>
                              <Typography variant="caption" sx={{ opacity:.7 }}>
                                {a.brandRef?.name || a.brand || "—"} {a.model || ""}
                              </Typography>
                              <Typography variant="caption" sx={{ display:"block", opacity:.7 }}>
                                {a.current_assignment?.user?.name ?? "Sin usuario"}
                              </Typography>
                            </Box>
                            {statusChip(a.status)}
                          </Stack>
                        </Card>
                    }
                  </Grid>
                ))}
                {!loading && rows.length===0 && (
                  <Grid item xs={12}>
                    <Typography align="center" sx={{ opacity:.7 }}>No hay activos para mostrar.</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
