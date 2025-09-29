package repository

import (
	"errors"
	"inventory/models"
	"time"

	"gorm.io/gorm"
)

type DevicePostgres struct {
	db *gorm.DB
}

func NewDevicePostgres(db *gorm.DB) *DevicePostgres {
	return &DevicePostgres{db: db}
}

func (r *DevicePostgres) Create(buffer models.UpdateDevice) error {
	newDevice := models.Device{
		Name:        buffer.Name,
		Description: buffer.Description,
		Info:        buffer.Info,
		BrandId:     buffer.BrandId,
		ModelId:     buffer.ModelId,
		CategoryId:  buffer.CategoryId,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	create_request := r.db.Model(&models.Device{}).Create(&newDevice)
	if create_request.Error != nil {
		return create_request.Error
	}

	return nil
}

func (r *DevicePostgres) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	var page models.Paginator
	var list []models.Device
	var count int64

	offset := (pageNumber - 1) * pageSize

	get_list_request := r.db.Model(&models.Device{}).Preload("Brand").Preload("Model").Preload("Category").Preload("Attributes")

	if len(name) > 0 {
		get_list_request = get_list_request.Where("name ILIKE ?", "%"+name+"%")
	}

	get_list_request.Count(&count)
	get_list_request.Offset(offset).Limit(pageSize).Find(&list)

	page = CreatePaginator(list, int(count), pageSize, pageNumber)
	return page, nil
}

func (r *DevicePostgres) Update(id int, buffer models.UpdateDevice) error {
	var count int64

	check_request := r.db.Model(&models.Device{}).Where("id = ?", id).Count(&count)

	if check_request.Error != nil {
		return check_request.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	updateData := map[string]interface{}{
		"name":        buffer.Name,
		"description": buffer.Description,
		"info":        buffer.Info,
		"brand_id":    buffer.BrandId,
		"model_id":    buffer.ModelId,
		"category_id": buffer.CategoryId,
		"updated_at":  time.Now(),
	}

	update_request := r.db.Model(&models.Device{}).Where("id = ?", id).Updates(updateData)
	if update_request.Error != nil {
		return update_request.Error
	}

	return nil
}

func (r *DevicePostgres) Delete(id int) error {
	var count int64

	check_request := r.db.Model(&models.Device{}).Where("id = ?", id).Count(&count)

	if check_request.Error != nil {
		return check_request.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	delete_request := r.db.Model(&models.Device{}).Where("id = ?", id).Delete(&models.Device{})
	if delete_request.Error != nil {
		return delete_request.Error
	}

	return nil
}
