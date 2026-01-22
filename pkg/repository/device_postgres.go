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
	// Начало транзакции. Это гарантирует, что все операции будут выполнены как единое целое.
	err := r.db.Transaction(func(tx *gorm.DB) error {
		// Создание основной модели устройства из полученных данных.
		newDevice := models.Device{
			Name:        buffer.Name,
			Description: buffer.Description,
			Info:        buffer.Info,
			Photo:       buffer.Photo, // Путь к файлу, сохраненный на шаге 3
			BrandId:     buffer.BrandId,
			ModelId:     buffer.ModelId,
			CategoryId:  buffer.CategoryId,
			Status:      "in_stock", // Статус по умолчанию
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		// Выполнение SQL INSERT для таблицы 'devices'.
		if err := tx.Model(&models.Device{}).Create(&newDevice).Error; err != nil {
			return err // Если ошибка, транзакция будет отменена.
		}

		// Если были переданы атрибуты, они также добавляются в базу.
		if len(buffer.Attributes) > 0 {
			for _, attr := range buffer.Attributes {
				newDeviceAttribute := models.DeviceAttribute{
					DeviceId:    newDevice.Id, // ID только что созданного устройства
					AttributeId: attr.AttributeId,
					Options:     attr.Options,
					Info:        attr.Info,
					CreatedAt:   time.Now(),
					UpdatedAt:   time.Now(),
				}
				// Выполнение SQL INSERT для таблицы 'device_attributes'.
				if err := tx.Model(&models.DeviceAttribute{}).Create(&newDeviceAttribute).Error; err != nil {
					return err // Если ошибка, транзакция будет отменена.
				}
			}
		}

		// Если все прошло без ошибок, возвращаем nil.
		return nil
	})

	// Возвращаем результат транзакции.
	return err
}

func (r *DevicePostgres) GetById(id int) (models.Device, error) {
	var device models.Device
	if err := r.db.Preload("Attributes").Where("id = ?", id).First(&device).Error; err != nil {
		return models.Device{}, err
	}
	return device, nil
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
	err := r.db.Transaction(func(tx *gorm.DB) error {
		var count int64
		if err := tx.Model(&models.Device{}).Where("id = ?", id).Count(&count).Error; err != nil {
			return err
		}
		if count == 0 {
			return errors.New("device not found")
		}

		updateData := map[string]interface{}{
			"name":        buffer.Name,
			"description": buffer.Description,
			"info":        buffer.Info,
			"photo":       buffer.Photo,
			"brand_id":    buffer.BrandId,
			"model_id":    buffer.ModelId,
			"category_id": buffer.CategoryId,
			"status":      buffer.Status,
			"updated_at":  time.Now(),
		}

		if err := tx.Model(&models.Device{}).Where("id = ?", id).Updates(updateData).Error; err != nil {
			return err
		}

		if err := tx.Where("device_id = ?", id).Delete(&models.DeviceAttribute{}).Error; err != nil {
			return err
		}

		if len(buffer.Attributes) > 0 {
			for _, attr := range buffer.Attributes {
				newDeviceAttribute := models.DeviceAttribute{
					DeviceId:    id,
					AttributeId: attr.AttributeId,
					Options:     attr.Options,
					Info:        attr.Info,
					CreatedAt:   time.Now(),
					UpdatedAt:   time.Now(),
				}
				if err := tx.Model(&models.DeviceAttribute{}).Create(&newDeviceAttribute).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})

	return err
}

func (r *DevicePostgres) Delete(id int) error {
	// The GORM model has `constraint:OnDelete:CASCADE` for attributes,
	// so the database will automatically delete related device_attribute records.
	result := r.db.Where("id = ?", id).Delete(&models.Device{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("device not found")
	}

	return nil
}
