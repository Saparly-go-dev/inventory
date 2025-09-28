package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type AttributeService struct {
	repo repository.Attribute
}

func NewAttributeService(repo repository.Attribute) *AttributeService {
	return &AttributeService{repo: repo}
}

func (s *AttributeService) Create(buffer models.UpdateAttribute) error {
	return s.repo.Create(buffer)
}

func (s *AttributeService) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	return s.repo.GetPage(name, pageSize, pageNumber)
}

func (s *AttributeService) Update(id int, buffer models.UpdateAttribute) error {
	return s.repo.Update(id, buffer)
}

func (s *AttributeService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *AttributeService) GetAttributesInSelectedObjects(name string) ([]models.SelectedObject, error) {
	return s.repo.GetAttributesInSelectedObjects(name)
}
