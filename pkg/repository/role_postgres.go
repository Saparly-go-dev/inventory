package repository

import (
	"errors"
	"inventory/models"
	"strings"
	"time"

	"gorm.io/gorm"
)

type RolePostgres struct {
	db *gorm.DB
}

func NewRolePostgres(db *gorm.DB) *RolePostgres {
	return &RolePostgres{db: db}
}

func (r *RolePostgres) Create(buffer models.UpdateRole) error {
	code := normalizeRoleCode(buffer.Code)
	if code == "" {
		return errors.New("Rol kody boş bolmaly däl")
	}

	var count int64
	if err := r.db.Model(&models.Role{}).Where("code = ?", code).Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		return errors.New("Rol kody öň ulanylýar")
	}

	role := models.Role{
		Code:                code,
		Name:                strings.TrimSpace(buffer.Name),
		Description:         strings.TrimSpace(buffer.Description),
		CanManageUsers:      buffer.CanManageUsers,
		CanManageRoles:      buffer.CanManageRoles,
		CanViewInventory:    buffer.CanViewInventory,
		CanCreateInventory:  buffer.CanCreateInventory,
		CanUpdateInventory:  buffer.CanUpdateInventory,
		CanDeleteInventory:  buffer.CanDeleteInventory,
		CanAssignDevices:    buffer.CanAssignDevices,
		CanReturnDevices:    buffer.CanReturnDevices,
		CanImportDevices:    buffer.CanImportDevices,
		CanExportDevices:    buffer.CanExportDevices,
		CanCloneDevices:     buffer.CanCloneDevices,
		CanSyncEmployees:    buffer.CanSyncEmployees,
		CanViewStatistics:   buffer.CanViewStatistics,
		CanViewFurnitures:   buffer.CanViewFurnitures,
		CanCreateFurnitures: buffer.CanCreateFurnitures,
		CanUpdateFurnitures: buffer.CanUpdateFurnitures,
		CanDeleteFurnitures: buffer.CanDeleteFurnitures,
		CanAssignFurnitures: buffer.CanAssignFurnitures,
		CanReturnFurnitures: buffer.CanReturnFurnitures,
		CanManageInventory:  buffer.CanManageInventory,
		CanView:             buffer.CanView,
		IsSystem:            false,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	normalizeRolePermissions(&role)
	return r.db.Create(&role).Error
}

func (r *RolePostgres) GetPage(search string, pageSize, pageNumber int) (models.Paginator, error) {
	var roles []models.Role
	var count int64
	offset := (pageNumber - 1) * pageSize

	request := r.db.Model(&models.Role{})
	search = strings.TrimSpace(search)
	if search != "" {
		request = request.Where("code ILIKE ? OR name ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	if err := request.Count(&count).Error; err != nil {
		return models.Paginator{}, err
	}

	if err := request.Order("is_system DESC, id ASC").Offset(offset).Limit(pageSize).Find(&roles).Error; err != nil {
		return models.Paginator{}, err
	}

	readRoles := make([]models.ReadRole, 0, len(roles))
	for _, role := range roles {
		readRoles = append(readRoles, toReadRole(role))
	}

	return CreatePaginator(readRoles, int(count), pageSize, pageNumber), nil
}

func (r *RolePostgres) GetAllSelected() ([]models.SelectedRole, error) {
	var roles []models.Role
	if err := r.db.Model(&models.Role{}).Order("is_system DESC, id ASC").Find(&roles).Error; err != nil {
		return nil, err
	}

	result := make([]models.SelectedRole, 0, len(roles))
	for _, role := range roles {
		result = append(result, models.SelectedRole{
			Code: role.Code,
			Name: role.Name,
		})
	}

	return result, nil
}

func (r *RolePostgres) GetByCode(code string) (models.Role, error) {
	var role models.Role
	result := r.db.Model(&models.Role{}).Where("code = ?", normalizeRoleCode(code)).First(&role)
	return role, result.Error
}

func (r *RolePostgres) Update(id int, buffer models.UpdateRole) error {
	var role models.Role
	if err := r.db.Model(&models.Role{}).Where("id = ?", id).First(&role).Error; err != nil {
		return err
	}

	code := normalizeRoleCode(buffer.Code)
	if role.IsSystem {
		code = role.Code
	}

	if code == "" {
		return errors.New("Rol kody boş bolmaly däl")
	}

	var count int64
	if err := r.db.Model(&models.Role{}).Where("id != ? AND code = ?", id, code).Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		return errors.New("Rol kody öň ulanylýar")
	}

	updateRole := models.Role{
		Code:                code,
		Name:                strings.TrimSpace(buffer.Name),
		Description:         strings.TrimSpace(buffer.Description),
		CanManageUsers:      buffer.CanManageUsers,
		CanManageRoles:      buffer.CanManageRoles,
		CanViewInventory:    buffer.CanViewInventory,
		CanCreateInventory:  buffer.CanCreateInventory,
		CanUpdateInventory:  buffer.CanUpdateInventory,
		CanDeleteInventory:  buffer.CanDeleteInventory,
		CanAssignDevices:    buffer.CanAssignDevices,
		CanReturnDevices:    buffer.CanReturnDevices,
		CanImportDevices:    buffer.CanImportDevices,
		CanExportDevices:    buffer.CanExportDevices,
		CanCloneDevices:     buffer.CanCloneDevices,
		CanSyncEmployees:    buffer.CanSyncEmployees,
		CanViewStatistics:   buffer.CanViewStatistics,
		CanViewFurnitures:   buffer.CanViewFurnitures,
		CanCreateFurnitures: buffer.CanCreateFurnitures,
		CanUpdateFurnitures: buffer.CanUpdateFurnitures,
		CanDeleteFurnitures: buffer.CanDeleteFurnitures,
		CanAssignFurnitures: buffer.CanAssignFurnitures,
		CanReturnFurnitures: buffer.CanReturnFurnitures,
		CanManageInventory:  buffer.CanManageInventory,
		CanView:             buffer.CanView,
		IsSystem:            role.IsSystem,
	}
	normalizeRolePermissions(&updateRole)

	updateData := map[string]interface{}{
		"code":                  updateRole.Code,
		"name":                  updateRole.Name,
		"description":           updateRole.Description,
		"can_manage_users":      updateRole.CanManageUsers,
		"can_manage_roles":      updateRole.CanManageRoles,
		"can_view_inventory":    updateRole.CanViewInventory,
		"can_create_inventory":  updateRole.CanCreateInventory,
		"can_update_inventory":  updateRole.CanUpdateInventory,
		"can_delete_inventory":  updateRole.CanDeleteInventory,
		"can_assign_devices":    updateRole.CanAssignDevices,
		"can_return_devices":    updateRole.CanReturnDevices,
		"can_import_devices":    updateRole.CanImportDevices,
		"can_export_devices":    updateRole.CanExportDevices,
		"can_clone_devices":     updateRole.CanCloneDevices,
		"can_sync_employees":    updateRole.CanSyncEmployees,
		"can_view_statistics":   updateRole.CanViewStatistics,
		"can_view_furnitures":   updateRole.CanViewFurnitures,
		"can_create_furnitures": updateRole.CanCreateFurnitures,
		"can_update_furnitures": updateRole.CanUpdateFurnitures,
		"can_delete_furnitures": updateRole.CanDeleteFurnitures,
		"can_assign_furnitures": updateRole.CanAssignFurnitures,
		"can_return_furnitures": updateRole.CanReturnFurnitures,
		"can_manage_inventory":  updateRole.CanManageInventory,
		"can_view":              updateRole.CanView,
		"updated_at":            time.Now(),
	}

	return r.db.Model(&models.Role{}).Where("id = ?", id).Updates(updateData).Error
}

