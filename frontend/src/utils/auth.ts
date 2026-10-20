export type AppRole = string;

export interface RolePermissions {
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
  can_view_furnitures: boolean;
  can_create_furnitures: boolean;
  can_update_furnitures: boolean;
  can_delete_furnitures: boolean;
  can_assign_furnitures: boolean;
  can_return_furnitures: boolean;
  can_manage_inventory: boolean;
  can_view: boolean;
}

export type PermissionKey = keyof RolePermissions;

export const PERMISSION_KEYS: PermissionKey[] = [
  "can_manage_users",
  "can_manage_roles",
  "can_view_inventory",
  "can_create_inventory",
  "can_update_inventory",
  "can_delete_inventory",
  "can_assign_devices",
  "can_return_devices",
  "can_import_devices",
  "can_export_devices",
  "can_clone_devices",
  "can_sync_employees",
  "can_view_statistics",
  "can_view_furnitures",
  "can_create_furnitures",
  "can_update_furnitures",
  "can_delete_furnitures",
  "can_assign_furnitures",
  "can_return_furnitures",
  "can_manage_inventory",
  "can_view",
];

export const ROLE_OPTIONS: Array<{ value: AppRole; label: string }> = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Dolandyryjy" },
  { value: "viewer", label: "Synçy" },
];

export function normalizeRole(role?: string | null): AppRole {
  const normalized = (role || "").trim().toLowerCase();

  if (normalized === "string") {
    return "admin";
  }

  return normalized || "viewer";
}

export function getCurrentRole(): AppRole {
  return normalizeRole(localStorage.getItem("auth_role"));
}

function emptyPermissions(): RolePermissions {
  return {
    can_manage_users: false,
    can_manage_roles: false,
    can_view_inventory: false,
    can_create_inventory: false,
    can_update_inventory: false,
    can_delete_inventory: false,
    can_assign_devices: false,
    can_return_devices: false,
    can_import_devices: false,
    can_export_devices: false,
    can_clone_devices: false,
    can_sync_employees: false,
    can_view_statistics: false,
    can_view_furnitures: false,
    can_create_furnitures: false,
    can_update_furnitures: false,
    can_delete_furnitures: false,
    can_assign_furnitures: false,
    can_return_furnitures: false,
    can_manage_inventory: false,
    can_view: false,
  };
}

export function normalizePermissions(input?: Partial<RolePermissions> | null): RolePermissions {
  const permissions = emptyPermissions();
  if (!input) return permissions;

  PERMISSION_KEYS.forEach((key) => {
    permissions[key] = Boolean(input[key]);
  });

  if (permissions.can_manage_inventory) {
    permissions.can_view_inventory = true;
    permissions.can_create_inventory = true;
    permissions.can_update_inventory = true;
    permissions.can_delete_inventory = true;
    permissions.can_assign_devices = true;
    permissions.can_return_devices = true;
    permissions.can_import_devices = true;
    permissions.can_export_devices = true;
    permissions.can_clone_devices = true;
    permissions.can_sync_employees = true;
    permissions.can_view_statistics = true;
    permissions.can_view_furnitures = true;
    permissions.can_create_furnitures = true;
    permissions.can_update_furnitures = true;
    permissions.can_delete_furnitures = true;
    permissions.can_assign_furnitures = true;
    permissions.can_return_furnitures = true;
  }

  if (permissions.can_view) {
    permissions.can_view_inventory = true;
    permissions.can_export_devices = true;
    permissions.can_view_statistics = true;
    permissions.can_view_furnitures = true;
  }

  return permissions;
}

function allPermissions(): RolePermissions {
  const permissions = emptyPermissions();
  PERMISSION_KEYS.forEach((key) => {
    permissions[key] = true;
  });
  return permissions;
}

