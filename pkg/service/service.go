package service

import (
	"inventory/pkg/repository"
)

type Service struct {
}

func NewService(repos *repository.Repository) *Service {
	return &Service{}
}
