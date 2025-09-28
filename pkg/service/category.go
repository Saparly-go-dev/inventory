package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type CategoryService struct {
	repo repository.Category
}

func NewCategoryService(repo repository.Category) *CategoryService {
	return &CategoryService{repo: repo}
}

func (s *CategoryService) Create(buffer models.UpdateCategory) error {
	return s.repo.Create(buffer)
}

func (s *CategoryService) Update(id int, buffer models.UpdateCategory) error {
	return s.repo.Update(id, buffer)
}

func (s *CategoryService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *CategoryService) Select(name string) ([]models.SelectedObject, error) {
	return s.repo.Select(name)
}
