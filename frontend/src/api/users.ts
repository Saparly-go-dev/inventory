import { api } from "./client";
import type { Paginator } from "./pagination";
import type { AppRole, RolePermissions } from "../utils/auth";

export interface User {
  id: number;
  name: string;
  surname: string;
  patronymic: string;
  username: string;
  role: string;
  role_name?: string;
  permissions?: RolePermissions;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserForm {
  name: string;
  surname: string;
  patronymic: string;
  username: string;
  role: AppRole;
  password: string;
  confirm_password: string;
}

export interface UserFilters {
  name?: string;
  surname?: string;
  patronymic?: string;
  username?: string;
}

export interface ChangeUserPasswordInput {
  user_id: number;
  old_password?: string;
  password: string;
  confirm_password: string;
}

export async function getUserPage(
  pageSize: number,
  pageNumber: number,
  filters: UserFilters = {}
) {
  const params: Record<string, string | number> = {
    page_size: pageSize,
    page_number: pageNumber,
  };

  if (filters.name) params.name = filters.name;
  if (filters.surname) params.surname = filters.surname;
  if (filters.patronymic) params.patronymic = filters.patronymic;
  if (filters.username) params.username = filters.username;

  const res = await api.get<Paginator<User>>("/api/users/", { params });
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get<User>("/api/users/me");
  return res.data;
}

export async function createUser(data: UserForm) {
  await api.post("/api/users/", data);
}

export async function updateUser(id: number, data: Omit<UserForm, "password" | "confirm_password">) {
  await api.put(`/api/users/${id}`, data);
}

export async function deleteUser(id: number) {
  await api.delete(`/api/users/${id}`);
}

export async function changeUserStatus(id: number) {
  await api.patch(`/api/users/${id}/status`);
}

export async function changeUserPassword(input: ChangeUserPasswordInput) {
  await api.post("/api/users/password", input);
}
