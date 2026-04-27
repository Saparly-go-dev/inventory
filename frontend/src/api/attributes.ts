// src/api/attributes.ts
import { api } from "./client";
import type { Paginator } from "./pagination";

export interface Attribute {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAttribute {
  name: string;
  description: string;
}

export interface SelectedObject {
  id: number;
  name: string;
}

export async function getAttributePage(
  pageSize: number,
  pageNumber: number,
  name?: string
) {
  const params: Record<string, string | number> = {
    page_size: pageSize,
    page_number: pageNumber,
  };
  if (name) {
    params.name = name;
  }

  const res = await api.get<Paginator<Attribute>>("/api/attributes", {
    params,
  });
  return res.data;
}

export async function createAttribute(data: UpdateAttribute) {
  await api.post("/api/attributes", data);
}

export async function updateAttribute(id: number, data: UpdateAttribute) {
  await api.put("/api/attributes", data, {
    params: { id },
  });
}

export async function deleteAttribute(id: number) {
  await api.delete("/api/attributes", {
    params: { id },
  });
}

export async function getAttributesSelected(name?: string) {
  const params: Record<string, string> = {};
  if (name) {
    params.name = name;
  }

  const res = await api.get<SelectedObject[]>("/api/attributes/selected", {
    params,
  });
  return res.data;
}
