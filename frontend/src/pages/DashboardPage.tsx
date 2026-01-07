import { useState } from "react";
import * as XLSX from 'xlsx';
import { type DeviceFilters } from "../api/dashboard";
import { getDeviceStatusLabel, STATUS_OPTIONS_MAP } from "../utils/statusUtils";
import {
    useDashboardDevices,
    useBrandsList,
    useCategoriesList,
    useAttributesList,
    useModelsList
} from "../api/queries";

export default function DashboardPage() {
    const [exporting, setExporting] = useState(false);

    // Filters
    const [filters, setFilters] = useState<DeviceFilters>({
        brand_id: 0,
        model_id: 0,
        category_id: 0,
        status: "",
        room_number: 0,
        employee_id: 0,
        name: "",
        attribute_options: "",
        attribute_info: "",
    });

    // Data Fetching with React Query
    const { data: devices = [], isLoading: loading, isError, error } = useDashboardDevices(filters);
    const { data: brandsList = [] } = useBrandsList();
    const { data: categoriesList = [] } = useCategoriesList();
    const { data: attributesList = [] } = useAttributesList();
    const { data: modelsList = [] } = useModelsList(filters.brand_id || 0);

    // Create attribute map for display
    const attributeMap: Record<number, string> = {};
    attributesList.forEach(a => attributeMap[a.id] = a.name);

    const handleExport = async () => {
        if (exporting) return;
        setExporting(true);
        try {
            // Use current devices data for export if available, strictly it should probably refetch to ensure all match
            // But usually export mimics current view.

            // Note: If pagination is added later, this logic needs to change to fetch ALL.
            // For now, assuming devices contains all filtered results.

            // Prepare data for Excel
            // Match table columns EXACTLY: ID, ADY, ÝAGDAÝY, BREND, MODEL, KATEGORIÝA, BERKIDILEN, OTAG, AÝRATYNLYKLAR
            const rows = devices.map(d => {
                const attributesStr = d.attributes?.map(a => {
                    const name = a.Attribute ? a.Attribute.name : (attributeMap[a.attribute_id] || `#${a.attribute_id}`);
                    return `${name}: ${a.options || a.info}`;
                }).join("; ") || "-";

                return {
                    "ID": d.id,
                    "ADY": d.name,
                    "ÝAGDAÝY": getDeviceStatusLabel(d.status),
                    "BREND": d.brand?.name || "",
                    "MODEL": d.model?.name || "",
                    "KATEGORIÝA": d.category?.name || "",
                    "BERKIDILEN": d.employee_full_name || "-",
                    "OTAG": d.room_number || "-",
                    "AÝRATYNLYKLAR": attributesStr
                };
            });

            // Create workbook and worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);

            // Auto-width for columns
            const wscols = [
                { wch: 6 },  // ID
                { wch: 25 }, // ADY
                { wch: 15 }, // ÝAGDAÝY
                { wch: 15 }, // BREND
                { wch: 20 }, // MODEL
                { wch: 15 }, // KATEGORIÝA
                { wch: 25 }, // BERKIDILEN
                { wch: 10 }, // OTAG
                { wch: 50 }, // AÝRATYNLYKLAR
            ];
            ws['!cols'] = wscols;

            XLSX.utils.book_append_sheet(wb, ws, "Devices");

            // Write file
            XLSX.writeFile(wb, `devices_export_${new Date().toISOString().slice(0, 10)}.xlsx`);

        } catch (e) {
            console.error(e);
            alert("Eksport ýalňyşlygy");
        } finally {
            setExporting(false);
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
                        {STATUS_OPTIONS_MAP.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>

                    <input
                        type="number"
                        placeholder="Otag belgisi"
                        value={filters.room_number || ""}
                        onChange={e => setFilters({ ...filters, room_number: e.target.value ? Number(e.target.value) : undefined })}
                    />

                    <input
                        type="number"
                        placeholder="Işgär ID"
                        value={filters.employee_id || ""}
                        onChange={e => setFilters({ ...filters, employee_id: e.target.value ? Number(e.target.value) : undefined })}
                    />

                    <input
                        type="text"
                        placeholder="Enjamyň ady"
                        value={filters.name || ""}
                        onChange={e => setFilters({ ...filters, name: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Aýratynlyklar"
                        value={filters.attribute_options || ""}
                        onChange={e => setFilters({ ...filters, attribute_options: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="info"
                        value={filters.attribute_info || ""}
                        onChange={e => setFilters({ ...filters, attribute_info: e.target.value })}
                    />
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                    <button
                        onClick={() => { /* Invalidate query if needed, or just let auto-refetch happen? 
                                            Since filters transform state, it auto-refetches. 
                                            Button is redundant for fetch but useful for UX to "Apply" if we debounce.
                                            For now, let's just keep it for consistency or remove. 
                                            User might expect "Refresh". */
                        }}
                        className="btn btn-primary"
                    >
                        Filtrleri ulan
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className={`btn badge ${exporting ? "status-warning" : "status-success"}`}
                        style={{ fontSize: 14, cursor: exporting ? "wait" : "pointer" }}
                    >
                        {exporting ? "Eksport edilýär..." : "Excel-e eksport et"}
                    </button>
                </div>
            </div>

            {isError && (
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', marginBottom: 16 }}>
                    {error instanceof Error ? error.message : "Maglumat ýüklenende säwlik ýüze çykdy"}
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
                                {devices.map(d => {
                                    return (
                                        <tr key={d.id}>
                                            <td>{d.id}</td>
                                            <td style={{ fontWeight: 500 }}>{d.name}</td>
                                            <td>
                                                <span className={`badge ${d.status === 'in_stock' ? 'status-success' : 'status-warning'}`}>
                                                    {getDeviceStatusLabel(d.status)}
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
                                                                {attr.Attribute ? attr.Attribute.name : (attributeMap[attr.attribute_id] || `#${attr.attribute_id}`)}: {attr.options || attr.info}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : "-"}
                                            </td>
                                        </tr>
                                    )
                                })}
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
