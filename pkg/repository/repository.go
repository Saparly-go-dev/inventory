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
	GetById(id int) (models.User, error)
	GetUserPage(pageSize, pageNumber int, name, surname, patronymic, username string) (models.Paginator, error)
	ChangeStatus(id int) error
	Delete(id int) error
	Update(id int, update_user models.CreateUser) error
	ChangePassword(data models.Change_Password) error
}

type Role interface {
	Create(buffer models.UpdateRole) error
	GetPage(search string, pageSize, pageNumber int) (models.Paginator, error)
	GetAllSelected() ([]models.SelectedRole, error)
	GetByCode(code string) (models.Role, error)
	Update(id int, buffer models.UpdateRole) error
	Delete(id int) error
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
	GetById(id int) (models.Device, error)
}

type DeviceAttribute interface {
	Create(buffer models.UpdateDeviceAttribute) error
	Update(id int, buffer models.UpdateDeviceAttribute) error
	Delete(id int) error
}

type Furniture interface {
	Create(buffer models.UpdateFurniture) error
	GetPage(name string, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateFurniture) error
	Delete(id int) error
	GetById(id int) (models.Furniture, error)
	GetAvailable() ([]models.Furniture, error)
	GetAllocations(furnitureID int) ([]models.FurnitureAllocation, error)
	Assign(input models.AssignFurnitureInput) error
	Return(input models.ReturnFurnitureInput) error
}

type Employee interface {
	Create(buffer models.UpdateEmployee) error
	GetPage(name string, roomNumbers []int, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateEmployee) error
	Delete(id int) error
	GetEmployeesInSelectedObjects(name string) ([]models.SelectedObject, error)
	GetById(id int) (models.Employee, error)
	GetByIdWithDevices(id int) (models.EmployeeWithDevices, error)
	SyncEmployeesFromMySQL() error
}

type DeviceAssignment interface {
	AssignDeviceToEmployee(deviceId, employeeId int) error
	ReturnDeviceFromEmployee(deviceId, employeeId int) error
	GetEmployeeDevices(employeeId int) ([]models.Device, error)
	GetAvailableDevices() ([]models.Device, error)
	GetAvailableDevicesPage(pageSize, pageNumber int) (models.Paginator, error)
}

type Dashboard interface {
	GetAllDevices(filters DeviceFilters) ([]DashboardDevice, error)
	ExportAllDevicesToExcel(devices []DashboardDevice) ([]byte, error)
}

type Statistics interface {
	GetStatistics() (StatisticsData, error)
}

type Repository struct {
	User
	Role
	Authorization
	Brand
	Category
	Model
	Attribute
	Device
	DeviceAttribute
	Furniture
	Employee
	DeviceAssignment
	Dashboard
	Statistics
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{
		Authorization:    NewAuthPostgres(db),
		User:             NewUserPostgres(db),
		Role:             NewRolePostgres(db),
		Brand:            NewBrandPostgres(db),
		Category:         NewCategoryPostgres(db),
		Model:            NewModelPostgres(db),
		Attribute:        NewAttributePostgres(db),
		Device:           NewDevicePostgres(db),
		DeviceAttribute:  NewDeviceAttributePostgres(db),
		Furniture:        NewFurniturePostgres(db),
		Employee:         NewEmployeePostgres(db),
		DeviceAssignment: NewDeviceAssignmentPostgres(db),
		Dashboard:        NewDashboardPostgres(db),
		Statistics:       NewStatisticsPostgres(db),
	}
}
