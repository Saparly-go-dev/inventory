import { api } from "./client";
import type { Paginator } from "./pagination";

export interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
  can_manage_users: boolean;
  can_manage_roles: boolean;
  can_view_inventory: boolean;
  can_create_inventory: boolean;
  can_update_inventory: boolean;
  can_delete_inventory: boolean;
  can_assign_devices: boolean;
  can_return_devices: boolean;
  can_import_devices: boolean;
  can_export_devices: boolean;
  can_clone_devices: boolean;
  can_sync_employees: boolean;
  can_view_statistics: boolean;
  can_manage_inventory: boolean;
  can_view: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleForm {
  code: string;
  name: string;
  description: string;
  can_manage_users: boolean;
  can_manage_roles: boolean;
  can_view_inventory: boolean;
  can_create_inventory: boolean;
  can_update_inventory: boolean;
  can_delete_inventory: boolean;
  can_assign_devices: boolean;
  can_return_devices: boolean;
  can_import_devices: boolean;
  can_export_devices: boolean;
  can_clone_devices: boolean;
  can_sync_employees: boolean;
  can_view_statistics: boolean;
  can_manage_inventory: boolean;
  can_view: boolean;
}

export interface SelectedRole {
  code: string;
  name: string;
}

export async function getRolePage(pageSize: number, pageNumber: number, search = "") {
  const res = await api.get<Paginator<Role>>("/api/roles/", {
    params: {
      page_size: pageSize,
      page_number: pageNumber,
      search: search || undefined,
    },
  });
  return res.data;
}

export async function getRolesSelected() {
  const res = await api.get<SelectedRole[]>("/api/roles/selected");
  return res.data;
}

export async function createRole(data: RoleForm) {
  await api.post("/api/roles/", data);
}

export async function updateRole(id: number, data: RoleForm) {
  await api.put(`/api/roles/${id}`, data);
}

export async function deleteRole(id: number) {
  await api.delete(`/api/roles/${id}`);
}
