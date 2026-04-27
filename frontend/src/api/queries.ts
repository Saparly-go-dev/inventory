import { useQuery } from "@tanstack/react-query";
import { getDashboardDevices, type DeviceFilters } from "./dashboard";
import { getBrandsSelected } from "./brands";
import { getCategoriesSelected } from "./categories";
import { getModelsSelected } from "./models";
import { getAttributesSelected } from "./attributes";
import { getStatistics } from "./statistics";

export const QUERY_KEYS = {
    dashboard: "dashboard",
    brands: "brands",
    categories: "categories",
    models: "models",
    attributes: "attributes",
    employees: "employees",
    devices: "devices",
};

export function useDashboardDevices(filters: DeviceFilters, enabled = true) {
    return useQuery({
        queryKey: [QUERY_KEYS.dashboard, filters],
        queryFn: () => getDashboardDevices(filters),
        enabled,
    });
}

export function useDashboardStatistics(enabled = true) {
    return useQuery({
        queryKey: [QUERY_KEYS.dashboard, "statistics"],
        queryFn: getStatistics,
        enabled,
    });
}

export function useBrandsList(enabled = true) {
    return useQuery({
        queryKey: [QUERY_KEYS.brands],
        queryFn: () => getBrandsSelected(),
        enabled,
    });
}

export function useCategoriesList(enabled = true) {
    return useQuery({
        queryKey: [QUERY_KEYS.categories],
        queryFn: () => getCategoriesSelected(),
        enabled,
    });
}

export function useAttributesList(enabled = true) {
    return useQuery({
        queryKey: [QUERY_KEYS.attributes],
        queryFn: () => getAttributesSelected(),
        enabled,
    });
}

export function useModelsList(brandId: number, enabled = true) {
    return useQuery({
        queryKey: [QUERY_KEYS.models, brandId],
        queryFn: () => getModelsSelected(brandId),
        enabled: enabled && !!brandId, // Only fetch if brandId is present
    });
}
