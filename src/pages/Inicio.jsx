import { Card, CardContent, Typography, Grid, Box, Divider, Avatar, Stack } from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import api from "../lib/api";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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
                backgroundColor: ["#1976d2", "#43a047", "#fbc02d", "#e53935", "#8e24aa", "#00bcd4"],
                borderWidth: 1,
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
                backgroundColor: "#1976d2",
                borderRadius: 6,
                maxBarThickness: 32,
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

    return (
        <Box sx={{ maxWidth: "1200px", mx: "auto", p: { xs: 2, md: 4 }, bgcolor: "white",  minHeight: "100vh" }}>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    borderRadius: 4,
                    boxShadow: 2,
                    p: { xs: 2, md: 6 },
                    mb: 4,
                    minHeight: 180,
                }}
            >
                <Stack direction="row" spacing={3} alignItems="center">
                    <Avatar
                        src=""
                        alt="Logo"
                        sx={{ width: 72, height: 72, bgcolor: "#1976d2", fontSize: 32, fontWeight: 700 }}
                    >
                        {/* Logo */}
                    </Avatar>
                    <Box>
                        <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
                            Dashboard de Activos
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Visualiza y gestiona tus activos de manera eficiente.
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <Grid container spacing={4}>
                

                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Lista de Activos
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                {rows.map((a) => (
                                    <Grid item xs={12} sm={6} md={4} key={a.asset_tag}>
                                        <Card
                                            sx={{
                                                bgcolor: "#f8fafc",
                                                borderRadius: 2,
                                                boxShadow: 1,
                                                p: 2,
                                                transition: "transform 0.2s",
                                                "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
                                            }}
                                        >
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {a.asset_tag}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
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
                                                {a.current_assignment?.user?.name ?? (
                                                    <span style={{ color: "#E9C16C", opacity: 0.4 }}>—</span>
                                                )}
                                            </Typography>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Activos por Usuario
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                {Object.entries(users).map(([user, assets]) => (
                                    <Grid item xs={12} sm={6} md={4} key={user}>
                                        <Card sx={{ bgcolor: "#f5f5f5", borderRadius: 2, boxShadow: 1, p: 2 }}>
                                               
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={600}
                                                gutterBottom
                                                sx={{ color: user === "Sin asignar" ? "#E9C16C" : "inherit", opacity: user === "Sin asignar" ? 0.6 : 1 }}
                                            >
                                                {user === "Sin asignar" ? "—" : user}
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
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3, minHeight: 320 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Distribución por Tipo
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Pie data={pieData} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3, minHeight: 320 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight={600}>
                                Activos por Marca
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Bar
                                data={barData}
                                options={{
                                    responsive: true,
                                    plugins: { legend: { display: false } },
                                    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
                                }}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
