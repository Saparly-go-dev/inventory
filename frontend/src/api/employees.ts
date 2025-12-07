// src/api/employees.ts
import { api } from "./client";

export interface Employee {
  id: number;
  full_name: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
}

// структура для создания/обновления
export interface UpdateEmployee {
  full_name: string;
  position?: string;
  department?: string;
  email?: string;
  phone?: string;
}

// подгони под свой Paginator, если названия полей другие
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

export async function getEmployeesPage(
  pageSize: number,
  pageNumber: number,
  name?: string
) {
  const params: any = {
    page_size: pageSize,
    page_number: pageNumber,
  };
  if (name) params.name = name;

  const res = await api.get<Paginator<Employee>>("/api/employees", { params });
  return res.data;
}

export async function createEmployee(data: UpdateEmployee) {
  await api.post("/api/employees/", data);
}

export async function deleteEmployee(id: number) {
  await api.delete("/api/employees", { params: { id } });
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
