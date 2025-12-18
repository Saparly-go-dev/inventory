package repository

import (
	"errors"
	"inventory/models"
	"time"

	"gorm.io/gorm"
)

type ModelPostgres struct {
	db *gorm.DB
}

func NewModelPostgres(db *gorm.DB) *ModelPostgres {
	return &ModelPostgres{db: db}
}

func (r *ModelPostgres) Create(buffer models.UpdateModel) error {
	var is_have int64

	check_request := r.db.Model(&models.Model{}).Where("name = ?", buffer.Name).Count(&is_have)
	if check_request.Error != nil {
		return check_request.Error
	}

	if is_have > 0 {
		return errors.New("Already exists")
	}

	newModel := models.Model{
		Name:        buffer.Name,
		Description: buffer.Description,
		BrandId:     buffer.BrandId,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	create_request := r.db.Model(&models.Model{}).Create(&newModel)
	if create_request.Error != nil {
		return create_request.Error
	}

	return nil
}

func (r *ModelPostgres) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	var page models.Paginator
	var list []models.Model
	var count int64

	offset := (pageNumber - 1) * pageSize

	get_list_request := r.db.Model(&models.Model{}).Preload("Brand")

	if len(name) > 0 {
		get_list_request = get_list_request.Where("name ILIKE ?", "%"+name+"%")
	}

	get_list_request.Count(&count)
	get_list_request.Offset(offset).Limit(pageSize).Find(&list)

	page = CreatePaginator(list, int(count), pageSize, pageNumber)
	return page, nil
}

func (r *ModelPostgres) Update(id int, buffer models.UpdateModel) error {
	var count int64

	check_request := r.db.Model(&models.Model{}).Where("id = ?", id).Count(&count)

	if check_request.Error != nil {
		return check_request.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	updateData := map[string]interface{}{
		"name":        buffer.Name,
		"description": buffer.Description,
		"brand_id":    buffer.BrandId,
		"updated_at":  time.Now(),
	}

	update_request := r.db.Model(&models.Model{}).Where("id = ?", id).Updates(updateData)
	if update_request.Error != nil {
		return update_request.Error
	}

	return nil
}

func (r *ModelPostgres) Delete(id int) error {
	var count int64

	check_request := r.db.Model(&models.Model{}).Where("id = ?", id).Count(&count)

	if check_request.Error != nil {
		return check_request.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	delete_request := r.db.Model(&models.Model{}).Where("id = ?", id).Delete(&models.Model{})
	if delete_request.Error != nil {
		return delete_request.Error
	}

	return nil
}

func (r *ModelPostgres) GetModelsInSelectedObjects(name string, brandId int) ([]models.SelectedObject, error) {
	var list []models.Model
	result := []models.SelectedObject{}

	get_request := r.db.Model(&models.Model{})

	if brandId > 0 {
		get_request = get_request.Where("brand_id = ?", brandId)
	}

	if len(name) > 0 {
		get_request = get_request.Where("name ILIKE ?", "%"+name+"%")
	}

	get_request.Find(&list)

	for _, item := range list {
		var element models.SelectedObject

		element.Id = item.Id
		element.Name = item.Name

		result = append(result, element)
	}

	return result, nil
}
