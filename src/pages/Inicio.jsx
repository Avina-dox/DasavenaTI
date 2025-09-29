import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { useEffect, useState } from "react";
import api from "../lib/api";
import { Link } from "react-router-dom";

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

    // Datos para la gráfica de pastel (por tipo)
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
                backgroundColor: ["#1976d2", "#43a047", "#fbc02d", "#e53935"],
                borderWidth: 1,
            },
        ],
    };

    // Datos para la gráfica de barras (por marca)
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
            },
        ],
    };

    return (
        <Box sx={{ p: 4, bgcolor: "", minHeight: "100vh" }}>
            <Typography variant="h4" gutterBottom fontWeight={700}>
                Dashboard de Activos
            </Typography>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Distribución por Tipo
                            </Typography>
                            <Pie data={pieData} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Activos por Marca
                            </Typography>
                            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Lista de Activos
                            </Typography>
                            <Grid container spacing={2}>
                                {rows.map((a) => (
                                    <Grid item xs={12} md={4} key={a.asset_tag}>
                                        <Card
                                            sx={{
                                                bgcolor: "#fff",
                                                borderRadius: 2,
                                                boxShadow: 2,
                                                p: 2,
                                                transition: "transform 0.2s",
                                                "&:hover": { transform: "scale(1.03)", boxShadow: 6 },
                                            }}
                                        >
                                            <Typography variant="subtitle2" color="text.secondary">
                                                {a.asset_tag}
                                            </Typography>
                                            <Typography variant="h6" fontWeight={600}>
                                                {a.type?.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {a.brand} {a.model}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                SN: {a.serial_number}
                                            </Typography>
                                        </Card>
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
