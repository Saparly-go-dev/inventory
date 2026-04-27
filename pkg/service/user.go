package service

import (
	"errors"
	"inventory/models"
	"inventory/pkg/repository"
	"strings"
)

type UserService struct {
	repo     repository.User
	roleRepo repository.Role
}

func NewUserService(repo repository.User, roleRepo repository.Role) *UserService {
	return &UserService{repo: repo, roleRepo: roleRepo}
}

func (service *UserService) Create(create_user models.CreateUser) error {
	if create_user.Password != create_user.ConfirmPassword {
		return errors.New("Açar sözleri gabat gelmedi")
	}

	role, err := service.normalizeAndValidateRole(create_user.Role)
	if err != nil {
		return err
	}

	create_user.Role = role
	create_user.Password = generatePasswordHash(create_user.Password)

	return service.repo.Create(create_user)
}

func (Service *UserService) GetById(id int) (models.User, error) {
	return Service.repo.GetById(id)
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
	role, err := Service.normalizeAndValidateRole(update_user.Role)
	if err != nil {
		return err
	}

	update_user.Role = role
	return Service.repo.Update(id, update_user)
}

func (Service *UserService) ChangePassword(data models.Change_Password) error {
	data.OldPassword = generatePasswordHash(data.OldPassword)
	data.Password = generatePasswordHash(data.Password)
	data.ConfirmPassword = generatePasswordHash(data.ConfirmPassword)

	return Service.repo.ChangePassword(data)
}

func (Service *UserService) normalizeAndValidateRole(role string) (string, error) {
	role = strings.ToLower(strings.TrimSpace(role))
	if role == "string" {
		role = "admin"
	}
	if role == "" {
		role = "viewer"
	}

	if _, err := Service.roleRepo.GetByCode(role); err != nil {
		return "", errors.New("Rol tapylmady")
	}

	return role, nil
}