func (r *RolePostgres) Delete(id int) error {
	var role models.Role
	if err := r.db.Model(&models.Role{}).Where("id = ?", id).First(&role).Error; err != nil {
		return err
	}

	if role.IsSystem {
		return errors.New("Ulgam roly pozup bolmaýar")
	}

	var usersCount int64
	if err := r.db.Model(&models.User{}).Where("role = ?", role.Code).Count(&usersCount).Error; err != nil {
		return err
	}

	if usersCount > 0 {
		return errors.New("Bu rol ulanyjylara berkidilen")
	}

	return r.db.Model(&models.Role{}).Where("id = ?", id).Delete(&models.Role{}).Error
}

func toReadRole(role models.Role) models.ReadRole {
	normalizeRolePermissions(&role)
	return models.ReadRole{
		Id:                  role.Id,
		Code:                role.Code,
		Name:                role.Name,
		Description:         role.Description,
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
		IsSystem:            role.IsSystem,
		CreatedAt:           role.CreatedAt.Format("02.01.2006"),
		UpdatedAt:           role.UpdatedAt.Format("02.01.2006"),
	}
}

func normalizeRoleCode(code string) string {
	code = strings.ToLower(strings.TrimSpace(code))
	if code == "string" {
		return "admin"
	}
	return code
}

func forceAdminPermissions(role *models.Role) {
	if role.Code != "admin" {
		return
	}

	role.CanManageUsers = true
	role.CanManageRoles = true
	role.CanViewInventory = true
	role.CanCreateInventory = true
	role.CanUpdateInventory = true
	role.CanDeleteInventory = true
	role.CanAssignDevices = true
	role.CanReturnDevices = true
	role.CanImportDevices = true
	role.CanExportDevices = true
	role.CanCloneDevices = true
	role.CanSyncEmployees = true
	role.CanViewStatistics = true
	role.CanViewFurnitures = true
	role.CanCreateFurnitures = true
	role.CanUpdateFurnitures = true
	role.CanDeleteFurnitures = true
	role.CanAssignFurnitures = true
	role.CanReturnFurnitures = true
	role.CanManageInventory = true
	role.CanView = true
	role.IsSystem = true
}

func normalizeRolePermissions(role *models.Role) {
	if role.CanManageInventory {
		role.CanViewInventory = true
		role.CanCreateInventory = true
		role.CanUpdateInventory = true
		role.CanDeleteInventory = true
		role.CanAssignDevices = true
		role.CanReturnDevices = true
		role.CanImportDevices = true
		role.CanExportDevices = true
		role.CanCloneDevices = true
		role.CanSyncEmployees = true
		role.CanViewStatistics = true
		role.CanViewFurnitures = true
		role.CanCreateFurnitures = true
		role.CanUpdateFurnitures = true
		role.CanDeleteFurnitures = true
		role.CanAssignFurnitures = true
		role.CanReturnFurnitures = true
	}

	if role.CanView {
		role.CanViewInventory = true
		role.CanExportDevices = true
		role.CanViewStatistics = true
		role.CanViewFurnitures = true
	}

	forceAdminPermissions(role)
}
