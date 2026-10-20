package models

import "time"

type Role struct {
	Id                  int       `json:"id" db:"id"`
	Code                string    `json:"code" db:"code" gorm:"uniqueIndex;not null"`
	Name                string    `json:"name" db:"name"`
	Description         string    `json:"description" db:"description"`
	CanManageUsers      bool      `json:"can_manage_users" db:"can_manage_users"`
	CanManageRoles      bool      `json:"can_manage_roles" db:"can_manage_roles"`
	CanViewInventory    bool      `json:"can_view_inventory" db:"can_view_inventory"`
	CanCreateInventory  bool      `json:"can_create_inventory" db:"can_create_inventory"`
	CanUpdateInventory  bool      `json:"can_update_inventory" db:"can_update_inventory"`
	CanDeleteInventory  bool      `json:"can_delete_inventory" db:"can_delete_inventory"`
	CanAssignDevices    bool      `json:"can_assign_devices" db:"can_assign_devices"`
	CanReturnDevices    bool      `json:"can_return_devices" db:"can_return_devices"`
	CanImportDevices    bool      `json:"can_import_devices" db:"can_import_devices"`
	CanExportDevices    bool      `json:"can_export_devices" db:"can_export_devices"`
	CanCloneDevices     bool      `json:"can_clone_devices" db:"can_clone_devices"`
	CanSyncEmployees    bool      `json:"can_sync_employees" db:"can_sync_employees"`
	CanViewStatistics   bool      `json:"can_view_statistics" db:"can_view_statistics"`
	CanViewFurnitures   bool      `json:"can_view_furnitures" db:"can_view_furnitures"`
	CanCreateFurnitures bool      `json:"can_create_furnitures" db:"can_create_furnitures"`
	CanUpdateFurnitures bool      `json:"can_update_furnitures" db:"can_update_furnitures"`
	CanDeleteFurnitures bool      `json:"can_delete_furnitures" db:"can_delete_furnitures"`
	CanAssignFurnitures bool      `json:"can_assign_furnitures" db:"can_assign_furnitures"`
	CanReturnFurnitures bool      `json:"can_return_furnitures" db:"can_return_furnitures"`
	CanManageInventory  bool      `json:"can_manage_inventory" db:"can_manage_inventory"`
	CanView             bool      `json:"can_view" db:"can_view"`
	IsSystem            bool      `json:"is_system" db:"is_system"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
}

type UpdateRole struct {
	Code                string `json:"code"`
	Name                string `json:"name"`
	Description         string `json:"description"`
	CanManageUsers      bool   `json:"can_manage_users"`
	CanManageRoles      bool   `json:"can_manage_roles"`
	CanViewInventory    bool   `json:"can_view_inventory"`
	CanCreateInventory  bool   `json:"can_create_inventory"`
	CanUpdateInventory  bool   `json:"can_update_inventory"`
	CanDeleteInventory  bool   `json:"can_delete_inventory"`
	CanAssignDevices    bool   `json:"can_assign_devices"`
	CanReturnDevices    bool   `json:"can_return_devices"`
	CanImportDevices    bool   `json:"can_import_devices"`
	CanExportDevices    bool   `json:"can_export_devices"`
	CanCloneDevices     bool   `json:"can_clone_devices"`
	CanSyncEmployees    bool   `json:"can_sync_employees"`
	CanViewStatistics   bool   `json:"can_view_statistics"`
	CanViewFurnitures   bool   `json:"can_view_furnitures"`
	CanCreateFurnitures bool   `json:"can_create_furnitures"`
	CanUpdateFurnitures bool   `json:"can_update_furnitures"`
	CanDeleteFurnitures bool   `json:"can_delete_furnitures"`
	CanAssignFurnitures bool   `json:"can_assign_furnitures"`
	CanReturnFurnitures bool   `json:"can_return_furnitures"`
	CanManageInventory  bool   `json:"can_manage_inventory"`
	CanView             bool   `json:"can_view"`
}

type ReadRole struct {
	Id                  int    `json:"id"`
	Code                string `json:"code"`
	Name                string `json:"name"`
	Description         string `json:"description"`
	CanManageUsers      bool   `json:"can_manage_users"`
	CanManageRoles      bool   `json:"can_manage_roles"`
	CanViewInventory    bool   `json:"can_view_inventory"`
	CanCreateInventory  bool   `json:"can_create_inventory"`
	CanUpdateInventory  bool   `json:"can_update_inventory"`
	CanDeleteInventory  bool   `json:"can_delete_inventory"`
	CanAssignDevices    bool   `json:"can_assign_devices"`
	CanReturnDevices    bool   `json:"can_return_devices"`
	CanImportDevices    bool   `json:"can_import_devices"`
	CanExportDevices    bool   `json:"can_export_devices"`
	CanCloneDevices     bool   `json:"can_clone_devices"`
	CanSyncEmployees    bool   `json:"can_sync_employees"`
	CanViewStatistics   bool   `json:"can_view_statistics"`
	CanViewFurnitures   bool   `json:"can_view_furnitures"`
	CanCreateFurnitures bool   `json:"can_create_furnitures"`
	CanUpdateFurnitures bool   `json:"can_update_furnitures"`
	CanDeleteFurnitures bool   `json:"can_delete_furnitures"`
	CanAssignFurnitures bool   `json:"can_assign_furnitures"`
	CanReturnFurnitures bool   `json:"can_return_furnitures"`
	CanManageInventory  bool   `json:"can_manage_inventory"`
	CanView             bool   `json:"can_view"`
	IsSystem            bool   `json:"is_system"`
	CreatedAt           string `json:"created_at"`
	UpdatedAt           string `json:"updated_at"`
}

type SelectedRole struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

type RolePermissions struct {
	CanManageUsers      bool `json:"can_manage_users"`
	CanManageRoles      bool `json:"can_manage_roles"`
	CanViewInventory    bool `json:"can_view_inventory"`
	CanCreateInventory  bool `json:"can_create_inventory"`
	CanUpdateInventory  bool `json:"can_update_inventory"`
	CanDeleteInventory  bool `json:"can_delete_inventory"`
	CanAssignDevices    bool `json:"can_assign_devices"`
	CanReturnDevices    bool `json:"can_return_devices"`
	CanImportDevices    bool `json:"can_import_devices"`
	CanExportDevices    bool `json:"can_export_devices"`
	CanCloneDevices     bool `json:"can_clone_devices"`
	CanSyncEmployees    bool `json:"can_sync_employees"`
	CanViewStatistics   bool `json:"can_view_statistics"`
	CanViewFurnitures   bool `json:"can_view_furnitures"`
	CanCreateFurnitures bool `json:"can_create_furnitures"`
	CanUpdateFurnitures bool `json:"can_update_furnitures"`
	CanDeleteFurnitures bool `json:"can_delete_furnitures"`
	CanAssignFurnitures bool `json:"can_assign_furnitures"`
	CanReturnFurnitures bool `json:"can_return_furnitures"`
	CanManageInventory  bool `json:"can_manage_inventory"`
	CanView             bool `json:"can_view"`
}
