
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeWithDevices, type Employee } from "../api/employees";
import { getAttributesSelected } from "../api/attributes";
import { getDeviceStatusLabel } from "../utils/statusUtils";
import { handleApiError } from "../api/client";

export default function EmployeeDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [devices, setDevices] = useState<any[]>([]); // Using any for now, ideally strictly typed
    const [attributeMap, setAttributeMap] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        async function load() {
            setLoading(true);
            try {
                // Fetch employee details with devices in one go
                const data = await getEmployeeWithDevices(Number(id));

                // Fetch attributes for name resolution
                const attrs = await getAttributesSelected();
                const attrMap: Record<number, string> = {};
                attrs.forEach(a => attrMap[a.id] = a.name);
                setAttributeMap(attrMap);

                setEmployee(data);
                setDevices(data.devices || []);
            } catch (e) {
                setError(handleApiError(e));
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    if (loading) return <div className="page-animate p-4">Maglumatlar ýüklenýär...</div>;

    if (error) return (
        <div className="page-animate p-4">
            <div style={{ color: 'var(--danger)', marginBottom: 16 }}>{error}</div>
            <button onClick={() => navigate(-1)} className="btn btn-secondary">Yza</button>
        </div>
    );

    if (!employee) return (
        <div className="page-animate p-4">
            <div>Işgär tapylmady</div>
            <button onClick={() => navigate(-1)} className="btn btn-secondary mt-4">Yza</button>
        </div>
    );

    return (
        <div className="page-animate">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <button onClick={() => navigate(-1)} className="btn btn-secondary">
                    ← Yza
                </button>
                <h2>Işgär barada maglumat</h2>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                    <div>
                        <div className="text-sm text-muted">Doly ady</div>
                        <div style={{ fontSize: 18, fontWeight: 600 }}>{employee.full_name}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted">Wezipe</div>
                        <div style={{ fontSize: 16 }}>{employee.position || '-'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted">Bölüm</div>
                        <div style={{ fontSize: 16 }}>{employee.department || '-'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted">Otag</div>
                        <div style={{ fontSize: 16 }}>{employee.room_number || '-'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted">Email</div>
                        <div style={{ fontSize: 16 }}>{employee.email || '-'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted">Telefon</div>
                        <div style={{ fontSize: 16 }}>{employee.phone || '-'}</div>
                    </div>
                </div>
            </div>

            <h3 style={{ marginBottom: 16 }}>Berkidilen enjamlar ({devices.length})</h3>

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
                                <th>Otag</th>
                                <th>Aýratynlyklar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map((d: any) => {
                                return (
                                    <tr key={d.id}>
                                        <td>{d.id}</td>
                                        <td style={{ fontWeight: 500 }}>{d.name}</td>
                                        <td>
                                            <span className={`badge ${d.status === 'assigned' ? 'status-success' : 'status-warning'}`}>
                                                {getDeviceStatusLabel(d.status)}
                                            </span>
                                        </td>
                                        <td>{d.brand?.name}</td>
                                        <td>{d.model?.name}</td>
                                        <td>{d.category?.name}</td>
                                        <td>{d.room_number || "-"}</td>
                                        <td>
                                            {d.attributes && d.attributes.length > 0 ? (
                                                <div style={{ fontSize: 13, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {d.attributes.map((attr: any) => (
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
                                    <td colSpan={8} style={{ padding: 32, textAlign: "center", color: 'var(--text-muted)' }}>
                                        Berkidilen enjam ýok.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
