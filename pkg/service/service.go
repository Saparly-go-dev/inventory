package service

import (
	"inventory/models"
	"inventory/pkg/repository"
)

type Authorization interface {
	GenerateToken(username, password string) (models.LoginResponse, error)
	ParseToken(token string) (int, error)
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

type Service struct {
	Authorization
	User
	Brand
}

func NewService(repos *repository.Repository) *Service {
	return &Service{
		Authorization: NewAuthService(repos.Authorization),
		User:          NewUserService(repos.User),
		Brand:         NewBrandService(repos.Brand),
	}
}