function fallbackPermissions(role: AppRole): RolePermissions {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return allPermissions();

  const permissions = emptyPermissions();

  if (normalized === "manager") {
    permissions.can_view_inventory = true;
    permissions.can_create_inventory = true;
    permissions.can_update_inventory = true;
    permissions.can_delete_inventory = true;
    permissions.can_assign_devices = true;
    permissions.can_return_devices = true;
    permissions.can_import_devices = true;
    permissions.can_export_devices = true;
    permissions.can_clone_devices = true;
    permissions.can_sync_employees = true;
    permissions.can_view_statistics = true;
    permissions.can_view_furnitures = true;
    permissions.can_create_furnitures = true;
    permissions.can_update_furnitures = true;
    permissions.can_delete_furnitures = true;
    permissions.can_assign_furnitures = true;
    permissions.can_return_furnitures = true;
    permissions.can_manage_inventory = true;
    permissions.can_view = true;
    return permissions;
  }

  if (normalized === "viewer") {
    permissions.can_view_inventory = true;
    permissions.can_export_devices = true;
    permissions.can_view_statistics = true;
    permissions.can_view_furnitures = true;
    permissions.can_view = true;
  }

  return permissions;
}

export function getCurrentPermissions(): RolePermissions | null {
  const raw = localStorage.getItem("auth_permissions");
  if (!raw) return null;

  try {
    return normalizePermissions(JSON.parse(raw) as Partial<RolePermissions>);
  } catch {
    return null;
  }
}

export function setCurrentPermissions(permissions?: Partial<RolePermissions> | null) {
  if (!permissions) {
    localStorage.removeItem("auth_permissions");
    return;
  }

  localStorage.setItem("auth_permissions", JSON.stringify(normalizePermissions(permissions)));
}

export function getEffectivePermissions(
  role: AppRole = getCurrentRole(),
  permissions: RolePermissions | null = getCurrentPermissions()
) {
  const normalizedRole = normalizeRole(role);
  if (normalizedRole === "admin") return allPermissions();
  return permissions ? normalizePermissions(permissions) : fallbackPermissions(normalizedRole);
}

export function hasPermission(
  permission: PermissionKey,
  role: AppRole = getCurrentRole(),
  permissions: RolePermissions | null = getCurrentPermissions()
) {
  return getEffectivePermissions(role, permissions)[permission];
}

export function canManageUsers(role?: AppRole, permissions?: RolePermissions | null) {
  return hasPermission("can_manage_users", role, permissions);
}

export function canManageRoles(role?: AppRole, permissions?: RolePermissions | null) {
  return hasPermission("can_manage_roles", role, permissions);
}

export function canCreateInventory(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_create_inventory || effective.can_manage_inventory;
}

export function canUpdateInventory(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_update_inventory || effective.can_manage_inventory;
}

export function canDeleteInventory(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_delete_inventory || effective.can_manage_inventory;
}

export function canAssignDevices(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_assign_devices || effective.can_manage_inventory;
}

export function canReturnDevices(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_return_devices || effective.can_manage_inventory;
}

export function canImportDevices(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_import_devices || effective.can_manage_inventory;
}

export function canExportDevices(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_export_devices || effective.can_view || effective.can_manage_inventory;
}

export function canCloneDevices(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_clone_devices || effective.can_manage_inventory;
}

export function canSyncEmployees(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_sync_employees || effective.can_manage_inventory;
}

export function canViewStatistics(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_view_statistics || effective.can_view || effective.can_manage_inventory;
}

export function canViewFurnitures(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_view_furnitures || effective.can_manage_inventory || effective.can_view;
}

export function canCreateFurnitures(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_create_furnitures || effective.can_manage_inventory;
}

export function canUpdateFurnitures(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_update_furnitures || effective.can_manage_inventory;
}

export function canDeleteFurnitures(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_delete_furnitures || effective.can_manage_inventory;
}

export function canAssignFurnitures(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_assign_furnitures || effective.can_manage_inventory;
}

export function canReturnFurnitures(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_return_furnitures || effective.can_manage_inventory;
}

export function canManageInventory(role?: AppRole, permissions?: RolePermissions | null) {
  return (
    canCreateInventory(role, permissions) ||
    canUpdateInventory(role, permissions) ||
    canDeleteInventory(role, permissions) ||
    canAssignDevices(role, permissions) ||
    canReturnDevices(role, permissions) ||
    canImportDevices(role, permissions) ||
    canCloneDevices(role, permissions) ||
    canSyncEmployees(role, permissions)
  );
}

export function canViewInventory(role?: AppRole, permissions?: RolePermissions | null) {
  const effective = getEffectivePermissions(role, permissions);
  return effective.can_view_inventory || effective.can_view || effective.can_manage_inventory;
}

export function clearAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("auth_permissions");
}
