package models

import "time"

type DeviceAttribute struct {
	Id          int       `json:"id" db:"id"`
	DeviceId    int       `json:"device_id" db:"device_id"`
	AttributeId int       `json:"attribute_id" db:"attribute_id"`
	Attribute   Attribute `json:"attribute" gorm:"foreignKey:AttributeId"`
	Options     string    `json:"options" db:"options"`
	Info        string    `json:"info" db:"info"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type UpdateDeviceAttribute struct {
	DeviceId    int    `json:"device_id"`
	AttributeId int    `json:"attribute_id"`
	Options     string `json:"options"`
	Info        string `json:"info"`
}
