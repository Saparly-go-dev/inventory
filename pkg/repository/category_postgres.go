package repository

import (
	"errors"
	"fmt"
	"inventory/models"
	"time"

	"gorm.io/gorm"
)

type CategoryPostgres struct {
	db *gorm.DB
}

func NewCategoryPostgres(db *gorm.DB) *CategoryPostgres {
	return &CategoryPostgres{db: db}
}

func (r *CategoryPostgres) Create(buffer models.UpdateCategory) error {
	var count int64

	is_already_have_request := r.db.Model(&models.Category{}).Where("name = ?", buffer.Name).Count(&count)

	if is_already_have_request.Error != nil {
		return is_already_have_request.Error
	}

	if count == 0 {
		return errors.New("category already exist")
	}

	newCategory := models.Category{
		Name:        buffer.Name,
		Description: buffer.Description,
		Info:        buffer.Info,
		Icon:        buffer.Icon,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		ParentId:    buffer.ParentId,
	}

	create_request := r.db.Model(&models.Category{}).Create(&newCategory)
	if create_request.Error != nil {
		return create_request.Error
	}

	return nil
}

func (r *CategoryPostgres) Update(id int, buffer models.UpdateCategory) error {
	var count int64

	is_have_request := r.db.Model(&models.Category{}).Where("id = ?", id).Count(&count)
	if is_have_request.Error != nil {
		return is_have_request.Error
	}

	if count == 0 {
		return errors.New("category does not exist")
	}

	is_already_have_request := r.db.Model(&models.Category{}).Where("id != ?", id).
		Where("name = ?", buffer.Name).Count(&count)

	if is_already_have_request.Error != nil {
		return is_already_have_request.Error
	}

	if count == 0 {
		return errors.New("category name already exist")
	}

	updateData := map[string]interface{}{
		"name":        buffer.Name,
		"description": buffer.Description,
		"info":        buffer.Info,
		"icon":        buffer.Icon,
		"updated_at":  time.Now(),
	}

	update_request := r.db.Model(&models.Category{}).Where("id = ?", id).Updates(updateData)
	if update_request.Error != nil {
		return update_request.Error
	}

	return nil
}

func (r *CategoryPostgres) Delete(id int) error {
	var count int64

	is_have_request := r.db.Model(&models.Category{}).Where("id = ?", id).Count(&count)
	if is_have_request.Error != nil {
		return is_have_request.Error
	}

	if count == 0 {
		return errors.New("category does not exist")
	}

	delete_request := r.db.Model(&models.Category{}).Where("id = ?", id).Delete(&models.Category{})
	if delete_request.Error != nil {
		return delete_request.Error
	}

	return nil
}

func (r *CategoryPostgres) Select(name string) ([]models.SelectedObject, error) {
	var categories []models.Category
	result := []models.SelectedObject{}

	get_categories_request := r.db.Model(&models.Category{}).Where("name ILIKE ?", "%"+name+"%").Find(&categories)

	if get_categories_request.Error != nil {
		fmt.Println(get_categories_request.Error)
	}

	for _, item := range categories {
		var data models.SelectedObject

		data.Id = item.Id
		data.Name = item.Name

		result = append(result, data)
	}

	return result, nil

}
