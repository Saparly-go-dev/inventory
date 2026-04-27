package handler

import (
	docs "inventory/docs"
	"inventory/pkg/service"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Handler struct {
	services *service.Service
}

func NewHandler(services *service.Service) *Handler {
	return &Handler{services: services}
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.New()
	router.Use(requestLogger(), recoveryLogger())

	router.Static("/uploads", "./uploads")

	docs.SwaggerInfo.BasePath = "/"

	router.GET("swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := router.Group("/api")
	{
		manageUsers := h.requirePermission("users.manage")
		manageRoles := h.requirePermission("roles.manage")
		readInventory := h.requirePermission("inventory.view")
		createInventory := h.requirePermission("inventory.create")
		updateInventory := h.requirePermission("inventory.update")
		deleteInventory := h.requirePermission("inventory.delete")
		assignDevices := h.requirePermission("devices.assign")
		returnDevices := h.requirePermission("devices.return")
		importDevices := h.requirePermission("devices.import")
		exportDevices := h.requirePermission("devices.export")
		cloneDevices := h.requirePermission("devices.clone")
		syncEmployees := h.requirePermission("employees.sync")
		viewStatistics := h.requirePermission("statistics.view")

		api.POST("/auth/signIn", h.signIn)

		users := api.Group("/users", h.userIdentity)
		{
			users.GET("/me", h.getCurrentUser)
			users.POST("/", manageUsers, h.createUser)
			users.GET("/", manageUsers, h.getUserPage)
			users.PATCH("/:id/status", manageUsers, h.changeUserStatus)
			users.DELETE("/:id", manageUsers, h.deleteUser)
			users.PUT("/:id", manageUsers, h.updateUser)
			users.POST("/password", manageUsers, h.changeUserPassword)
		}

		roles := api.Group("/roles", h.userIdentity)
		{
			roles.POST("/", manageRoles, h.CreateRole)
			roles.GET("/", manageRoles, h.GetRolePage)
			roles.GET("/selected", manageUsers, h.GetRoleSelected)
			roles.PUT("/:id", manageRoles, h.UpdateRole)
			roles.DELETE("/:id", manageRoles, h.DeleteRole)
		}

		brands := api.Group("/brands", h.userIdentity)
		{
			brands.POST("/", createInventory, h.CreateBrand)
			brands.GET("/", readInventory, h.GetBrandPage)
			brands.PUT("/", updateInventory, h.UpdateBrand)
			brands.DELETE("/", deleteInventory, h.DeleteBrand)
			brands.GET("/selected", readInventory, h.GetBrandBySelectedObject)
		}

		categories := api.Group("/categories", h.userIdentity)
		{
			categories.POST("/", createInventory, h.CreateCategory)
			categories.GET("/", readInventory, h.GetCategoryPage)
			categories.PUT("/", updateInventory, h.UpdateCategory)
			categories.DELETE("/", deleteInventory, h.DeleteCategory)
			categories.GET("/selected", readInventory, h.GetCategoryBySelectedObject)
		}

		models := api.Group("/models", h.userIdentity)
		{
			models.POST("/", createInventory, h.CreateModel)
			models.GET("/", readInventory, h.GetModelPage)
			models.PUT("/", updateInventory, h.UpdateModel)
			models.DELETE("/", deleteInventory, h.DeleteModel)
			models.GET("/selected", readInventory, h.GetModelBySelectedObject)
		}

		attributes := api.Group("/attributes", h.userIdentity)
		{
			attributes.POST("/", createInventory, h.CreateAttribute)
			attributes.GET("/", readInventory, h.GetAttributePage)
			attributes.PUT("/", updateInventory, h.UpdateAttribute)
			attributes.DELETE("/", deleteInventory, h.DeleteAttribute)
			attributes.GET("/selected", readInventory, h.GetAttributeBySelectedObject)
		}

		devices := api.Group("/devices", h.userIdentity)
		{
			devices.POST("/", createInventory, h.CreateDevice)
			devices.GET("/", readInventory, h.GetDevicePage)
			devices.PUT("/", updateInventory, h.UpdateDevice)
			devices.DELETE("/", deleteInventory, h.DeleteDevice)
			devices.POST("/assign", assignDevices, h.AssignDeviceToEmployee)
			devices.POST("/return", returnDevices, h.ReturnDeviceFromEmployee)
			devices.GET("/available", readInventory, h.GetAvailableDevices)
			devices.POST("/:id/clone", cloneDevices, h.CloneDevice)
		}

		device_attributes := api.Group("/device-attributes", h.userIdentity)
		{
			device_attributes.POST("/", createInventory, h.CreateDeviceAttribute)
			device_attributes.PUT("/", updateInventory, h.UpdateDeviceAttribute)
			device_attributes.DELETE("/", deleteInventory, h.DeleteDeviceAttribute)
		}

		employees := api.Group("/employees", h.userIdentity)
		{
			employees.POST("/", createInventory, h.CreateEmployee)
			employees.GET("", readInventory, h.GetEmployeePage)
			employees.PUT("", updateInventory, h.UpdateEmployee)
			employees.DELETE("", deleteInventory, h.DeleteEmployee)
			employees.GET("/selected", readInventory, h.GetEmployeeBySelectedObject)
			employees.GET("/devices", readInventory, h.GetEmployeeDevices)
			employees.GET("/:id", readInventory, h.GetEmployeeById)
			employees.GET("/:id/with-devices", readInventory, h.GetEmployeeByIdWithDevices)
			employees.POST("/sync", syncEmployees, h.SyncEmployees)
		}

		dashboard := api.Group("/dashboard", h.userIdentity)
		{
			dashboard.GET("/devices", readInventory, h.getAllDevices)
			dashboard.GET("/devices/export", exportDevices, h.exportAllDevices)
			dashboard.POST("/devices/import", importDevices, h.ImportDevices)
			dashboard.GET("/devices/template", importDevices, h.GetImportTemplate)
			dashboard.GET("/statistics", viewStatistics, h.getStatistics)
		}

	}

	return router
}
