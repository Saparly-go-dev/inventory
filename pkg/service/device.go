package service

import (
	"inventory/models"
	"inventory/pkg/repository"
	"mime/multipart"

	"github.com/xuri/excelize/v2"

	"strings"
)

type DeviceService struct {
	repo         repository.Device
	brandRepo    repository.Brand
	modelRepo    repository.Model
	categoryRepo repository.Category
}

func NewDeviceService(repo repository.Device, brandRepo repository.Brand, modelRepo repository.Model, categoryRepo repository.Category) *DeviceService {
	return &DeviceService{
		repo:         repo,
		brandRepo:    brandRepo,
		modelRepo:    modelRepo,
		categoryRepo: categoryRepo,
	}
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

func (s *DeviceService) GetById(id int) (models.Device, error) {
	return s.repo.GetById(id)
}

func (s *DeviceService) Clone(id, count int) error {
	device, err := s.repo.GetById(id)
	if err != nil {
		return err
	}

	attributes := make([]models.UpdateDeviceAttribute, 0)
	for _, attr := range device.Attributes {
		attributes = append(attributes, models.UpdateDeviceAttribute{
			AttributeId: attr.AttributeId,
			Options:     attr.Options,
			Info:        attr.Info,
		})
	}

	createInput := models.UpdateDevice{
		Name:        device.Name,
		Description: device.Description,
		Info:        device.Info,
		Photo:       device.Photo,
		Status:      device.Status,
		BrandId:     device.BrandId,
		ModelId:     device.ModelId,
		CategoryId:  device.CategoryId,
		Attributes:  attributes,
	}

	for i := 0; i < count; i++ {
		if err := s.repo.Create(createInput); err != nil {
			return err
		}
	}

	return nil
}

func (s *DeviceService) Import(file multipart.File) error {
	f, err := excelize.OpenReader(file)
	if err != nil {
		return err
	}
	defer f.Close()

	rows, err := f.GetRows("Sheet1")
	if err != nil {
		return err
	}

	// Helper to load maps
	brands, err := s.brandRepo.GetBrandsInSelectedObjects("")
	if err != nil {
		return err
	}
	brandMap := make(map[string]int)
	for _, b := range brands {
		brandMap[strings.ToLower(b.Name)] = b.Id
	}

	deviceModels, err := s.modelRepo.GetModelsInSelectedObjects("", 0)
	if err != nil {
		return err
	}
	modelMap := make(map[string]int)
	for _, m := range deviceModels {
		modelMap[strings.ToLower(m.Name)] = m.Id
	}

	categories, err := s.categoryRepo.Select("")
	if err != nil {
		return err
	}
	categoryMap := make(map[string]int)
	for _, c := range categories {
		categoryMap[strings.ToLower(c.Name)] = c.Id
	}

	// Skip header row
	for i, row := range rows {
		if i == 0 {
			continue // Header: Name, Description, Info, Status, Brand, Model, Category
		}
		if len(row) < 7 {
			continue
		}

		name := row[0]
		desc := row[1]
		info := row[2]
		status := row[3] // in_stock, assigned, etc. map this?
		brandName := row[4]
		modelName := row[5]
		categoryName := row[6]

		if name == "" {
			continue
		}

		brandId, ok := brandMap[strings.ToLower(brandName)]
		if !ok {
			// Optional: Try create? For now just skip or error.
			continue
		}

		modelId, ok := modelMap[strings.ToLower(modelName)]
		if !ok {
			continue
		}

		categoryId, ok := categoryMap[strings.ToLower(categoryName)]
		if !ok {
			continue
		}

		validStatuses := map[string]bool{"in_stock": true, "assigned": true, "repair": true, "written_off": true}
		if !validStatuses[status] {
			status = "in_stock"
		}

		device := models.UpdateDevice{
			Name:        name,
			Description: desc,
			Info:        info,
			Status:      status,
			BrandId:     brandId,
			ModelId:     modelId,
			CategoryId:  categoryId,
		}

		if err := s.repo.Create(device); err != nil {
			return err
		}
	}

	return nil
}
