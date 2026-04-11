package service

import (
	"inventory/pkg/repository"
)

type StatisticsService struct {
	repo repository.Statistics
}

func NewStatisticsService(repo repository.Statistics) *StatisticsService {
	return &StatisticsService{repo: repo}
}

func (s *StatisticsService) GetStatistics() (repository.StatisticsData, error) {
	return s.repo.GetStatistics()
}
