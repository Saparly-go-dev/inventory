import type { NameCount, RecentAssignment, StatisticsData, StatusCount } from "../api/statistics";
import "./DashboardCharts.css";

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
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f97316",
    "#6366f1",
    "#14b8a6",
    "#e11d48",
];

function formatDate(iso: string) {
    const d = new Date(iso);
    return (
        d.toLocaleDateString("tk-TM", { day: "2-digit", month: "2-digit", year: "numeric" }) +
        " " +
        d.toLocaleTimeString("tk-TM", { hour: "2-digit", minute: "2-digit" })
    );
}

function EmptyState({ text = "Maglumat ýok" }: { text?: string }) {
    return <p className="chart-empty">{text}</p>;
}

function SummaryCard({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: "devices" | "furnitures" | "employees" | "brands" | "categories";
}) {
    return (
        <div className="stat-card">
            <div className={`stat-icon ${tone}`}>
                <StatIcon name={tone} />
            </div>
            <div className="stat-info">
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </div>
    );
}

function DonutChart({ data }: { data: StatusCount[] }) {
    const total = data.reduce((acc, d) => acc + d.count, 0);
    if (total === 0) return <EmptyState />;

    const radius = 70;
    const cx = 90;
    const cy = 90;
    const circumference = 2 * Math.PI * radius;

    const slices = data.reduce<Array<StatusCount & { pct: number; offset: number }>>((items, d) => {
        const offset = items.reduce((sum, item) => sum + item.pct, 0);
        const pct = d.count / total;
        return [...items, { ...d, pct, offset }];
    }, []);

    return (
        <div className="pie-chart-container">
            <svg className="pie-svg" viewBox="0 0 180 180" role="img" aria-label="Device status chart">
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
                        />
                    );
                })}
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
                        <span
                            className="legend-dot"
                            style={{ background: STATUS_COLORS[s.status] || BAR_COLORS[i % BAR_COLORS.length] }}
                        />
                        <span>{STATUS_LABELS[s.status] || s.status}</span>
                        <span className="legend-count">{s.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function BarChart({ data, colors }: { data: NameCount[]; colors?: string[] }) {
    const max = Math.max(...data.map((d) => d.count), 1);
    const palette = colors || BAR_COLORS;

    if (data.length === 0) return <EmptyState />;

    return (
        <div className="bar-chart">
            {data.map((d, i) => {
                const pct = Math.max((d.count / max) * 100, 6);
                const color = palette[i % palette.length];
                return (
                    <div className="bar-row" key={`${d.name}-${i}`}>
                        <span className="bar-label" title={d.name}>
                            {d.name || "-"}
                        </span>
                        <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${pct}%`, background: color }}>
                                <span className="bar-value">{d.count}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function RecentAssignments({ data }: { data: RecentAssignment[] }) {
    if (data.length === 0) return <EmptyState text="Berkitme ýok" />;

    return (
        <div className="recent-table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Enjam</th>
                        <th>Işgär</th>
                        <th>Sene</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((a, i) => (
                        <tr key={`${a.device_name}-${a.assigned_at}-${i}`}>
                            <td>{a.device_name || "-"}</td>
                            <td>{a.employee_name || "-"}</td>
                            <td>{formatDate(a.assigned_at)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function DashboardCharts({ data }: { data: StatisticsData }) {
    return (
        <section className="dashboard-charts" aria-label="Dashboard statistics">
            <div className="stats-summary">
                <SummaryCard label="Enjamlar" value={data.total_devices} tone="devices" />
                <SummaryCard label="Mebeller" value={data.total_furnitures} tone="furnitures" />
                <SummaryCard label="Işgärler" value={data.total_employees} tone="employees" />
                <SummaryCard label="Brendler" value={data.total_brands} tone="brands" />
                <SummaryCard label="Kategoriýalar" value={data.total_categories} tone="categories" />
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h4>Enjamlar - ýagdaý boýunça</h4>
                    <DonutChart data={data.devices_by_status || []} />
                </div>

                <div className="chart-card">
                    <h4>Enjamlar - kategoriýa boýunça</h4>
                    <BarChart data={data.devices_by_category || []} />
                </div>

                <div className="chart-card">
                    <h4>Enjamlar - brend boýunça</h4>
                    <BarChart data={data.devices_by_brand || []} colors={["#8b5cf6", "#6366f1", "#0ea5e9", "#22c55e"]} />
                </div>

                <div className="chart-card">
                    <h4>Işgärler - enjam sany boýunça</h4>
                    <BarChart data={data.top_employees_by_devices || []} colors={["#0f766e", "#059669", "#16a34a", "#65a30d"]} />
                </div>

                <div className="chart-card">
                    <h4>Işgärler - mebel sany boýunça</h4>
                    <BarChart data={data.top_employees_by_furnitures || []} colors={["#b45309", "#d97706", "#f59e0b", "#fbbf24"]} />
                </div>

                <div className="chart-card">
                    <h4>Otaglar - mebel sany boýunça</h4>
                    <BarChart
                        data={(data.top_rooms_by_furnitures || []).map((item) => ({ ...item, name: `Otag #${item.name}` }))}
                        colors={["#7c3aed", "#8b5cf6", "#a855f7", "#c084fc"]}
                    />
                </div>
            </div>

            <div className="recent-section">
                <h4>Soňky berkitmeler</h4>
                <RecentAssignments data={data.recent_assignments || []} />
            </div>
        </section>
    );
}

function StatIcon({ name }: { name: "devices" | "furnitures" | "employees" | "brands" | "categories" }) {
    if (name === "devices") {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        );
    }

    if (name === "furnitures") {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 11V9a4 4 0 0 1 8 0v2" />
                <path d="M12 11V9a4 4 0 0 1 8 0v2" />
                <path d="M3 11h18v6H3z" />
                <path d="M5 17v3" />
                <path d="M19 17v3" />
            </svg>
        );
    }

    if (name === "employees") {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        );
    }

    if (name === "brands") {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
        );
    }

    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    );
}
