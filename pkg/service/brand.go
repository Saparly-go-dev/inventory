package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type BrandService struct {
	repo repository.Brand
}

func NewBrandService(repo repository.Brand) *BrandService {
	return &BrandService{repo: repo}
}

func (s *BrandService) Create(buffer models.UpdateBrand) error {
	return s.repo.Create(buffer)
}

func (s *BrandService) GetPage(name string, pageSize, pageNumber int) (models.Paginator, error) {
	return s.repo.GetPage(name, pageSize, pageNumber)
}

func (s *BrandService) Update(id int, buffer models.UpdateBrand) error {
	return s.repo.Update(id, buffer)
}

func (s *BrandService) Delete(id int) error {
	return s.repo.Delete(id)
}

func (s *BrandService) GetBrandsInSelectedObjects(name string) ([]models.SelectedObject, error) {
	return s.repo.GetBrandsInSelectedObjects(name)
}
