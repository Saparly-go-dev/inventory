// src/pages/DashboardPage.tsx
import { useEffect, useState } from "react";
import { getDashboardDevices, exportDashboardExcel, type DashboardDevice, type DeviceFilters } from "../api/dashboard";
import { getBrandsSelected, type SelectedObject } from "../api/brands";
import { getModelsSelected } from "../api/models";
import { getCategoriesSelected } from "../api/categories";
import { handleApiError } from "../api/client";

const STATUS_OPTIONS = ["in_stock", "assigned", "repair", "written_off"];

export default function DashboardPage() {
    const [devices, setDevices] = useState<DashboardDevice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [filters, setFilters] = useState<DeviceFilters>({
        brand_id: 0,
        model_id: 0,
        category_id: 0,
        status: "",
        room_number: 0,
        employee_id: 0,
    });

    // Dropdown lists
    const [brandsList, setBrandsList] = useState<SelectedObject[]>([]);
    const [modelsList, setModelsList] = useState<SelectedObject[]>([]);
    const [categoriesList, setCategoriesList] = useState<SelectedObject[]>([]);

    useEffect(() => {
        Promise.all([
            getBrandsSelected(),
            getCategoriesSelected(),
        ]).then(([brands, categories]) => {
            setBrandsList(brands);
            setCategoriesList(categories);
        }).catch(console.error);
    }, []);

    useEffect(() => {
        setModelsList([]);
        if (filters.brand_id) {
            getModelsSelected(filters.brand_id)
                .then(setModelsList)
                .catch(console.error);
        }
    }, [filters.brand_id]);

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const apiFilters: DeviceFilters = {
                ...filters,
                brand_id: filters.brand_id || undefined,
                model_id: filters.model_id || undefined,
                category_id: filters.category_id || undefined,
                status: filters.status || undefined,
                room_number: filters.room_number || undefined,
                employee_id: filters.employee_id || undefined,
            };

            const data = await getDashboardDevices(apiFilters);
            setDevices(data);
        } catch (e) {
            setError(handleApiError(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const handleExport = async () => {
        try {
            const apiFilters: DeviceFilters = {
                ...filters,
                brand_id: filters.brand_id || undefined,
                model_id: filters.model_id || undefined,
                category_id: filters.category_id || undefined,
                status: filters.status || undefined,
                room_number: filters.room_number || undefined,
                employee_id: filters.employee_id || undefined,
            };
            const blob = await exportDashboardExcel(apiFilters);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `devices_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (e) {
            setError(handleApiError(e));
        }
    };

    return (
        <div className="page-animate">
            <h2 style={{ marginBottom: 16 }}>Dolandyryş paneli</h2>

            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                    marginBottom: 16
                }}>
                    <select
                        value={filters.brand_id || 0}
                        onChange={e => setFilters({ ...filters, brand_id: Number(e.target.value), model_id: 0 })}
                    >
                        <option value={0}>Ähli Brendler</option>
                        {brandsList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>

                    <select
                        value={filters.model_id || 0}
                        onChange={e => setFilters({ ...filters, model_id: Number(e.target.value) })}
                        disabled={!filters.brand_id}
                    >
                        <option value={0}>Ähli Modeller</option>
                        {modelsList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>

                    <select
                        value={filters.category_id || 0}
                        onChange={e => setFilters({ ...filters, category_id: Number(e.target.value) })}
                    >
                        <option value={0}>Ähli Kategoriýalar</option>
                        {categoriesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <select
                        value={filters.status || ""}
                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="">Ähli Ýagdaýlar</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <input
                        type="number"
                        placeholder="Otag belgisi"
                        value={filters.room_number || ""}
                        onChange={e => setFilters({ ...form.room_number, room_number: e.target.value ? Number(e.target.value) : undefined })}
                    />

                    <input
                        type="number"
                        placeholder="Işgär ID"
                        value={filters.employee_id || ""}
                        onChange={e => setFilters({ ...filters, employee_id: e.target.value ? Number(e.target.value) : undefined })}
                    />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => loadData()} className="btn btn-primary">
                        Filtrleri ulan
                    </button>
                    <button onClick={handleExport} className="btn badge status-success" style={{ fontSize: 14 }}>
                        Excel-e eksport et
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', marginBottom: 16 }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div style={{ color: 'var(--text-muted)' }}>Maglumatlar ýüklenýär...</div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Ady</th>
                                    <th>Ýagdaýy</th>
                                    <th>Brend</th>
                                    <th>Model</th>
                                    <th>Kategoriýa</th>
                                    <th>Berkidilen</th>
                                    <th>Otag</th>
                                    <th>Aýratynlyklar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map(d => (
                                    <tr key={d.id}>
                                        <td>{d.id}</td>
                                        <td style={{ fontWeight: 500 }}>{d.name}</td>
                                        <td>
                                            <span className={`badge ${d.status === 'in_stock' ? 'status-success' : 'status-warning'}`}>
                                                {d.status}
                                            </span>
                                        </td>
                                        <td>{d.brand?.name}</td>
                                        <td>{d.model?.name}</td>
                                        <td>{d.category?.name}</td>
                                        <td>{d.employee_full_name || "-"}</td>
                                        <td>{d.room_number || "-"}</td>
                                        <td>
                                            {d.attributes && d.attributes.length > 0 ? (
                                                <div style={{ fontSize: 13, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {d.attributes.map(attr => (
                                                        <span key={attr.id} className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                                                            {attr.Attribute ? attr.Attribute.name : `#${attr.attribute_id}`}: {attr.info}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : "-"}
                                        </td>
                                    </tr>
                                ))}
                                {devices.length === 0 && (
                                    <tr>
                                        <td colSpan={9} style={{ padding: 32, textAlign: "center", color: 'var(--text-muted)' }}>
                                            Maglumat tapylmady.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
