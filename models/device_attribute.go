package models

type DeviceAttribute struct {
	Id          int    `json:"id" db:"id"`
	DeviceId    string `json:"device_id" db:"device_id"`
	AttributeId int    `json:"attribute_id" db:"attribute_id"`
	Options     string `json:"options" db:"options"`
	Info        string `json:"info" db:"info"`
	CreatedAt   string `json:"created_at" db:"created_at"`
	UpdatedAt   string `json:"updated_at" db:"updated_at"`
}

type UpdateDeviceAttribute struct {
	DeviceId    int    `json:"device_id"`
	AttributeId int    `json:"attribute_id"`
	Options     string `json:"options"`
	Info        string `json:"info"`
}
