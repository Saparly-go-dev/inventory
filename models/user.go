package models

import "time"

type User struct {
	Id         int       `json:"-" db:"id"`
	Name       string    `json:"name" db:"name"`
	Surname    string    `json:"surname" db:"surname"`
	Patronymic string    `json:"patronymic" db:"patronymic"`
	Username   string    `json:"username" db:"username" binding:"required"`
	Password   string    `json:"password" db:"password" binding:"required"`
	Status     bool      `json:"status" db:"status"`
	Role       string    `json:"role" db:"role"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
}

type CreateUser struct {
	Id              int    `json:"id"`
	Name            string `json:"name"`
	Surname         string `json:"surname"`
	Patronymic      string `json:"patronymic"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
	Username        string `json:"username"`
	Role            string `json:"role"`
}

type Change_Password struct {
	UserId          int    `json:"user_id"`
	OldPassword     string `json:"old_password"`
	Password        string `json:"password"`
	ConfirmPassword string `json:"confirm_password"`
}

type ReadUser struct {
	Id         int    `json:"id"`
	Name       string `json:"name"`
	Surname    string `json:"surname"`
	Patronymic string `json:"patronymic"`
	Username   string `json:"username"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
	Role       string `json:"role"`
	Status     bool   `json:"status"`
}
