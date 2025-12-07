// src/api/devices.ts
import { api } from "./client";

export interface Device {
  id: number;
  name: string;
  status: string;
  // добавь сюда ещё поля, которые реально есть в JSON: serial_number, model и т.п.
}

export interface DeviceAssignmentInput {
  device_id: number;
  employee_id: number;
}

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
