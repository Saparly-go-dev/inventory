package models

import "time"

type Category struct {
	Id          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description" db:"description"`
	Icon        string    `json:"icon" db:"icon"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
	ParentId    int       `json:"parent_id" db:"parent_id"`
	DeletedAt   time.Time `json:"deleted_at" db:"deleted_at"`
	Parent      *Category `json:"parent" db:"-"`
}
