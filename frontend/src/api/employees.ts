// src/api/employees.ts
import { api } from "./client";
import type { Paginator } from "./pagination";

export interface Employee {
  id: number;
  full_name: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
  room_number: number;
}

// структура для создания/обновления
export interface UpdateEmployee {
  full_name: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
  room_number: number;
}

export interface EmployeeWithDevices extends Employee {
  devices: any[]; // Using any[] to match existing usage in details page, or we could import Device if available
}

export interface SelectedObject {
  id: number;
  name: string;
}

export async function getEmployeesPage(
  pageSize: number,
  pageNumber: number,
  name?: string,
  roomNumbers?: number[]
) {
  const params: any = {
    page_size: pageSize,
    page_number: pageNumber,
  };
  if (name) {
    params.name = name;
  }
  if (roomNumbers && roomNumbers.length > 0) {
    params.room_numbers = roomNumbers.join(",");
  }

  const res = await api.get<Paginator<Employee>>("/api/employees", { params });
  return res.data;
}

export async function createEmployee(data: UpdateEmployee) {
  await api.post("/api/employees/", data);
}

export async function updateEmployee(id: number, data: UpdateEmployee) {
  await api.put("/api/employees", data, { params: { id } });
}

export async function deleteEmployee(id: number) {
  await api.delete("/api/employees", { params: { id } });
}

export async function syncEmployees() {
  await api.post("/api/employees/sync");
}

export async function getEmployeesSelected(name?: string) {
  const params = name ? { name } : {};
  const res = await api.get<SelectedObject[]>("/api/employees/selected", {
    params,
  });
  return res.data;
}

export async function getEmployeeDevices(employeeId: number) {
  const res = await api.get("/api/employees/devices", {
    params: { employee_id: employeeId },
  });
  return res.data; // []Device
}

export async function getEmployeeWithDevices(id: number) {
  const res = await api.get<EmployeeWithDevices>(`/api/employees/${id}/with-devices`);
  return res.data;
}


export async function getEmployee(id: number) {
  // Use 'any' temporarily to handle potential Paginator or single object response dynamically
  // or define a return type that covers both structure if needed.
  // Given previous pattern, let's assume it returns Paginator-like structure if it shares endpoint.
  const response = await api.get<any>(`/api/employees`, { params: { id } });

  if (response.data && response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0) {
    return response.data.items[0] as Employee;
  }
  if (Array.isArray(response.data) && response.data.length > 0) {
    return response.data[0] as Employee;
  }
  // If it returns single object directly
  return response.data as Employee;
}
