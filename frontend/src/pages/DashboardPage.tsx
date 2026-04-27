import { useEffect, useState } from "react";
import * as XLSX from 'xlsx';
import { type DeviceFilters } from "../api/dashboard";
import { getEmployeesSelected, type SelectedObject as EmployeeSelected } from "../api/employees";
import { returnDevice } from "../api/devices";
import { handleApiError } from "../api/client";
import { getDeviceStatusLabel, STATUS_OPTIONS_MAP } from "../utils/statusUtils";
import {
    useDashboardDevices,
    useBrandsList,
    useCategoriesList,
    useAttributesList,
    useModelsList
} from "../api/queries";
import { canExportDevices, canReturnDevices, canViewInventory } from "../utils/auth";
import SearchableSelect from "../components/SearchableSelect";

export default function DashboardPage() {
    const canView = canViewInventory();
    const canReturn = canReturnDevices();
    const canExport = canExportDevices();
    const [exporting, setExporting] = useState(false);
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [employeeOptions, setEmployeeOptions] = useState<EmployeeSelected[]>([]);
    const [returningDeviceId, setReturningDeviceId] = useState<number | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    // Filters
    const [filters, setFilters] = useState<DeviceFilters>({
        brand_id: 0,
        model_id: 0,
        category_id: 0,
        status: "",
        room_number: 0,
        floor_number: 0,
        employee_id: 0,
        name: "",
        attribute_options: "",
        attribute_info: "",
    });

    // Data Fetching with React Query
    const { data: devices = [], isLoading: loading, isError, error, refetch } = useDashboardDevices(filters, canView);
    const { data: brandsList = [] } = useBrandsList(canView);
    const { data: categoriesList = [] } = useCategoriesList(canView);
    const { data: attributesList = [] } = useAttributesList(canView);
    const { data: modelsList = [] } = useModelsList(filters.brand_id || 0, canView);

    // Create attribute map for display
    const attributeMap: Record<number, string> = {};
    attributesList.forEach(a => attributeMap[a.id] = a.name);

    useEffect(() => {
        let cancelled = false;
        const timer = window.setTimeout(async () => {
            try {
                if (!canView) return;
                const employees = await getEmployeesSelected(employeeSearch.trim());
                if (!cancelled) {
                    setEmployeeOptions(employees);
                }
            } catch (e) {
                if (!cancelled) {
                    setActionError(handleApiError(e));
                }
            }
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [canView, employeeSearch]);

    const handleExport = async () => {
        if (!canExport) return;
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

    const handleReturnDevice = async (deviceId: number, employeeId: number, employeeName: string) => {
        if (!canReturn) return;
        if (!employeeId || returningDeviceId !== null) return;

        const ok = window.confirm(`${employeeName || "Işgär"} üçin berkidilen enjamy aýyrmak isleýärsiňizmi?`);
        if (!ok) return;

        setReturningDeviceId(deviceId);
        setActionError(null);
        setActionSuccess(null);

        try {
            await returnDevice({ device_id: deviceId, employee_id: employeeId });
            setActionSuccess("Enjam işgärden aýryldy");
            await refetch();
        } catch (e) {
            setActionError(handleApiError(e));
        } finally {
            setReturningDeviceId(null);
        }
    };

    return (
        <div className="page-animate">
            {!canView ? (
                <div className="card">
                    <h2 style={{ marginBottom: 8 }}>Rugsat ýok</h2>
                    <p style={{ color: "var(--text-muted)" }}>Panel maglumatlaryny görmek üçin degişli rugsat gerek.</p>
                </div>
            ) : (
            <>
            <h2 style={{ marginBottom: 16 }}>Dolandyryş paneli</h2>

            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 12,
                    marginBottom: 16
                }}>
                    <SearchableSelect
                        value={filters.brand_id || 0}
                        onChange={(value) => setFilters({ ...filters, brand_id: Number(value), model_id: 0 })}
                        options={brandsList.map((b) => ({ value: b.id, label: b.name }))}
                        emptyOptionLabel="Ähli Brendler"
                        emptyOptionValue={0}
                        searchPlaceholder="Brend ady boýunça filter..."
                    />

                    <SearchableSelect
                        value={filters.model_id || 0}
                        onChange={(value) => setFilters({ ...filters, model_id: Number(value) })}
                        options={modelsList.map((m) => ({ value: m.id, label: m.name }))}
                        emptyOptionLabel="Ähli Modeller"
                        emptyOptionValue={0}
                        disabled={!filters.brand_id}
                        searchPlaceholder="Model ady boýunça filter..."
                    />

                    <SearchableSelect
                        value={filters.category_id || 0}
                        onChange={(value) => setFilters({ ...filters, category_id: Number(value) })}
                        options={categoriesList.map((c) => ({ value: c.id, label: c.name }))}
                        emptyOptionLabel="Ähli Kategoriýalar"
                        emptyOptionValue={0}
                        searchPlaceholder="Kategoriýa ady boýunça filter..."
                    />

                    <SearchableSelect
                        value={filters.status || ""}
                        onChange={(value) => setFilters({ ...filters, status: value })}
                        options={STATUS_OPTIONS_MAP.map((s) => ({ value: s.value, label: s.label }))}
                        emptyOptionLabel="Ähli Ýagdaýlar"
                        searchPlaceholder="Ýagdaý ady boýunça filter..."
                    />

                    <input
                        type="number"
                        placeholder="Otag belgisi"
                        value={filters.room_number || ""}
                        onChange={e => setFilters({ ...filters, room_number: e.target.value ? Number(e.target.value) : undefined })}
                    />

                    <input
                        type="number"
                        min={0}
                        placeholder="Gat"
                        value={filters.floor_number || ""}
                        onChange={e => setFilters({ ...filters, floor_number: e.target.value ? Number(e.target.value) : undefined })}
                    />

                    <input
                        type="text"
                        placeholder="Işgär ady/familiýasy"
                        value={employeeSearch}
                        onChange={e => {
                            setEmployeeSearch(e.target.value);
                            setFilters({ ...filters, employee_id: undefined });
                        }}
                    />

                    <SearchableSelect
                        value={filters.employee_id || 0}
                        onChange={(value) => setFilters({ ...filters, employee_id: value ? Number(value) : undefined })}
                        options={employeeOptions.map((emp) => ({ value: emp.id, label: emp.name }))}
                        emptyOptionLabel="Ähli işgärler"
                        emptyOptionValue={0}
                        searchPlaceholder="Işgär ady boýunça filter..."
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
                    {canExport && (
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className={`btn badge ${exporting ? "status-warning" : "status-success"}`}
                            style={{ fontSize: 14, cursor: exporting ? "wait" : "pointer" }}
                        >
                            {exporting ? "Eksport edilýär..." : "Excel-e eksport et"}
                        </button>
                    )}
                </div>
            </div>

            {actionSuccess && (
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', marginBottom: 16 }}>
                    {actionSuccess}
                </div>
            )}

            {actionError && (
                <div style={{ padding: 12, borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', marginBottom: 16 }}>
                    {actionError}
                </div>
            )}

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
                                    {canReturn && <th>Hereketler</th>}
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
                                            {canReturn && (
                                            <td>
                                                {d.employee_id ? (
                                                    <button
                                                        onClick={() => handleReturnDevice(d.id, d.employee_id, d.employee_full_name)}
                                                        disabled={returningDeviceId === d.id}
                                                        className="btn"
                                                        style={{
                                                            padding: '4px 8px',
                                                            fontSize: 12,
                                                            color: 'var(--danger)',
                                                            border: '1px solid rgba(239, 68, 68, 0.3)',
                                                            background: 'rgba(239, 68, 68, 0.08)',
                                                        }}
                                                    >
                                                        {returningDeviceId === d.id ? "Aýrylýar..." : "Aýyr"}
                                                    </button>
                                                ) : "-"}
                                            </td>
                                            )}
                                        </tr>
                                    )
                                })}
                                {devices.length === 0 && (
                                    <tr>
                                        <td colSpan={canReturn ? 10 : 9} style={{ padding: 32, textAlign: "center", color: 'var(--text-muted)' }}>
                                            Maglumat tapylmady.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    );
}
