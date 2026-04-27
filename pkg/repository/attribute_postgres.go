package repository

import (
	"errors"
	"inventory/models"
	"time"

	"gorm.io/gorm"
)

type AttributePostgres struct {
	db *gorm.DB
}

func NewAttributePostgres(db *gorm.DB) *AttributePostgres {
	return &AttributePostgres{db: db}
}

func (r *AttributePostgres) Create(buffer models.UpdateAttribute) error {
	var is_have int64

	check_request := r.db.Model(&models.Attribute{}).Where("name = ?", buffer.Name).Count(&is_have)
	if check_request.Error != nil {
		return check_request.Error
	}

	if is_have > 0 {
		return errors.New("Already exists")
	}

	newAttribute := models.Attribute{
		Name:        buffer.Name,
		Description: buffer.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	create_request := r.db.Model(&models.Attribute{}).Create(&newAttribute)
	if create_request.Error != nil {
		return create_request.Error
	}

	return nil
}

func (r *AttributePostgres) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	var page models.Paginator
	var list []models.Attribute
	var count int64

	offset := (pageNumber - 1) * pageSize

	get_list_request := r.db.Model(&models.Attribute{})

	if len(name) > 0 {
		get_list_request = get_list_request.Where("name ILIKE ?", "%"+name+"%")
	}

	get_list_request.Count(&count)
	get_list_request.Order("id desc").Offset(offset).Limit(pageSize).Find(&list)

	page = CreatePaginator(list, int(count), pageSize, pageNumber)
	return page, nil
}

func (r *AttributePostgres) Update(id int, buffer models.UpdateAttribute) error {
	var count int64

	check_request := r.db.Model(&models.Attribute{}).Where("id = ?", id).Count(&count)

	if check_request.Error != nil {
		return check_request.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	updateData := map[string]interface{}{
		"name":        buffer.Name,
		"description": buffer.Description,
		"updated_at":  time.Now(),
	}

	update_request := r.db.Model(&models.Attribute{}).Where("id = ?", id).Updates(updateData)
	if update_request.Error != nil {
		return update_request.Error
	}

	return nil
}

func (r *AttributePostgres) Delete(id int) error {
	var count int64

	check_request := r.db.Model(&models.Attribute{}).Where("id = ?", id).Count(&count)

	if check_request.Error != nil {
		return check_request.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	delete_request := r.db.Model(&models.Attribute{}).Where("id = ?", id).Delete(&models.Attribute{})
	if delete_request.Error != nil {
		return delete_request.Error
	}

	return nil
}

func (r *AttributePostgres) GetAttributesInSelectedObjects(name string) ([]models.SelectedObject, error) {
	var list []models.Attribute
	var result []models.SelectedObject

	get_request := r.db.Model(&models.Attribute{})

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

	if len(result) == 0 {
		result = []models.SelectedObject{}
	}

	return result, nil
}
