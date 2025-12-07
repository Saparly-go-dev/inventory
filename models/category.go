package models

import "time"

type Category struct {
	Id          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Info        string    `json:"info" db:"info"`
	Icon        string    `json:"icon" db:"icon"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	ParentId    *int      `json:"parent_id" db:"parent_id"`
	Parent      *Category `json:"parent" db:"-"`
}

type UpdateCategory struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Info        string `json:"info"`
	Icon        string `json:"icon"`
	ParentId    *int   `json:"parent_id"`
}

type ReadCategory struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Info        string    `json:"info"`
	Icon        string    `json:"icon"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	ParentId    int       `json:"parent_id"`
	Parent      string    `json:"parent"`
}
