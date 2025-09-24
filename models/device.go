package models

import "time"

type Device struct {
	Id          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Info        string    `json:"info" db:"info"`
	BrandId     int       `json:"brand_id" db:"brand_id"`
	ModelId     int       `json:"model_id" db:"model_id"`
	CategoryId  int       `json:"category_id" db:"category_id"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
	Brand       Brand     `json:"brand" gorm:"foreignKey:BrandId;constraint:OnDelete:SET NULL;"`
	Model       Model     `json:"model" gorm:"foreignKey:ModelId;constraint:OnDelete:SET NULL;"`
	Category    Category  `json:"category" gorm:"foreignKey:CategoryId;constraint:OnDelete:SET NULL;"`
}
