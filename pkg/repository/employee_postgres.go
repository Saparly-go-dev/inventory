package repository

import (
	"errors"
	"inventory/models"

	"gorm.io/gorm"
)

type EmployeePostgres struct {
	db *gorm.DB
}

func NewEmployeePostgres(db *gorm.DB) *EmployeePostgres {
	return &EmployeePostgres{db: db}
}

func (r *EmployeePostgres) Create(buffer models.Employee) error {
	var isHave int64

	if len(buffer.FullName) > 0 {
		checkRequest := r.db.Model(&models.Employee{}).Where("full_name = ?", buffer.FullName).Count(&isHave)
		if checkRequest.Error != nil {
			return checkRequest.Error
		}
		if isHave > 0 {
			return errors.New("Already exists")
		}
	}

	newEmployee := models.Employee{
		FullName:   buffer.FullName,
		Position:   buffer.Position,
		Department: buffer.Department,
		Email:      buffer.Email,
		Phone:      buffer.Phone,
	}

	createRequest := r.db.Model(&models.Employee{}).Create(&newEmployee)
	if createRequest.Error != nil {
		return createRequest.Error
	}

	return nil
}

func (r *EmployeePostgres) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	var page models.Paginator
	var list []models.Employee
	var count int64

	offset := (pageNumber - 1) * pageSize

	getListRequest := r.db.Model(&models.Employee{})

	if len(name) > 0 {
		getListRequest = getListRequest.Where("full_name ILIKE ?", "%"+name+"%")
	}

	getListRequest.Count(&count)
	getListRequest.Offset(offset).Limit(pageSize).Find(&list)

	page = CreatePaginator(list, int(count), pageSize, pageNumber)
	return page, nil
}

func (r *EmployeePostgres) Update(id int, buffer models.Employee) error {
	var count int64

	checkRequest := r.db.Model(&models.Employee{}).Where("id = ?", id).Count(&count)
	if checkRequest.Error != nil {
		return checkRequest.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	updateData := map[string]interface{}{
		"full_name":  buffer.FullName,
		"position":   buffer.Position,
		"department": buffer.Department,
		"email":      buffer.Email,
		"phone":      buffer.Phone,
	}

	updateRequest := r.db.Model(&models.Employee{}).Where("id = ?", id).Updates(updateData)
	if updateRequest.Error != nil {
		return updateRequest.Error
	}

	return nil
}

func (r *EmployeePostgres) Delete(id int) error {
	var count int64

	checkRequest := r.db.Model(&models.Employee{}).Where("id = ?", id).Count(&count)
	if checkRequest.Error != nil {
		return checkRequest.Error
	}

	if count == 0 {
		return errors.New("Not Found")
	}

	deleteRequest := r.db.Model(&models.Employee{}).Where("id = ?", id).Delete(&models.Employee{})
	if deleteRequest.Error != nil {
		return deleteRequest.Error
	}

	return nil
}

func (r *EmployeePostgres) GetEmployeesInSelectedObjects(name string) ([]models.SelectedObject, error) {
	var list []models.Employee
	result := []models.SelectedObject{}

	getRequest := r.db.Model(&models.Employee{})

	if len(name) > 0 {
		getRequest = getRequest.Where("full_name ILIKE ?", "%"+name+"%")
	}

	getRequest.Find(&list)

	for _, item := range list {
		var element models.SelectedObject

		element.Id = item.Id
		element.Name = item.FullName

		result = append(result, element)
	}

	return result, nil
}
