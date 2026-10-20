package service

import (
	"errors"
	"inventory/models"
	"inventory/pkg/repository"
	"strings"

	"gorm.io/gorm"
)

type RoleService struct {
	repo repository.Role
}

func NewRoleService(repo repository.Role) *RoleService {
	return &RoleService{repo: repo}
}

func (s *RoleService) Create(buffer models.UpdateRole) error {
	if strings.TrimSpace(buffer.Name) == "" {
		return errors.New("Rol ady boş bolmaly däl")
	}

	return s.repo.Create(buffer)
}

func (s *RoleService) GetPage(search string, pageSize, pageNumber int) (models.Paginator, error) {
	return s.repo.GetPage(search, pageSize, pageNumber)
}

func (s *RoleService) GetAllSelected() ([]models.SelectedRole, error) {
	return s.repo.GetAllSelected()
}

func (s *RoleService) GetByCode(code string) (models.Role, error) {
	return s.repo.GetByCode(code)
}

func (s *RoleService) GetPermissionsByCode(code string) models.RolePermissions {
	role, err := s.repo.GetByCode(code)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return defaultRolePermissions(code)
	}

	if err != nil {
		return defaultRolePermissions(code)
	}

	return rolePermissionsFromRole(role)
}

func (s *RoleService) Update(id int, buffer models.UpdateRole) error {
	if strings.TrimSpace(buffer.Name) == "" {
		return errors.New("Rol ady boş bolmaly däl")
	}

	return s.repo.Update(id, buffer)
}

func (s *RoleService) Delete(id int) error {
	return s.repo.Delete(id)
}

func defaultRolePermissions(code string) models.RolePermissions {
	code = strings.ToLower(strings.TrimSpace(code))
	if code == "string" {
		code = "admin"
	}

	switch code {
	case "admin":
		return allRolePermissions()
	case "manager":
		return models.RolePermissions{
			CanViewInventory:    true,
			CanCreateInventory:  true,
			CanUpdateInventory:  true,
			CanDeleteInventory:  true,
			CanAssignDevices:    true,
			CanReturnDevices:    true,
			CanImportDevices:    true,
			CanExportDevices:    true,
			CanCloneDevices:     true,
			CanSyncEmployees:    true,
			CanViewStatistics:   true,
			CanViewFurnitures:   true,
			CanCreateFurnitures: true,
			CanUpdateFurnitures: true,
			CanDeleteFurnitures: true,
			CanAssignFurnitures: true,
			CanReturnFurnitures: true,
			CanManageInventory:  true,
			CanView:             true,
		}
	default:
		return models.RolePermissions{
			CanViewInventory:  true,
			CanExportDevices:  true,
			CanViewStatistics: true,
			CanViewFurnitures: true,
			CanView:           true,
		}
	}
}

func rolePermissionsFromRole(role models.Role) models.RolePermissions {
	if role.Code == "admin" {
		return allRolePermissions()
	}

	permissions := models.RolePermissions{
		CanManageUsers:      role.CanManageUsers,
		CanManageRoles:      role.CanManageRoles,
		CanViewInventory:    role.CanViewInventory,
		CanCreateInventory:  role.CanCreateInventory,
		CanUpdateInventory:  role.CanUpdateInventory,
		CanDeleteInventory:  role.CanDeleteInventory,
		CanAssignDevices:    role.CanAssignDevices,
		CanReturnDevices:    role.CanReturnDevices,
		CanImportDevices:    role.CanImportDevices,
		CanExportDevices:    role.CanExportDevices,
		CanCloneDevices:     role.CanCloneDevices,
		CanSyncEmployees:    role.CanSyncEmployees,
		CanViewStatistics:   role.CanViewStatistics,
		CanViewFurnitures:   role.CanViewFurnitures,
		CanCreateFurnitures: role.CanCreateFurnitures,
		CanUpdateFurnitures: role.CanUpdateFurnitures,
		CanDeleteFurnitures: role.CanDeleteFurnitures,
		CanAssignFurnitures: role.CanAssignFurnitures,
		CanReturnFurnitures: role.CanReturnFurnitures,
		CanManageInventory:  role.CanManageInventory,
		CanView:             role.CanView,
	}

	if role.CanManageInventory {
		permissions.CanViewInventory = true
		permissions.CanCreateInventory = true
		permissions.CanUpdateInventory = true
		permissions.CanDeleteInventory = true
		permissions.CanAssignDevices = true
		permissions.CanReturnDevices = true
		permissions.CanImportDevices = true
		permissions.CanExportDevices = true
		permissions.CanCloneDevices = true
		permissions.CanSyncEmployees = true
		permissions.CanViewStatistics = true
		permissions.CanViewFurnitures = true
		permissions.CanCreateFurnitures = true
		permissions.CanUpdateFurnitures = true
		permissions.CanDeleteFurnitures = true
		permissions.CanAssignFurnitures = true
		permissions.CanReturnFurnitures = true
	}

	if role.CanView {
		permissions.CanViewInventory = true
		permissions.CanExportDevices = true
		permissions.CanViewStatistics = true
		permissions.CanViewFurnitures = true
	}

	return permissions
}

func allRolePermissions() models.RolePermissions {
	return models.RolePermissions{
		CanManageUsers:      true,
		CanManageRoles:      true,
		CanViewInventory:    true,
		CanCreateInventory:  true,
		CanUpdateInventory:  true,
		CanDeleteInventory:  true,
		CanAssignDevices:    true,
		CanReturnDevices:    true,
		CanImportDevices:    true,
		CanExportDevices:    true,
		CanCloneDevices:     true,
		CanSyncEmployees:    true,
		CanViewStatistics:   true,
		CanViewFurnitures:   true,
		CanCreateFurnitures: true,
		CanUpdateFurnitures: true,
		CanDeleteFurnitures: true,
		CanAssignFurnitures: true,
		CanReturnFurnitures: true,
		CanManageInventory:  true,
		CanView:             true,
	}
}
