import { useDashboardStatistics } from "../api/queries";
import DashboardCharts from "../components/DashboardCharts";
import { canViewStatistics } from "../utils/auth";

export default function StatisticsPage() {
    const canView = canViewStatistics();
    const { data, isLoading, isError, error } = useDashboardStatistics(canView);

    if (!canView) {
        return (
            <div className="card">
                <h2 style={{ marginBottom: 8 }}>Rugsat ýok</h2>
                <p style={{ color: "var(--text-muted)" }}>Statistikany görmek üçin degişli rugsat gerek.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="stats-loading">
                <div className="spinner" />
                Ýüklenýär...
            </div>
        );
    }

    if (isError) {
        return <div className="stats-error">Ýalňyşlyk: {(error as Error).message}</div>;
    }

    if (!data) return null;

    return (
        <div className="statistics-page">
            <DashboardCharts data={data} />
        </div>
    );
}
