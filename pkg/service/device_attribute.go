package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type DeviceAttributeService struct {
	repo repository.DeviceAttribute
}

func NewDeviceAttributeService(repo repository.DeviceAttribute) *DeviceAttributeService {
	return &DeviceAttributeService{repo: repo}
}

func (s *DeviceAttributeService) Create(buffer models.UpdateDeviceAttribute) error {
	return s.repo.Create(buffer)
}

func (s *DeviceAttributeService) Update(id int, buffer models.UpdateDeviceAttribute) error {
	return s.repo.Update(id, buffer)
}

func (s *DeviceAttributeService) Delete(id int) error {
	return s.repo.Delete(id)
}
