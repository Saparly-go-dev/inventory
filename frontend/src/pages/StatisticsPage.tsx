import { useQuery } from "@tanstack/react-query";
import { getStatistics } from "../api/statistics";
import type { NameCount, StatusCount } from "../api/statistics";
import "./StatisticsPage.css";

// ─── Color palettes ───
const STATUS_COLORS: Record<string, string> = {
    in_stock: "#3b82f6",
    assigned: "#10b981",
    repair: "#f59e0b",
    written_off: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
    in_stock: "Ammarda",
    assigned: "Berilen",
    repair: "Abatlaýyşda",
    written_off: "Hasapdan öçürilen",
};

const BAR_COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
    "#f97316", "#6366f1", "#14b8a6", "#e11d48",
];

// ─── Pie Chart (SVG donut) ───
function PieChart({ data }: { data: StatusCount[] }) {
    const total = data.reduce((acc, d) => acc + d.count, 0);
    if (total === 0) {
        return <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Maglumat ýok</p>;
    }

    const radius = 70;
    const cx = 90;
    const cy = 90;
    const circumference = 2 * Math.PI * radius;

    let accumulated = 0;
    const slices = data.map((d) => {
        const pct = d.count / total;
        const offset = accumulated;
        accumulated += pct;
        return { ...d, pct, offset };
    });

    return (
        <div className="pie-chart-container">
            <svg className="pie-svg" viewBox="0 0 180 180">
                {slices.map((s, i) => {
                    const dashArray = `${s.pct * circumference} ${circumference}`;
                    const rotation = s.offset * 360 - 90;
                    const color = STATUS_COLORS[s.status] || BAR_COLORS[i % BAR_COLORS.length];
                    return (
                        <circle
                            key={s.status}
                            cx={cx}
                            cy={cy}
                            r={radius}
                            fill="none"
                            stroke={color}
                            strokeWidth="24"
                            strokeDasharray={dashArray}
                            strokeDashoffset="0"
                            transform={`rotate(${rotation} ${cx} ${cy})`}
                            style={{ transition: "stroke-dasharray 0.8s ease" }}
                        />
                    );
                })}
                {/* center text */}
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text-main)">
                    {total}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="var(--text-muted)">
                    Jemi
                </text>
            </svg>

            <div className="pie-legend">
                {slices.map((s, i) => (
                    <div className="legend-item" key={s.status}>
                        <span className="legend-dot" style={{ background: STATUS_COLORS[s.status] || BAR_COLORS[i % BAR_COLORS.length] }} />
                        <span>{STATUS_LABELS[s.status] || s.status}</span>
                        <span className="legend-count">{s.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Bar Chart (CSS) ───
function BarChart({ data, colors }: { data: NameCount[]; colors?: string[] }) {
    const max = Math.max(...data.map((d) => d.count), 1);
    const palette = colors || BAR_COLORS;

    return (
        <div className="bar-chart">
            {data.map((d, i) => {
                const pct = Math.max((d.count / max) * 100, 6);
                const color = palette[i % palette.length];
                return (
                    <div className="bar-row" key={d.name || i}>
                        <span className="bar-label" title={d.name}>{d.name || "—"}</span>
                        <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                                <span className="bar-value">{d.count}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            {data.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Maglumat ýok</p>}
        </div>
    );
}

// ─── Main Page ───
export default function StatisticsPage() {
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["statistics"],
        queryFn: getStatistics,
    });

    if (isLoading) {
        return (
            <div className="stats-loading">
                <div className="spinner" />
                Ýüklenýär…
            </div>
        );
    }

    if (isError) {
        return <div className="stats-error">Ýalňyşlyk: {(error as Error).message}</div>;
    }

    if (!data) return null;

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("tk-TM", { day: "2-digit", month: "2-digit", year: "numeric" }) +
            " " + d.toLocaleTimeString("tk-TM", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="statistics-page">
            {/* Summary Cards */}
            <div className="stats-summary">
                <div className="stat-card">
                    <div className="stat-icon devices">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    </div>
                    <div className="stat-info">
                        <h3>{data.total_devices}</h3>
                        <p>Enjamlar</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon employees">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div className="stat-info">
                        <h3>{data.total_employees}</h3>
                        <p>Işgärler</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon brands">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
                    </div>
                    <div className="stat-info">
                        <h3>{data.total_brands}</h3>
                        <p>Brendler</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon categories">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                    </div>
                    <div className="stat-info">
                        <h3>{data.total_categories}</h3>
                        <p>Kategoriýalar</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h4>Enjamlar — Status boýunça</h4>
                    <PieChart data={data.devices_by_status || []} />
                </div>

                <div className="chart-card">
                    <h4>Enjamlar — Kategoriýa boýunça</h4>
                    <BarChart data={data.devices_by_category || []} />
                </div>

                <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
                    <h4>Enjamlar — Brend boýunça</h4>
                    <BarChart data={data.devices_by_brand || []} colors={["#8b5cf6", "#6366f1", "#a78bfa", "#7c3aed", "#818cf8", "#c084fc", "#4f46e5", "#7e22ce"]} />
                </div>
            </div>

            {/* Recent Assignments */}
            <div className="recent-section">
                <h4>Soňky berkitmeler</h4>
                {data.recent_assignments && data.recent_assignments.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Enjam</th>
                                <th>Işgär</th>
                                <th>Sene</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recent_assignments.map((a, i) => (
                                <tr key={i}>
                                    <td>{a.device_name}</td>
                                    <td>{a.employee_name}</td>
                                    <td>{formatDate(a.assigned_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>Berkitme ýok</p>
                )}
            </div>
        </div>
    );
}
