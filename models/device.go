package models

import "time"

type Device struct {
	Id          int               `json:"id" db:"id"`
	Name        string            `json:"name" db:"name"`
	Description string            `json:"description" db:"description"`
	Info        string            `json:"info" db:"info"`
	Photo       string            `json:"photo" db:"photo"`
	Status      string            `json:"status" db:"status"` //in_stock, assigned, repair, written_off
	BrandId     int               `json:"brand_id" db:"brand_id"`
	ModelId     int               `json:"model_id" db:"model_id"`
	CategoryId  int               `json:"category_id" db:"category_id"`
	CreatedAt   time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time         `json:"updatedAt" db:"updated_at"`
	Brand       Brand             `json:"brand" gorm:"foreignKey:BrandId;constraint:OnDelete:SET NULL;"`
	Model       Model             `json:"model" gorm:"foreignKey:ModelId;constraint:OnDelete:SET NULL;"`
	Category    Category          `json:"category" gorm:"foreignKey:CategoryId;constraint:OnDelete:SET NULL;"`
	Attributes  []DeviceAttribute `json:"attributes" gorm:"foreignKey:DeviceId;constraint:OnDelete:CASCADE;"`
}

type UpdateDevice struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Info        string `json:"info"`
	Photo       string `json:"photo"`
	Status      string `json:"status"`
	BrandId     int    `json:"brand_id"`
	ModelId     int    `json:"model_id"`
	CategoryId  int    `json:"category_id"`
}
