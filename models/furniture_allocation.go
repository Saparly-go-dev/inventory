package models

import "time"

type FurnitureAllocation struct {
	ID          int        `json:"id" gorm:"primaryKey"`
	FurnitureID int        `json:"furniture_id"`
	EmployeeID  *int       `json:"employee_id,omitempty"`
	RoomNumber  *int       `json:"room_number,omitempty"`
	Quantity    int        `json:"quantity"`
	AssignedAt  time.Time  `json:"assigned_at"`
	ReturnedAt  *time.Time `json:"returned_at,omitempty"`
	Employee    *Employee  `json:"employee,omitempty" gorm:"foreignKey:EmployeeID;constraint:OnDelete:SET NULL;"`
}

type AssignFurnitureInput struct {
	FurnitureID int  `json:"furniture_id"`
	EmployeeID  *int `json:"employee_id"`
	RoomNumber  *int `json:"room_number"`
	Quantity    int  `json:"quantity"`
}

type ReturnFurnitureInput struct {
	AllocationID int `json:"allocation_id"`
	Quantity     int `json:"quantity"`
}
