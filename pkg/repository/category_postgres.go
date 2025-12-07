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
	var is_have int64

	check_request := r.db.Model(&models.Category{}).Where("name = ?", buffer.Name).Count(&is_have)
	if check_request.Error != nil {
		return check_request.Error
	}

	if is_have > 0 {
		return errors.New("Already exists")
	}

	newCategory := models.Category{
		Name:        buffer.Name,
		Description: buffer.Description,
		Info:        buffer.Info,
		Icon:        buffer.Icon,
		ParentId:    buffer.ParentId,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	create_request := r.db.Model(&models.Category{}).Create(&newCategory)
	if create_request.Error != nil {
		return create_request.Error
	}

	return nil
}

func (r *CategoryPostgres) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	var page models.Paginator
	var list []models.Category
	var count int64

	offset := (pageNumber - 1) * pageSize

	get_list_request := r.db.Model(&models.Category{})

	if len(name) > 0 {
		get_list_request = get_list_request.Where("name ILIKE ?", "%"+name+"%")
	}

	get_list_request.Count(&count)
	get_list_request.Offset(offset).Limit(pageSize).Find(&list)

	page = CreatePaginator(list, int(count), pageSize, pageNumber)
	return page, nil
}

func (r *CategoryPostgres) Update(id int, buffer models.UpdateCategory) error {
	var count int64

	check_request := r.db.Model(&models.Category{}).Where("id = ?", id).Count(&count)

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
		"icon":        buffer.Icon,
		"parent_id":   buffer.ParentId,
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

	check_request := r.db.Model(&models.Category{}).Where("id = ?", id).Count(&count)

	if check_request.Error != nil {
		return check_request.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	delete_request := r.db.Model(&models.Category{}).Where("id = ?", id).Delete(&models.Category{})
	if delete_request.Error != nil {
		return delete_request.Error
	}

	return nil
}

func (r *CategoryPostgres) Select(name string) ([]models.SelectedObject, error) {
	var list []models.Category
	result := []models.SelectedObject{}
	fmt.Print("-", name)

	get_request := r.db.Model(&models.Category{})

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
