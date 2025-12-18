package repository

import (
	"inventory/models"

	"gorm.io/gorm"
)

type Authorization interface {
	Get(username, password string) (models.User, error)
}

type User interface {
	Create(create_user models.CreateUser) error
	GetUserPage(pageSize, pageNumber int, name, surname, patronymic, username string) (models.Paginator, error)
	ChangeStatus(id int) error
	Delete(id int) error
	Update(id int, update_user models.CreateUser) error
	ChangePassword(data models.Change_Password) error
}

type Brand interface {
	Create(buffer models.UpdateBrand) error
	GetPage(name string, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateBrand) error
	Delete(id int) error
	GetBrandsInSelectedObjects(name string) ([]models.SelectedObject, error)
}

type Model interface {
	Create(buffer models.UpdateModel) error
	GetPage(name string, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateModel) error
	Delete(id int) error
	GetModelsInSelectedObjects(name string, brandId int) ([]models.SelectedObject, error)
}

type Category interface {
	Create(buffer models.UpdateCategory) error
	GetPage(name string, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateCategory) error
	Delete(id int) error
	Select(name string) ([]models.SelectedObject, error)
}

type Attribute interface {
	Create(buffer models.UpdateAttribute) error
	GetPage(name string, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateAttribute) error
	Delete(id int) error
	GetAttributesInSelectedObjects(name string) ([]models.SelectedObject, error)
}

type Device interface {
	Create(buffer models.UpdateDevice) error
	GetPage(name string, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateDevice) error
	Delete(id int) error
}

type DeviceAttribute interface {
	Create(buffer models.UpdateDeviceAttribute) error
	Update(id int, buffer models.UpdateDeviceAttribute) error
	Delete(id int) error
}

type Employee interface {
	Create(buffer models.UpdateEmployee) error
	GetPage(name string, roomNumbers []int, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateEmployee) error
	Delete(id int) error
	GetEmployeesInSelectedObjects(name string) ([]models.SelectedObject, error)
}

type DeviceAssignment interface {
	AssignDeviceToEmployee(deviceId, employeeId int) error
	ReturnDeviceFromEmployee(deviceId, employeeId int) error
	GetEmployeeDevices(employeeId int) ([]models.Device, error)
	GetAvailableDevices() ([]models.Device, error)
}

type Repository struct {
	User
	Authorization
	Brand
	Category
	Model
	Attribute
	Device
	DeviceAttribute
	Employee
	DeviceAssignment
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{
		Authorization:    NewAuthPostgres(db),
		User:             NewUserPostgres(db),
		Brand:            NewBrandPostgres(db),
		Category:         NewCategoryPostgres(db),
		Model:            NewModelPostgres(db),
		Attribute:        NewAttributePostgres(db),
		Device:           NewDevicePostgres(db),
		DeviceAttribute:  NewDeviceAttributePostgres(db),
		Employee:         NewEmployeePostgres(db),
		DeviceAssignment: NewDeviceAssignmentPostgres(db),
	}
}
