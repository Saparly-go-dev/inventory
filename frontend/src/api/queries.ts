import { useQuery } from "@tanstack/react-query";
import { getDashboardDevices, type DeviceFilters } from "./dashboard";
import { getBrandsSelected } from "./brands";
import { getCategoriesSelected } from "./categories";
import { getModelsSelected } from "./models";
import { getAttributesSelected } from "./attributes";

export const QUERY_KEYS = {
    dashboard: "dashboard",
    brands: "brands",
    categories: "categories",
    models: "models",
    attributes: "attributes",
    employees: "employees",
    devices: "devices",
};

export function useDashboardDevices(filters: DeviceFilters) {
    return useQuery({
        queryKey: [QUERY_KEYS.dashboard, filters],
        queryFn: () => getDashboardDevices(filters),
    });
}

export function useBrandsList() {
    return useQuery({
        queryKey: [QUERY_KEYS.brands],
        queryFn: () => getBrandsSelected(),
    });
}

export function useCategoriesList() {
    return useQuery({
        queryKey: [QUERY_KEYS.categories],
        queryFn: () => getCategoriesSelected(),
    });
}

export function useAttributesList() {
    return useQuery({
        queryKey: [QUERY_KEYS.attributes],
        queryFn: () => getAttributesSelected(),
    });
}

export function useModelsList(brandId: number) {
    return useQuery({
        queryKey: [QUERY_KEYS.models, brandId],
        queryFn: () => getModelsSelected(brandId),
        enabled: !!brandId, // Only fetch if brandId is present
    });
}
