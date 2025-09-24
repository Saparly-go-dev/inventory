package repository

import (
	"errors"
	"inventory/models"
	"time"

	"gorm.io/gorm"
)

type BrandPostgres struct {
	db *gorm.DB
}

func NewBrandPostgres(db *gorm.DB) *BrandPostgres {
	return &BrandPostgres{db: db}
}

func (r *BrandPostgres) Create(buffer models.UpdateBrand) error {
	var is_have int64

	check_request := r.db.Model(&models.Brand{}).Where("name = ?", buffer.Name).Count(&is_have)
	if check_request.Error != nil {
		return check_request.Error
	}

	if is_have > 0 {
		return errors.New("Already exists")
	}

	newBrand := models.Brand{
		Name:        buffer.Name,
		Description: buffer.Description,
		Info:        buffer.Info,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	create_request := r.db.Model(&models.Brand{}).Create(&newBrand)
	if create_request.Error != nil {
		return create_request.Error
	}

	return nil
}
