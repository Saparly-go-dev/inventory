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

type Model interface {
	Create(buffer models.UpdateModel) error
	GetPage(name string, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateModel) error
	Delete(id int) error
	GetModelsInSelectedObjects(name string) ([]models.SelectedObject, error)
}

type Category interface {
	Create(buffer models.UpdateCategory) error
	Update(id int, buffer models.UpdateCategory) error
	Delete(id int) error
	Select(name string) ([]models.SelectedObject, error)
}

type Attribute interface {
	Create(buffer models.UpdateAttribute) error
	GetPage(name string, pageSize, pageNumber int) (models.Paginator, error)
	Update(id int, buffer models.UpdateAttribute) error
	Delete(id int) error
	GetAttributesInSelectedObjects(name string) ([]models.SelectedObject, error)
}

type Repository struct {
	User
	Authorization
	Brand
	Category
	Model
	Attribute
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{
		Authorization: NewAuthPostgres(db),
		User:          NewUserPostgres(db),
		Brand:         NewBrandPostgres(db),
		Category:      NewCategoryPostgres(db),
		Model:         NewModelPostgres(db),
		Attribute:     NewAttributePostgres(db),
	}
}
