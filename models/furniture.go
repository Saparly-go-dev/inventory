package models

import "time"

type Furniture struct {
	Id                int                   `json:"id" db:"id"`
	Name              string                `json:"name" db:"name"`
	Description       string                `json:"description" db:"description"`
	Info              string                `json:"info" db:"info"`
	Photo             string                `json:"photo" db:"photo"`
	CategoryId        int                   `json:"category_id" db:"category_id"`
	TotalQuantity     int                   `json:"total_quantity" db:"total_quantity"`
	AllocatedQuantity int                   `json:"allocated_quantity" gorm:"-"`
	AvailableQuantity int                   `json:"available_quantity" gorm:"-"`
	CreatedAt         time.Time             `json:"createdAt" db:"created_at"`
	UpdatedAt         time.Time             `json:"updatedAt" db:"updated_at"`
	Category          Category              `json:"category" gorm:"foreignKey:CategoryId;constraint:OnDelete:SET NULL;"`
	Allocations       []FurnitureAllocation `json:"allocations,omitempty" gorm:"foreignKey:FurnitureID;constraint:OnDelete:CASCADE;"`
}

type UpdateFurniture struct {
	Name          string `json:"name"`
	Description   string `json:"description"`
	Info          string `json:"info"`
	Photo         string `json:"photo"`
	CategoryId    int    `json:"category_id"`
	TotalQuantity int    `json:"total_quantity"`
}
