import {
    Card,
    CardContent,
    Typography,
    Grid,
    Box,
    Divider,
    Avatar,
    Stack,
    TextField,
    InputAdornment,
    CircularProgress,
    Chip,
    Tooltip,
    Fade,
} from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip as ChartTooltip,
    Legend,
} from "chart.js";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import api from "../lib/api";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

const COLORS = [
    "#1976d2",
    "#43a047",
    "#fbc02d",
    "#e53935",
    "#8e24aa",
    "#00bcd4",
    "#ff7043",
    "#26c6da",
    "#ab47bc",
    "#66bb6a",
];

export default function Inicio() {
    const [rows, setRows] = useState([]);
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [typeId, setTypeId] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchData = async (params = {}) => {
        setLoading(true);
        try {
            const { data } = await api.get("/assets", { params: { q, status, type_id: typeId, ...params } });
            setRows(data.data || data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [q, status, typeId]);

    // Pie chart data (by type)
    const assetTypes = rows.reduce((acc, a) => {
        const type = a.type?.name || "Otro";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const pieData = {
        labels: Object.keys(assetTypes),
        datasets: [
            {
                data: Object.values(assetTypes),
                backgroundColor: COLORS,
                borderWidth: 2,
                borderColor: "#fff",
            },
        ],
    };

    // Bar chart data (by brand)
    const brands = rows.reduce((acc, a) => {
        const brand = a.brand || "Otro";
        acc[brand] = (acc[brand] || 0) + 1;
        return acc;
    }, {});

    const barData = {
        labels: Object.keys(brands),
        datasets: [
            {
                label: "Activos por Marca",
                data: Object.values(brands),
                backgroundColor: COLORS,
                borderRadius: 8,
                maxBarThickness: 36,
            },
        ],
    };

    // Group assets by user
    const users = {};
    rows.forEach((a) => {
        const user = a.current_assignment?.user?.name ?? "Sin asignar";
        if (!users[user]) users[user] = [];
        users[user].push(a);
    });

    // Helper for asset status color
    const statusColor = (status) => {
        if (!status) return "default";
        if (status === "Activo") return "success";
        if (status === "Inactivo") return "warning";
        return "info";
    };

    return (
        <Box
            sx={{
                maxWidth: "1400px",
                mx: "auto",
                p: { xs: 2, md: 4 },
                bgcolor: "linear-gradient(135deg, #1e293b 0%, #23272f 100%)",
                minHeight: "100vh",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "#fff",
                    borderRadius: 5,
                    boxShadow: 3,
                    p: { xs: 2, md: 5 },
                    mb: 5,
                    minHeight: 180,
                    background: "linear-gradient(90deg, gray 0%, gray 100%)",
                    color: "#fff",
                }}
            >
                <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar
                        src=""
                        alt="Logo"
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "#fff",
                            color: "#1976d2",
                            fontSize: 38,
                            fontWeight: 700,
                            border: "4px solid #fff",
                            boxShadow: 2,
                        }}
                    >
                        <span style={{ fontWeight: 900, fontSize: 36 }}>DA</span>
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight={900} color="#fff" gutterBottom>
                            Dashboard de Activos
                        </Typography>
                        <Typography variant="subtitle1" color="#e3f2fd">
                            Visualiza y gestiona tus activos de manera eficiente.
                        </Typography>
                    </Box>
                </Stack>
                <Box sx={{ minWidth: 320 }}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Buscar activo, marca, usuario..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 2,
                            boxShadow: 1,
                            minWidth: 260,
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Box>

            {/* Main Content */}
            <Grid container spacing={4}>
                {/* Charts */}
                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            borderRadius: 4,
                            boxShadow: 4,
                            minHeight: 340,
                            background: "linear-gradient(135deg, #1976d2 0%, #43a047 100%)",
                            color: "#fff",
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={700} color="#fff">
                                Distribución por Tipo
                            </Typography>
                            <Divider sx={{ mb: 2, borderColor: "#fff", opacity: 0.2 }} />
                            <Box sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Pie data={pieData} />
                            </Box>
                            <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {pieData.labels.map((label, i) => (
                                    <Chip
                                        key={label}
                                        label={`${label} (${pieData.datasets[0].data[i]})`}
                                        size="small"
                                        sx={{
                                            bgcolor: COLORS[i % COLORS.length],
                                            color: "#fff",
                                            fontWeight: 600,
                                        }}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 4, boxShadow: 4, minHeight: 340 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={700}>
                                Activos por Marca
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ height: 220 }}>
                                <Bar
                                    data={barData}
                                    options={{
                                        responsive: true,
                                        plugins: { legend: { display: false } },
                                        scales: {
                                            x: { grid: { display: false }, ticks: { font: { size: 13 } } },
                                            y: { beginAtZero: true, grid: { color: "#e0e0e0" } },
                                        },
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                 {/* Activos por Usuario */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 4, boxShadow: 4, mt: 2, p: 1 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={700}>
                                Activos por Usuario
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                {Object.entries(users).map(([user, assets]) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={user}>
                                        <Card
                                            sx={{
                                                bgcolor: user === "Sin asignar" ? "#fffbe6" : "#f5f5f5",
                                                borderRadius: 3,
                                                boxShadow: 2,
                                                p: 2.5,
                                                minHeight: 120,
                                                borderLeft: user === "Sin asignar" ? "6px solid #E9C16C" : "6px solid #1976d2",
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={700}
                                                gutterBottom
                                                sx={{
                                                    color: user === "Sin asignar" ? "#E9C16C" : "#1976d2",
                                                    opacity: user === "Sin asignar" ? 0.7 : 1,
                                                }}
                                            >
                                                {user === "Sin asignar" ? "— Sin asignar" : user}
                                            </Typography>
                                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                                {assets.map((a) => (
                                                    <li key={a.asset_tag} style={{ marginBottom: 4 }}>
                                                        <Typography variant="body2" component="span">
                                                            <b>{a.asset_tag}</b> - {a.type?.name} ({a.brand} {a.model})
                                                        </Typography>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Lista de Activos */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 4, boxShadow: 4, mt: 2, p: 1 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                                <Typography variant="h6" fontWeight={700}>
                                    Lista de Activos
                                </Typography>
                                {loading && <CircularProgress size={22} color="primary" />}
                                <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                                    Total: <b>{rows.length}</b>
                                </Typography>
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                {rows.length === 0 && !loading && (
                                    <Grid item xs={12}>
                                        <Typography color="text.secondary" align="center">
                                            No hay activos para mostrar.
                                        </Typography>
                                    </Grid>
                                )}
                                {rows.map((a) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={a.asset_tag}>
                                        <Fade in timeout={400}>
                                            <Card
                                                sx={{
                                                    bgcolor: "#f8fafc",
                                                    borderRadius: 3,
                                                    boxShadow: 2,
                                                    p: 2.5,
                                                    minHeight: 170,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 1,
                                                    borderLeft: `6px solid ${COLORS[Math.abs(a.asset_tag.charCodeAt(0)) % COLORS.length]}`,
                                                    transition: "transform 0.2s",
                                                    "&:hover": {
                                                        transform: "scale(1.04)",
                                                        boxShadow: 6,
                                                        borderLeftWidth: 10,
                                                    },
                                                }}
                                            >
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Tooltip title={a.type?.name || "Tipo"}>
                                                        <Avatar
                                                            sx={{
                                                                bgcolor: COLORS[Math.abs(a.asset_tag.charCodeAt(0)) % COLORS.length],
                                                                color: "#fff",
                                                                width: 36,
                                                                height: 36,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {a.type?.name?.[0] || "?"}
                                                        </Avatar>
                                                    </Tooltip>
                                                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                                                        {a.asset_tag}
                                                    </Typography>
                                                    <Chip
                                                        label={a.status || "Desconocido"}
                                                        size="small"
                                                        color={statusColor(a.status)}
                                                        sx={{ ml: "auto", fontWeight: 600 }}
                                                    />
                                                </Stack>
                                                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                                                    {a.type?.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {a.brand} {a.model}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    SN: {a.serial_number}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    Usuario:{" "}
                                                    <span style={{ color: a.current_assignment?.user ? "#1976d2" : "#E9C16C", opacity: a.current_assignment?.user ? 1 : 0.5 }}>
                                                        {a.current_assignment?.user?.name ?? "—"}
                                                    </span>
                                                </Typography>
                                            </Card>
                                        </Fade>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

               
                
            </Grid>
        </Box>
    );
}
