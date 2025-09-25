package service

import (
	"errors"
	"inventory/models"
	"inventory/pkg/repository"
)

type UserService struct {
	repo repository.User
}

func NewUserService(repo repository.User) *UserService {
	return &UserService{repo: repo}
}

func (service *UserService) Create(create_user models.CreateUser) error {
	if create_user.Password != create_user.ConfirmPassword {
		return errors.New("Açar sözleri gabat gelmedi")
	}

	create_user.Password = generatePasswordHash(create_user.Password)

	return service.repo.Create(create_user)
}

func (Service *UserService) GetUserPage(pageSize, pageNumber int, name, surname, patronymic, username string) (models.Paginator, error) {
	return Service.repo.GetUserPage(pageSize, pageNumber, name, surname, patronymic, username)
}

func (Service *UserService) ChangeStatus(id int) error {
	return Service.repo.ChangeStatus(id)
}

func (Service *UserService) Delete(id int) error {
	return Service.repo.Delete(id)
}

func (Service *UserService) Update(id int, update_user models.CreateUser) error {
	return Service.repo.Update(id, update_user)
}

func (Service *UserService) ChangePassword(data models.Change_Password) error {
	data.OldPassword = generatePasswordHash(data.OldPassword)
	data.Password = generatePasswordHash(data.Password)
	data.ConfirmPassword = generatePasswordHash(data.ConfirmPassword)

	return Service.repo.ChangePassword(data)
}
