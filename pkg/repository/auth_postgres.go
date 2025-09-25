package repository

import (
	"inventory/models"

	"gorm.io/gorm"
)

type AuthPostgres struct {
	db *gorm.DB
}

// NewAuthPostgres creates a new instance of AuthPostgres with GORM DB
func NewAuthPostgres(db *gorm.DB) *AuthPostgres {
	return &AuthPostgres{db: db}
}

func (r *AuthPostgres) Get(username, password string) (models.User, error) {
	var user models.User
	get_user_request := r.db.Model(&models.User{}).Where("username = ? AND password = ?", username, password).First(&user)
	if get_user_request.Error != nil {
		return models.User{}, get_user_request.Error
	}
	return user, nil
}
