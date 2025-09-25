package repository

import (
	"inventory/models"

	"gorm.io/gorm"
)

type Authorization interface {
	Get(username, password string) (models.User, error)
}

type User interface {
	Create(create_user models.CreateUser) error
	GetUserPage(pageSize, pageNumber int, name, surname, patronymic, username string) (models.Paginator, error)
	ChangeStatus(id int) error
	Delete(id int) error
	Update(id int, update_user models.CreateUser) error
	ChangePassword(data models.Change_Password) error
}

type Brand interface {
	Create(buffer models.UpdateBrand) error
	GetPage(name string, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateBrand) error
	Delete(id int) error
	GetBrandsInSelectedObjects(name string) ([]models.SelectedObject, error)
}

type Repository struct {
	User
	Authorization
	Brand
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{
		Authorization: NewAuthPostgres(db),
		User:          NewUserPostgres(db),
		Brand:         NewBrandPostgres(db),
	}
}
