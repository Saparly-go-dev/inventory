package models

import "time"

type DeviceAssignment struct {
	ID         int        `json:"id" gorm:"primaryKey"`
	DeviceID   int        `json:"device_id"`
	EmployeeID int        `json:"employee_id"`
	AssignedAt time.Time  `json:"assigned_at"`
	ReturnedAt *time.Time `json:"returned_at,omitempty"`
}
