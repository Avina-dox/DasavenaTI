// src/pages/activos/useAssets.js
import { useEffect, useMemo, useState } from "react";
import api from "../../lib/api";

export function useAssets() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [types, setTypes] = useState([]);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [typeId, setTypeId] = useState("");
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  // debounce
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const id = setTimeout(() => setQDebounced(q), 350);
    return () => clearTimeout(id);
  }, [q]);

  const fetchData = useMemo(
    () => async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await api.get("/assets", {
          params: {
            q: qDebounced || undefined,
            status: status || undefined,
            type_id: typeId || undefined,
            page,
            per_page: perPage,
          },
        });
        setRows(data.data || data);
        setMeta(data.meta || null);
      } finally {
        setLoading(false);
      }
    },
    [qDebounced, status, typeId, perPage]
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/asset-types");
        setTypes(data || []);
      } catch {
        setTypes([]);
      }
    })();
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);
  useEffect(() => { fetchData(1); }, [perPage]); // eslint-disable-line

  const pages = useMemo(() => {
    if (!meta) return [1];
    const total = meta.last_page, cur = meta.current_page;
    const arr = new Set([1, 2, cur - 1, cur, cur + 1, total - 1, total].filter(n => n >= 1 && n <= total));
    return Array.from(arr).sort((a, b) => a - b);
  }, [meta]);

  return {
    rows, meta, types, loading, pages,
    q, setQ, status, setStatus, typeId, setTypeId, perPage, setPerPage,
    fetchData,
  };
}
