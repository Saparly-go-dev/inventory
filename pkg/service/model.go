package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type ModelService struct {
	repo repository.Model
}

func NewModelService(repo repository.Model) *ModelService {
	return &ModelService{repo: repo}
}

func (s *ModelService) Create(buffer models.UpdateModel) error {
	return s.repo.Create(buffer)
}

func (s *ModelService) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	return s.repo.GetPage(name, pageSize, pageNumber)
}

func (s *ModelService) Update(id int, buffer models.UpdateModel) error {
	return s.repo.Update(id, buffer)
}

func (s *ModelService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *ModelService) GetModelsInSelectedObjects(name string) ([]models.SelectedObject, error) {
	return s.repo.GetModelsInSelectedObjects(name)
}
