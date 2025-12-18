// src/api/models.ts
import { api } from "./client";

// DTO под твой ReadBrand
export interface ModelItem {
  id: number;
  name: string;
  description: string;
  brand_id: number;
  createdAt: string;
  updatedAt: string;
  brand: BrandType; // имя бренда
}

interface BrandType {
  id: number;
  name: string;
  description: string;
  info: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateModel {
  name: string;
  description: string;
  brand_id: number;
}

// если уже есть такой интерфейс в brands.ts – можешь его импортнуть оттуда
export interface Paginator<T> {
  items: T[];
  total_items: number;
  total_pages: number;
  page_number: number;
  page_size: number;
}

export interface SelectedObject {
  id: number;
  name: string;
}

export async function getModelPage(
  pageSize: number,
  pageNumber: number,
  name?: string
) {
  const params: any = {
    page_size: pageSize,
    page_number: pageNumber,
  };
  if (name) params.name = name;

  const res = await api.get<Paginator<ModelItem>>("/api/models", { params });
  return res.data;
}

export async function createModel(data: UpdateModel) {
  await api.post("/api/models", data);
}

export async function updateModel(id: number, data: UpdateModel) {
  await api.put("/api/models", data, { params: { id } });
}

export async function deleteModel(id: number) {
  await api.delete("/api/models", { params: { id } });
}

export async function getModelsSelected(brand_id?: number, name?: string) {
  const params: any = {};
  if (name) params.name = name;
  if (brand_id) params.brand_id = brand_id;

  const res = await api.get<SelectedObject[]>("/api/models/selected", {
    params,
  });
  return res.data;
}
