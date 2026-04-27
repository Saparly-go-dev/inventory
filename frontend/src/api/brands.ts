// src/api/brands.ts
import { api } from "./client";
import type { Paginator } from "./pagination";

export interface Brand {
  id: number;
  name: string;
  description: string;
  info: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBrand {
  name: string;
  description: string;
  info: string;
}

export interface SelectedObject {
  id: number;
  name: string;
}

export async function getBrandPage(
  pageSize: number,
  pageNumber: number,
  name?: string
) {
  const params: any = {
    page_size: pageSize,
    page_number: pageNumber,
  };
  if (name) params.name = name;

  const res = await api.get<Paginator<Brand>>("/api/brands", { params });
  return res.data;
}

export async function createBrand(data: UpdateBrand) {
  await api.post("/api/brands/", data);
}

export async function updateBrand(id: number, data: UpdateBrand) {
  await api.put("/api/brands", data, { params: { id } });
}

export async function deleteBrand(id: number) {
  await api.delete("/api/brands", { params: { id } });
}

export async function getBrandsSelected(name?: string) {
  const params = name ? { name } : {};
  const res = await api.get<SelectedObject[]>("/api/brands/selected", {
    params,
  });
  return res.data;
}
