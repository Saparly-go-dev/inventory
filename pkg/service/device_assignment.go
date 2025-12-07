package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type DeviceAssignmentService struct {
	repo repository.DeviceAssignment
}

func NewDeviceAssignmentService(repo repository.DeviceAssignment) *DeviceAssignmentService {
	return &DeviceAssignmentService{repo: repo}
}

func (s *DeviceAssignmentService) AssignDeviceToEmployee(deviceId, employeeId int) error {
	return s.repo.AssignDeviceToEmployee(deviceId, employeeId)
}

func (s *DeviceAssignmentService) ReturnDeviceFromEmployee(deviceId, employeeId int) error {
	return s.repo.ReturnDeviceFromEmployee(deviceId, employeeId)
}

func (s *DeviceAssignmentService) GetEmployeeDevices(employeeId int) ([]models.Device, error) {
	return s.repo.GetEmployeeDevices(employeeId)
}

func (s *DeviceAssignmentService) GetAvailableDevices() ([]models.Device, error) {
	return s.repo.GetAvailableDevices()
}
