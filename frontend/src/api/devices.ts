// src/api/devices.ts
import { api } from "./client";

export interface RelatedBrand {
  id: number;
  name: string;
  description: string;
  info: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelatedModel {
  id: number;
  name: string;
  description: string;
  brand_id: number;
  createdAt: string;
  updatedAt: string;
}

export interface RelatedCategory {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: number;
  name: string;
  description: string;
  info: string;
  status: string;
  brand_id: number;
  model_id: number;
  category_id: number;
  photo: string; // путь к файлу
  createdAt: string;
  updatedAt: string;
  brand: RelatedBrand;
  model: RelatedModel;
  category: RelatedCategory;
  attributes?: {
    id: number;
    device_id: number;
    attribute_id: number;
    options: string;
    info: string;
  }[];
}

export interface UpdateDevice {
  name: string;
  description: string;
  info: string;
  status: string;
  brand_id: number;
  model_id: number;
  category_id: number;
  photo?: string; // старый путь, чтобы не терять фото при апдейте
  attributes?: { attribute_id: number; options: string; info: string }[];
}

export interface Paginator<T> {
  items: T[];
  total_items: number;
  total_pages: number;
  page_number: number;
  page_size: number;
}

export interface DeviceAssignmentInput {
  device_id: number;
  employee_id: number;
}

export async function getDevicePage(
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

  const res = await api.get<Paginator<Device>>("/api/devices", { params });
  return res.data;
}

// CREATE: multipart/form-data с optional файлом
export async function createDevice(data: UpdateDevice, file: File | null) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("info", data.info || "");
  formData.append("status", data.status);
  formData.append("brand_id", String(data.brand_id));
  formData.append("model_id", String(data.model_id));
  formData.append("category_id", String(data.category_id));

  // Serialize and append attributes
  if (data.attributes && data.attributes.length > 0) {
    formData.append("attributes", JSON.stringify(data.attributes));
  }

  // при создании старого пути нет, фотку передаём только файлом
  if (file) {
    formData.append("photo", file);
  }

  await api.post("/api/devices", formData);
}

// UPDATE: если файла нет — отправляем строковое поле photo со старым путём,
// чтобы бэкенд не затёр фото пустой строкой.
export async function updateDevice(
  id: number,
  data: UpdateDevice,
  file: File | null
) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("info", data.info || "");
  formData.append("status", data.status);
  formData.append("brand_id", String(data.brand_id));
  formData.append("model_id", String(data.model_id));
  formData.append("category_id", String(data.category_id));

  // Serialize and append attributes
  if (data.attributes && data.attributes.length > 0) {
    formData.append("attributes", JSON.stringify(data.attributes));
  }

  if (file) {
    // если загружаем новую фотку — отправляем только файл
    formData.append("photo", file);
  } else if (data.photo) {
    // если новой фотки нет — отправляем старый путь, чтобы сохранить
    formData.append("photo", data.photo);
  }

  await api.put("/api/devices", formData, {
    params: { id },
  });
}

export async function deleteDevice(id: number) {
  await api.delete("/api/devices", {
    params: { id },
  });
}

// ниже — если ты используешь эти функции для available/assign (можно оставить как есть)

export async function getAvailableDevices() {
  const res = await api.get<Device[]>("/api/devices/available");
  return res.data;
}

export async function assignDevice(input: DeviceAssignmentInput) {
  await api.post("/api/devices/assign", input);
}

export async function returnDevice(input: DeviceAssignmentInput) {
  await api.post("/api/devices/return", input);
}
