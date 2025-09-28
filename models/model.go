package models

import "time"

type Model struct {
	Id          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	BrandId     int       `json:"brand_id" db:"brand_id"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
	Brand       Brand     `json:"brand"   gorm:"foreignKey:BrandId;constraint:OnDelete:SET NULL;"`
}

type UpdateModel struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	BrandId     int    `json:"brand_id"`
}

type ReadBrand struct {
	Id          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	BrandId     int       `json:"brand_id"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
	Brand       string    `json:"brand"`
}
