package service

import (
	"inventory/pkg/repository"
)

type DashboardService struct {
	repo repository.Dashboard
}

func NewDashboardService(repo repository.Dashboard) *DashboardService {
	return &DashboardService{repo: repo}
}

func (s *DashboardService) GetAllDevices(filters repository.DeviceFilters) ([]repository.DashboardDevice, error) {
	return s.repo.GetAllDevices(filters)
}

func (s *DashboardService) ExportAllDevicesToExcel(filters repository.DeviceFilters) ([]byte, error) {
	devices, err := s.repo.GetAllDevices(filters)
	if err != nil {
		return nil, err
	}
	return s.repo.ExportAllDevicesToExcel(devices)
}
