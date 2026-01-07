// src/api/categories.ts
import { api } from "./client";

export interface Category {
    id: number;
    name: string;
    description: string;
    info: string;
    icon: string;
    parent_id?: number | null;
    parent?: Category;
    created_at: string;
    updated_at: string;
}

export interface UpdateCategory {
    name: string;
    description: string;
    info: string;
    icon: string;
    parent_id?: number | null;
}

export interface CategoryPage {
    items: Category[];
    total: number;
    page: number;
    size: number;
    total_pages: number;
}

export interface SelectedObject {
    id: number;
    name: string;
}

export async function getCategoryPage(pageSize: number, pageNumber: number, name?: string) {
    const params: Record<string, string | number> = {
        page_size: pageSize,
        page_number: pageNumber,
    };
    if (name) {
        params.name = name;
    }
    const res = await api.get<CategoryPage>("/api/categories", { params });
    return res.data;
}

export async function createCategory(data: UpdateCategory) {
    const res = await api.post("/api/categories/", data);
    return res.data;
}

export async function updateCategory(id: number, data: UpdateCategory) {
    // Note: Backend seems to use query param for ID in PUT?
    // Handler: `id, err := strconv.Atoi(c.Query("id"))`
    const res = await api.put("/api/categories", data, {
        params: { id }
    });
    return res.data;
}

export async function deleteCategory(id: number) {
    const res = await api.delete("/api/categories", {
        params: { id }
    });
    return res.data;
}

export async function getCategoriesSelected(name?: string) {
    const params = name ? { name } : {};
    const res = await api.get<SelectedObject[]>("/api/categories/selected", {
        params,
    });
    return res.data;
}
