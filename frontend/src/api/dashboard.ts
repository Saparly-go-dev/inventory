import { api } from "./client";
import type { Device } from "./devices";

export interface DashboardDevice extends Device {
    employee_full_name: string;
    room_number: number;
    attributes: {
        id: number;
        device_id: number;
        attribute_id: number;
        options: string;
        info: string;
        // Assuming backend returns fully populated Attribute object nested inside too?
        // Based on go struct: Attributes []models.DeviceAttribute `json:"attributes"`
        // And DeviceAttribute probably has Attribute relation preloaded?
        // "attributeStrings = append(attributeStrings, attr.Attribute.Name+": "+attr.Info)"
        Attribute?: {
            id: number;
            name: string;
        };
    }[];
}

export interface DeviceFilters {
    model_id?: number | null;
    category_id?: number | null;
    brand_id?: number | null;
    room_number?: number | null;
    employee_id?: number | null;
    status?: string | null;
    name?: string | null;
    attribute_options?: string | null;
    attribute_info?: string | null;
}

export async function getDashboardDevices(filters: DeviceFilters) {
    // Convert filters to query params
    // Note: Backend expects generic query params or specific ones?
    // Usually clean undefined/null values
    const params: Record<string, string | number> = {};

    if (filters.model_id) params.model_id = filters.model_id;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.brand_id) params.brand_id = filters.brand_id;
    if (filters.room_number) params.room_number = filters.room_number;
    if (filters.employee_id) params.employee_id = filters.employee_id;
    if (filters.status) params.status = filters.status;
    if (filters.name) params.name = filters.name;
    if (filters.attribute_options) params.attribute_options = filters.attribute_options;
    if (filters.attribute_info) params.attribute_info = filters.attribute_info;

    const res = await api.get<DashboardDevice[]>("/api/dashboard/devices", { params });
    return res.data;
}

export async function exportDashboardExcel(filters: DeviceFilters) {
    const params: Record<string, string | number> = {};

    if (filters.model_id) params.model_id = filters.model_id;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.brand_id) params.brand_id = filters.brand_id;
    if (filters.room_number) params.room_number = filters.room_number;
    if (filters.employee_id) params.employee_id = filters.employee_id;
    if (filters.status) params.status = filters.status;
    if (filters.name) params.name = filters.name;
    if (filters.attribute_options) params.attribute_options = filters.attribute_options;
    if (filters.attribute_info) params.info = filters.attribute_info;

    const res = await api.get("/api/dashboard/devices/export", {
        params,
        responseType: "blob", // Important for file download
    });
    return res.data;
}
