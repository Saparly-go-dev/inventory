import { api } from "./client";
import type { Employee } from "./employees";
import type { Paginator } from "./pagination";

export interface Furniture {
  id: number;
  name: string;
  description: string;
  info: string;
  photo: string;
  category_id: number;
  total_quantity: number;
  allocated_quantity: number;
  available_quantity: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface UpdateFurniture {
  name: string;
  description: string;
  info: string;
  photo?: string;
  category_id: number;
  total_quantity: number;
}

export interface FurnitureAllocation {
  id: number;
  furniture_id: number;
  employee_id?: number | null;
  room_number?: number | null;
  quantity: number;
  assigned_at: string;
  returned_at?: string | null;
  employee?: Employee | null;
}

export interface AssignFurnitureInput {
  furniture_id: number;
  employee_id?: number | null;
  room_number?: number | null;
  quantity: number;
}

export interface ReturnFurnitureInput {
  allocation_id: number;
  quantity: number;
}

export async function getFurniturePage(pageSize: number, pageNumber: number, name?: string) {
  const params: Record<string, string | number> = {
    page_size: pageSize,
    page_number: pageNumber,
  };
  if (name) params.name = name;
  const res = await api.get<Paginator<Furniture>>("/api/furnitures", { params });
  return res.data;
}

export async function createFurniture(data: UpdateFurniture, file: File | null) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("info", data.info || "");
  formData.append("category_id", String(data.category_id));
  formData.append("total_quantity", String(data.total_quantity));
  if (file) formData.append("photo", file);
  await api.post("/api/furnitures", formData);
}

export async function updateFurniture(id: number, data: UpdateFurniture, file: File | null) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("info", data.info || "");
  formData.append("category_id", String(data.category_id));
  formData.append("total_quantity", String(data.total_quantity));
  if (file) {
    formData.append("photo", file);
  } else if (data.photo) {
    formData.append("photo", data.photo);
  }
  await api.put("/api/furnitures", formData, { params: { id } });
}

export async function deleteFurniture(id: number) {
  await api.delete("/api/furnitures", { params: { id } });
}

export async function getAvailableFurnitures() {
  const res = await api.get<Furniture[]>("/api/furnitures/available");
  return res.data;
}

export async function getFurnitureAllocations(id: number) {
  const res = await api.get<FurnitureAllocation[]>(`/api/furnitures/${id}/allocations`);
  return res.data;
}

export async function assignFurniture(input: AssignFurnitureInput) {
  await api.post("/api/furnitures/assign", input);
}

export async function returnFurniture(input: ReturnFurnitureInput) {
  await api.post("/api/furnitures/return", input);
}
