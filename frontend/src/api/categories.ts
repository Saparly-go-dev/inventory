// src/api/categories.ts
import { api } from "./client";

export interface Category {
    id: number;
    name: string;
    description: string;
    info: string;
    createdAt: string;
    updatedAt: string;
}

export interface SelectedObject {
    id: number;
    name: string;
}

export async function getCategoriesSelected(name?: string) {
    const params = name ? { name } : {};
    const res = await api.get<SelectedObject[]>("/api/categories/selected", {
        params,
    });
    return res.data;
}
