package main

import (
	"context"
	"inventory"
	"inventory/models"
	"inventory/pkg/handler"
	"inventory/pkg/repository"
	"inventory/pkg/service"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

//	@title			Inventory App API
//	@version		1.0
//	@Description	API Server for Documentation

// host 0.0.0.0:8000
//	@BasePath	/

// @securityDefinitions.apikey ApiKeyAuth
// @in                      header
// @name                 Authorization

func main() {

	logrus.SetFormatter(new(logrus.JSONFormatter))

	// Initialize the configuration
	if err := initConfig(); err != nil {
		logrus.Fatalf("error initializing config: %v", err.Error())
	}

	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		logrus.Fatalf("error loading .env variables: %s", err.Error())
	}

	// Initialize GORM database connection
	dsn := "host=" + viper.GetString("db.host") +
		" user=" + viper.GetString("db.username") +
		" password=" + os.Getenv("DB_PASSWORD") +
		" dbname=" + viper.GetString("db.dbname") +
		" port=" + viper.GetString("db.port") +
		" sslmode=" + viper.GetString("db.sslmode")

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		logrus.Fatalf("failed to initialize db: %s", err.Error())
	}

	// Run auto migration for models if necessary
	err = db.AutoMigrate(&models.Brand{})

	if err != nil {
		logrus.Fatalf("error during migration: %s", err.Error())
	}

	// Initialize repository, services, and handlers
	repos := repository.NewRepository(db)
	services := service.NewService(repos)
	handlers := handler.NewHandler(services)

	srv := new(inventory.Server)

	go func() {
		if err := srv.Run(viper.GetString("port"), handlers.InitRoutes()); err != nil {
			logrus.Fatalf("error occurred while running http server: %s", err.Error())
		}
	}()

	logrus.Print("The app Started")

	// Block indefinitely
	select {}

	// Handle graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	<-quit

	logrus.Printf("The app Shutting Down")

	if err := srv.Shutdown(context.Background()); err != nil {
		logrus.Errorf("error occurred on server shutting down : %s", err.Error())
	}

	// Closing the DB connection, GORM doesn't have a direct Close() method so we use a manual DB close
	sqlDB, err := db.DB()
	if err != nil {
		logrus.Errorf("error occurred when getting db: %s", err.Error())
	} else {
		if err := sqlDB.Close(); err != nil {
			logrus.Errorf("error occurred on db connection close: %s", err.Error())
		}
	}

}

func initConfig() error {
	viper.AddConfigPath("configs")
	viper.SetConfigName("config")
	return viper.ReadInConfig()
}
