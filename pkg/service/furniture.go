package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type FurnitureService struct {
	repo repository.Furniture
}

func NewFurnitureService(repo repository.Furniture) *FurnitureService {
	return &FurnitureService{repo: repo}
}

func (s *FurnitureService) Create(buffer models.UpdateFurniture) error {
	return s.repo.Create(buffer)
}

func (s *FurnitureService) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	return s.repo.GetPage(name, pageSize, pageNumber)
}

func (s *FurnitureService) Update(id int, buffer models.UpdateFurniture) error {
	return s.repo.Update(id, buffer)
}

func (s *FurnitureService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *FurnitureService) GetById(id int) (models.Furniture, error) {
	return s.repo.GetById(id)
}

func (s *FurnitureService) GetAvailable() ([]models.Furniture, error) {
	return s.repo.GetAvailable()
}

func (s *FurnitureService) GetAllocations(furnitureID int) ([]models.FurnitureAllocation, error) {
	return s.repo.GetAllocations(furnitureID)
}

func (s *FurnitureService) Assign(input models.AssignFurnitureInput) error {
	return s.repo.Assign(input)
}

func (s *FurnitureService) Return(input models.ReturnFurnitureInput) error {
	return s.repo.Return(input)
}
