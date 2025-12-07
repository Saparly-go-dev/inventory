package models

type Employee struct {
	Id         int    `json:"id" db:"id"`
	FullName   string `json:"full_name" db:"full_name"`
	Position   string `json:"position" db:"position"`
	Department string `json:"department" db:"department"`
	Email      string `json:"email" db:"email"`
	Phone      string `json:"phone" db:"phone"`
}
