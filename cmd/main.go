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
	"time"

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

	configureLogger()

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
	err = db.AutoMigrate(&models.Brand{}, &models.Model{}, &models.Category{}, &models.Attribute{}, &models.Device{},
		&models.DeviceAttribute{}, &models.User{}, &models.DeviceAssignment{}, &models.Employee{}, &models.Role{},
		&models.Furniture{}, &models.FurnitureAllocation{})

	if err != nil {
		logrus.Fatalf("error during migration: %s", err.Error())
	}

	if err := seedDefaultRoles(db); err != nil {
		logrus.Fatalf("error during roles seed: %s", err.Error())
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

	logrus.WithFields(logrus.Fields{
		"event": "app_started",
		"port":  viper.GetString("port"),
	}).Info("app started")

	// Handle graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)
	<-quit

	logrus.WithField("event", "app_shutdown").Info("app shutting down")

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

func configureLogger() {
	logrus.SetOutput(os.Stdout)
	logrus.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: time.RFC3339,
	})

	level := os.Getenv("LOG_LEVEL")
	if level == "" {
		level = "info"
	}

	parsedLevel, err := logrus.ParseLevel(level)
	if err != nil {
		logrus.WithField("log_level", level).Warn("invalid LOG_LEVEL, using info")
		parsedLevel = logrus.InfoLevel
	}

	logrus.SetLevel(parsedLevel)
}

func seedDefaultRoles(db *gorm.DB) error {
	defaultRoles := []models.Role{
		{
			Code:               "admin",
			Name:               "Administrator",
			Description:        "Ähli hukuklar",
			CanManageUsers:     true,
			CanManageRoles:     true,
			CanViewInventory:   true,
			CanCreateInventory: true,
			CanUpdateInventory: true,
			CanDeleteInventory: true,
			CanAssignDevices:   true,
			CanReturnDevices:   true,
			CanImportDevices:   true,
			CanExportDevices:   true,
			CanCloneDevices:    true,
			CanSyncEmployees:   true,
			CanViewStatistics:  true,
			CanManageInventory: true,
			CanView:            true,
			IsSystem:           true,
		},
		{
			Code:               "manager",
			Name:               "Dolandyryjy",
			Description:        "Inwentar maglumatlaryny dolandyrmak",
			CanManageUsers:     false,
			CanManageRoles:     false,
			CanViewInventory:   true,
			CanCreateInventory: true,
			CanUpdateInventory: true,
			CanDeleteInventory: true,
			CanAssignDevices:   true,
			CanReturnDevices:   true,
			CanImportDevices:   true,
			CanExportDevices:   true,
			CanCloneDevices:    true,
			CanSyncEmployees:   true,
			CanViewStatistics:  true,
			CanManageInventory: true,
			CanView:            true,
			IsSystem:           true,
		},
		{
			Code:               "viewer",
			Name:               "Synçy",
			Description:        "Diňe maglumatlary görmek",
			CanManageUsers:     false,
			CanManageRoles:     false,
			CanViewInventory:   true,
			CanCreateInventory: false,
			CanUpdateInventory: false,
			CanDeleteInventory: false,
			CanAssignDevices:   false,
			CanReturnDevices:   false,
			CanImportDevices:   false,
			CanExportDevices:   true,
			CanCloneDevices:    false,
			CanSyncEmployees:   false,
			CanViewStatistics:  true,
			CanManageInventory: false,
			CanView:            true,
			IsSystem:           true,
		},
	}

	for _, role := range defaultRoles {
		var count int64
		if err := db.Model(&models.Role{}).Where("code = ?", role.Code).Count(&count).Error; err != nil {
			return err
		}

		if count > 0 {
			continue
		}

		if err := db.Create(&role).Error; err != nil {
			return err
		}
	}

	return backfillRolePermissions(db)
}

func backfillRolePermissions(db *gorm.DB) error {
	var roles []models.Role
	if err := db.Model(&models.Role{}).Find(&roles).Error; err != nil {
		return err
	}

	for _, role := range roles {
		updated := role
		applyLegacyRoleBackfill(&updated)

		if err := db.Model(&models.Role{}).Where("id = ?", role.Id).Updates(rolePermissionUpdateMap(updated)).Error; err != nil {
			return err
		}
	}

	return nil
}

func applyLegacyRoleBackfill(role *models.Role) {
	switch role.Code {
	case "admin":
		role.CanManageUsers = true
		role.CanManageRoles = true
		role.CanViewInventory = true
		role.CanCreateInventory = true
		role.CanUpdateInventory = true
		role.CanDeleteInventory = true
		role.CanAssignDevices = true
		role.CanReturnDevices = true
		role.CanImportDevices = true
		role.CanExportDevices = true
		role.CanCloneDevices = true
		role.CanSyncEmployees = true
		role.CanViewStatistics = true
		role.CanManageInventory = true
		role.CanView = true
		role.IsSystem = true
		return
	case "manager":
		role.IsSystem = true
	case "viewer":
		role.IsSystem = true
	}

	if role.CanManageInventory {
		role.CanViewInventory = true
		role.CanCreateInventory = true
		role.CanUpdateInventory = true
		role.CanDeleteInventory = true
		role.CanAssignDevices = true
		role.CanReturnDevices = true
		role.CanImportDevices = true
		role.CanExportDevices = true
		role.CanCloneDevices = true
		role.CanSyncEmployees = true
		role.CanViewStatistics = true
	}

	if role.CanView {
		role.CanViewInventory = true
		role.CanExportDevices = true
		role.CanViewStatistics = true
	}
}

func rolePermissionUpdateMap(role models.Role) map[string]interface{} {
	return map[string]interface{}{
		"can_manage_users":     role.CanManageUsers,
		"can_manage_roles":     role.CanManageRoles,
		"can_view_inventory":   role.CanViewInventory,
		"can_create_inventory": role.CanCreateInventory,
		"can_update_inventory": role.CanUpdateInventory,
		"can_delete_inventory": role.CanDeleteInventory,
		"can_assign_devices":   role.CanAssignDevices,
		"can_return_devices":   role.CanReturnDevices,
		"can_import_devices":   role.CanImportDevices,
		"can_export_devices":   role.CanExportDevices,
		"can_clone_devices":    role.CanCloneDevices,
		"can_sync_employees":   role.CanSyncEmployees,
		"can_view_statistics":  role.CanViewStatistics,
		"can_manage_inventory": role.CanManageInventory,
		"can_view":             role.CanView,
		"is_system":            role.IsSystem,
	}
}
