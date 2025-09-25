package repository

import (
	"errors"
	"inventory/models"
	"time"

	"gorm.io/gorm"
)

type UserPostgres struct {
	db *gorm.DB
}

func NewUserPostgres(db *gorm.DB) *UserPostgres {
	return &UserPostgres{db: db}
}

func (r *UserPostgres) Create(create_user models.CreateUser) error {
	// Ulanyjy adynyň ýeke-täkligini barlaýarys
	var count int64

	get_user_request := r.db.Model(&models.User{}).Where("username = ?", create_user.Username).Count(&count)
	if get_user_request.Error != nil {
		return get_user_request.Error
	}

	if count > 0 {
		return errors.New("Ulanyjy ady öň ulanylýar")
	}

	new_user := models.User{
		Username:   create_user.Username,
		Password:   create_user.Password,
		Name:       create_user.Name,
		Surname:    create_user.Surname,
		Patronymic: create_user.Patronymic,
		Role:       create_user.Role,
		Status:     false,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	save_user_request := r.db.Create(&new_user)
	if save_user_request.Error != nil {
		return save_user_request.Error
	}

	return nil
}

func (r *UserPostgres) GetUserPage(pageSize, pageNumber int, name, surname, patronymic, username string) (models.Paginator, error) {

	var users []models.User
	offset := (pageNumber - 1) * pageSize
	var count int64
	get_users_request := r.db.Model(&models.User{})

	if len(name) > 0 {
		get_users_request = get_users_request.Where("name ILIKE ?", "%"+name+"%")
	}

	if len(surname) > 0 {
		get_users_request = get_users_request.Where("surname ILIKE ?", "%"+surname+"%")
	}

	if len(patronymic) > 0 {
		get_users_request = get_users_request.Where("patronymic ILIKE ?", "%"+patronymic+"%")
	}

	if len(username) > 0 {
		get_users_request = get_users_request.Where("username ILIKE ?", "%"+username+"%")
	}

	get_users_request = get_users_request.Count(&count)
	get_users_request = get_users_request.Offset(offset).Limit(pageSize).Find(&users)

	var read_user_list []models.ReadUser

	for _, user := range users {
		var item models.ReadUser

		item.Id = user.Id
		item.Username = user.Username
		item.Name = user.Name
		item.Surname = user.Surname
		item.Patronymic = user.Patronymic
		item.Status = user.Status
		item.Role = user.Role
		item.CreatedAt = user.CreatedAt.Format("02.01.2006")
		item.UpdatedAt = user.UpdatedAt.Format("02.01.2006")

		read_user_list = append(read_user_list, item)
	}

	page := CreatePaginator(read_user_list, int(count), pageSize, pageNumber)

	return page, nil
}

func (r *UserPostgres) ChangeStatus(id int) error {
	var user models.User
	result := r.db.Model(&models.User{}).Where("id = ?", id).First(&user)

	if result.Error != nil {
		return result.Error
	}

	updateData := map[string]interface{}{
		"status":     !user.Status,
		"updated_at": time.Now(),
	}

	request := r.db.Model(&models.User{}).Where("id = ?", user.Id).Updates(updateData)
	return request.Error
}

func (r *UserPostgres) Update(id int, update_user models.CreateUser) error {
	var user models.User
	var count int64
	is_username_unique := r.db.Model(&models.User{}).Where("id != ? AND username = ?", id, update_user.Username).Count(&count)
	if is_username_unique.Error != nil {
		return is_username_unique.Error
	}

	if count > 0 {
		return errors.New("Ulanyjy ady öň ulanylýar")
	}

	get_user_request := r.db.Model(&models.User{}).Where("id = ?", id).First(&user)
	if get_user_request.Error != nil {
		return get_user_request.Error
	}

	update_data := map[string]interface{}{
		"name":       update_user.Name,
		"surname":    update_user.Surname,
		"patronymic": update_user.Patronymic,
		"username":   update_user.Username,
		"role":       update_user.Role,
		"updated_at": time.Now(),
	}

	request := r.db.Model(&models.User{}).Where("id = ?", user.Id).Updates(update_data)
	return request.Error
}

func (r *UserPostgres) ChangePassword(data models.Change_Password) error {
	var user models.User

	get_user_request := r.db.Model(&models.User{}).Where("id = ?", data.UserId).First(&user)
	if get_user_request.Error != nil {
		return get_user_request.Error
	}

	if user.Password != data.OldPassword {
		return errors.New("Köne açar sözi gabat gelmedi")
	}

	if data.Password != data.ConfirmPassword {
		return errors.New("Açar sözleri gabat gelmedi")
	}

	update_data := map[string]interface{}{
		"password":   data.Password,
		"updated_at": time.Now(),
	}

	update_request := r.db.Model(&models.User{}).Where("id = ?", user.Id).Updates(update_data)
	return update_request.Error
}

func (r *UserPostgres) Delete(id int) error {
	var count int64

	is_have_request := r.db.Model(&models.User{}).Where("id = ?", id).Count(&count)
	if is_have_request.Error != nil {
		return is_have_request.Error
	}

	if count == 0 {
		return errors.New("Ulanyjy tapylmady")
	}

	delete_request := r.db.Model(&models.User{}).Where("id = ?", id).Delete(&models.User{})
	if delete_request.Error != nil {
		return errors.New("Ýalnyşlyk ýüze çykdy")
	}

	return nil
}
