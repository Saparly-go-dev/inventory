package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type EmployeeService struct {
	repo repository.Employee
}

func NewEmployeeService(repo repository.Employee) *EmployeeService {
	return &EmployeeService{repo: repo}
}

func (s *EmployeeService) Create(buffer models.UpdateEmployee) error {
	return s.repo.Create(buffer)
}

func (s *EmployeeService) GetPage(name string, roomNumbers []int, pageSize, pageNumber int) (models.Paginator, error) {
	return s.repo.GetPage(name, roomNumbers, pageSize, pageNumber)
}

func (s *EmployeeService) Update(id int, buffer models.UpdateEmployee) error {
	return s.repo.Update(id, buffer)
}

func (s *EmployeeService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *EmployeeService) GetEmployeesInSelectedObjects(name string) ([]models.SelectedObject, error) {
	return s.repo.GetEmployeesInSelectedObjects(name)
}

func (s *EmployeeService) GetById(id int) (models.Employee, error) {
	return s.repo.GetById(id)
}

func (s *EmployeeService) GetByIdWithDevices(id int) (models.EmployeeWithDevices, error) {
	return s.repo.GetByIdWithDevices(id)
}

func (s *EmployeeService) SyncEmployeesFromMySQL() error {
	return s.repo.SyncEmployeesFromMySQL()
}
