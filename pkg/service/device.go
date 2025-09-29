package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type DeviceService struct {
	repo repository.Device
}

func NewDeviceService(repo repository.Device) *DeviceService {
	return &DeviceService{repo: repo}
}

func (s *DeviceService) Create(buffer models.UpdateDevice) error {
	return s.repo.Create(buffer)
}

func (s *DeviceService) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	return s.repo.GetPage(name, pageSize, pageNumber)
}

func (s *DeviceService) Update(id int, buffer models.UpdateDevice) error {
	return s.repo.Update(id, buffer)
}

func (s *DeviceService) Delete(id int) error {
	return s.repo.Delete(id)
}
