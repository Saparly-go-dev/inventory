package models

import "time"

type Brand struct {
	Id          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Info        string    `json:"info" db:"info"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time `json:"updatedAt" db:"updated_at"`
}

type UpdateBrand struct {
	Name        string `json:"name" db:"name"`
	Description string `json:"description" db:"description"`
	Info        string `json:"info" db:"info"`
}

type SelectedObject struct {
	Id   int    `json:"id"`
	Name string `json:"name"`
}
