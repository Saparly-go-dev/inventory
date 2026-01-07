package repository

import (
	"errors"
	"inventory/models"
	"time"

	"gorm.io/gorm"
)

type DeviceAssignmentPostgres struct {
	db *gorm.DB
}

func NewDeviceAssignmentPostgres(db *gorm.DB) *DeviceAssignmentPostgres {
	return &DeviceAssignmentPostgres{db: db}
}

// AssignDeviceToEmployee — выдача устройства сотруднику.
// - создаёт запись в device_assignments
// - меняет статус устройства на "assigned"
func (r *DeviceAssignmentPostgres) AssignDeviceToEmployee(deviceId, employeeId int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var device models.Device

		// проверяем, что устройство существует
		getDeviceReq := tx.Model(&models.Device{}).Where("id = ?", deviceId).First(&device)
		if getDeviceReq.Error != nil {
			return getDeviceReq.Error
		}

		// если уже выдано — не даём назначить ещё раз
		if device.Status == "assigned" {
			return errors.New("Device already assigned")
		}

		assignment := models.DeviceAssignment{
			DeviceID:   deviceId,
			EmployeeID: employeeId,
			AssignedAt: time.Now(),
			ReturnedAt: nil,
		}

		createReq := tx.Model(&models.DeviceAssignment{}).Create(&assignment)
		if createReq.Error != nil {
			return createReq.Error
		}

		updateDeviceReq := tx.Model(&models.Device{}).
			Where("id = ?", deviceId).
			Update("status", "assigned")
		if updateDeviceReq.Error != nil {
			return updateDeviceReq.Error
		}

		return nil
	})
}

// ReturnDeviceFromEmployee — возврат устройства от сотрудника.
// - ставит ReturnedAt
// - меняет статус устройства на "in_stock"
func (r *DeviceAssignmentPostgres) ReturnDeviceFromEmployee(deviceId, employeeId int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var assignment models.DeviceAssignment

		// ищем активную выдачу (returned_at IS NULL)
		getAssignReq := tx.Model(&models.DeviceAssignment{}).
			Where("device_id = ? AND employee_id = ? AND returned_at IS NULL", deviceId, employeeId).
			First(&assignment)
		if getAssignReq.Error != nil {
			if errors.Is(getAssignReq.Error, gorm.ErrRecordNotFound) {
				return errors.New("Active assignment not found")
			}
			return getAssignReq.Error
		}

		now := time.Now()

		updateAssignReq := tx.Model(&models.DeviceAssignment{}).
			Where("id = ?", assignment.ID).
			Updates(map[string]interface{}{
				"returned_at": now,
			})
		if updateAssignReq.Error != nil {
			return updateAssignReq.Error
		}

		updateDeviceReq := tx.Model(&models.Device{}).
			Where("id = ?", deviceId).
			Update("status", "in_stock")
		if updateDeviceReq.Error != nil {
			return updateDeviceReq.Error
		}

		return nil
	})
}

// GetEmployeeDevices — все активные устройства (не возвращённые) у сотрудника.
func (r *DeviceAssignmentPostgres) GetEmployeeDevices(employeeId int) ([]models.Device, error) {
	var devices []models.Device

	getReq := r.db.Model(&models.Device{}).
		Joins("JOIN device_assignments da ON da.device_id = devices.id").
		Where("da.employee_id = ? AND da.returned_at IS NULL", employeeId).
		Find(&devices)
	if getReq.Error != nil {
		return nil, getReq.Error
	}

	return devices, nil
}

// GetAvailableDevices — все устройства со статусом "in_stock".
func (r *DeviceAssignmentPostgres) GetAvailableDevices() ([]models.Device, error) {
	var devices []models.Device

	getReq := r.db.Model(&models.Device{}).Preload("Category").Preload("Brand").Preload("Model").
		Where("status = ?", "in_stock").
		Find(&devices)
	if getReq.Error != nil {
		return nil, getReq.Error
	}

	return devices, nil
}
