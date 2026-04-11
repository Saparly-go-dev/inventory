import { api } from "./client";

export interface StatusCount {
    status: string;
    count: number;
}

export interface NameCount {
    name: string;
    count: number;
}

export interface RecentAssignment {
    device_name: string;
    employee_name: string;
    assigned_at: string;
}

export interface StatisticsData {
    total_devices: number;
    total_employees: number;
    total_brands: number;
    total_categories: number;
    devices_by_status: StatusCount[];
    devices_by_category: NameCount[];
    devices_by_brand: NameCount[];
    recent_assignments: RecentAssignment[];
}

export async function getStatistics(): Promise<StatisticsData> {
    const res = await api.get<StatisticsData>("/api/dashboard/statistics");
    return res.data;
}
