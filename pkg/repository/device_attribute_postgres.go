package repository

import (
	"errors"
	"inventory/models"
	"time"

	"gorm.io/gorm"
)

type DeviceAttributePostgres struct {
	db *gorm.DB
}

func NewDeviceAttributePostgres(db *gorm.DB) *DeviceAttributePostgres {
	return &DeviceAttributePostgres{db: db}
}

func (r *DeviceAttributePostgres) Create(buffer models.UpdateDeviceAttribute) error {
	var deviceCount int64
	r.db.Model(&models.Device{}).Where("id = ?", buffer.DeviceId).Count(&deviceCount)
	if deviceCount == 0 {
		return errors.New("device not found")
	}

	var attributeCount int64
	r.db.Model(&models.Attribute{}).Where("id = ?", buffer.AttributeId).Count(&attributeCount)
	if attributeCount == 0 {
		return errors.New("attribute not found")
	}

	newDeviceAttribute := models.DeviceAttribute{
		DeviceId:    buffer.DeviceId,
		AttributeId: buffer.AttributeId,
		Options:     buffer.Options,
		Info:        buffer.Info,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	create_request := r.db.Model(&models.DeviceAttribute{}).Create(&newDeviceAttribute)
	if create_request.Error != nil {
		return create_request.Error
	}

	return nil
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
		"device_id":    buffer.DeviceId,
		"attribute_id": buffer.AttributeId,
		"options":      buffer.Options,
		"info":         buffer.Info,
		"updated_at":   time.Now(),
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
