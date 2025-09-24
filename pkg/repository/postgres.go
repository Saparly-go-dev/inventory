package repository

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Config struct {
	Host     string
	Port     string
	Username string
	Password string
	DBName   string
	SSLMode  string
}

// NewPostgresDB initializes a PostgreSQL connection using GORM
func NewPostgresDB(cfg Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.Username, cfg.DBName, cfg.Password, cfg.SSLMode)

	// You can customize GORM configurations, for example, enabling Logger or using a different driver
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // Enable detailed logs for debugging
	})

	if err != nil {
		return nil, err
	}

	// Optional: Set connection pool configuration
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	// Ping the database to ensure the connection is established
	if err := sqlDB.Ping(); err != nil {
		return nil, err
	}

	// Optional: Configure maximum idle connections and maximum open connections
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	return db, nil
}
