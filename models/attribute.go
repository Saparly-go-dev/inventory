package models

import "time"

type Attribute struct {
	Id          int               `json:"id" db:"id"`
	Name        string            `json:"name" db:"name"`
	Description string            `json:"description" db:"description"`
	CreatedAt   time.Time         `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time         `json:"updatedAt" db:"updated_at"`
	Devices     []DeviceAttribute `json:"devices" gorm:"foreignKey:AttributeId;constraint:OnDelete:CASCADE;"`
}

type UpdateAttribute struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}
