package repository

import (
	"errors"
	"inventory/models"
	"strconv"
	"time"

	"gorm.io/gorm"
)

type DeviceAttributePostgres struct {
	db *gorm.DB
}

func NewDeviceAttributePostgres(db *gorm.DB) *DeviceAttributePostgres {
	return &DeviceAttributePostgres{db: db}
}

func (r *DeviceAttributePostgres) Update(id int, buffer models.UpdateDeviceAttribute) error {
	var count int64

	check_request := r.db.Model(&models.DeviceAttribute{}).Where("id = ?", id).Count(&count)

	if check_request.Error != nil {
		return check_request.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	updateData := map[string]interface{}{
		"device_id":    strconv.Itoa(buffer.DeviceId),
		"attribute_id": buffer.AttributeId,
		"options":      buffer.Options,
		"info":         buffer.Info,
		"updated_at":   time.Now().Format(time.RFC3339),
	}

	update_request := r.db.Model(&models.DeviceAttribute{}).Where("id = ?", id).Updates(updateData)
	if update_request.Error != nil {
		return update_request.Error
	}

	return nil
}

func (r *DeviceAttributePostgres) Delete(id int) error {
	var count int64

	check_request := r.db.Model(&models.DeviceAttribute{}).Where("id = ?", id).Count(&count)

	if check_request.Error != nil {
		return check_request.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	delete_request := r.db.Model(&models.DeviceAttribute{}).Where("id = ?", id).Delete(&models.DeviceAttribute{})
	if delete_request.Error != nil {
		return delete_request.Error
	}

	return nil
}
