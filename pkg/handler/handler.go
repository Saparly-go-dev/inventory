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

	router.Static("/uploads", "./uploads")

	docs.SwaggerInfo.BasePath = "/"

	router.GET("swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := router.Group("/api")
	{

		api.POST("/auth/signIn", h.signIn)

		users := api.Group("/users", h.userIdentity)
		{
			users.POST("/", h.createUser)
			users.GET("/", h.getUserPage)
			users.PATCH("/:id/status", h.changeUserStatus)
			users.DELETE("/:id", h.deleteUser)
			users.PUT("/:id", h.updateUser)
			users.POST("/password", h.changeUserPassword)
		}

		brands := api.Group("/brands", h.userIdentity)
		{
			brands.POST("/", h.CreateBrand)
			brands.GET("/", h.GetBrandPage)
			brands.PUT("/", h.UpdateBrand)
			brands.DELETE("/", h.DeleteBrand)
			brands.GET("/selected", h.GetBrandBySelectedObject)
		}

		categories := api.Group("/categories", h.userIdentity)
		{
			categories.POST("/", h.CreateCategory)
			categories.GET("/", h.GetCategoryPage)
			categories.PUT("/", h.UpdateCategory)
			categories.DELETE("/", h.DeleteCategory)
			categories.GET("/selected", h.GetCategoryBySelectedObject)
		}

		models := api.Group("/models", h.userIdentity)
		{
			models.POST("/", h.CreateModel)
			models.GET("/", h.GetModelPage)
			models.PUT("/", h.UpdateModel)
			models.DELETE("/", h.DeleteModel)
			models.GET("/selected", h.GetModelBySelectedObject)
		}

		attributes := api.Group("/attributes", h.userIdentity)
		{
			attributes.POST("/", h.CreateAttribute)
			attributes.GET("/", h.GetAttributePage)
			attributes.PUT("/", h.UpdateAttribute)
			attributes.DELETE("/", h.DeleteAttribute)
			attributes.GET("/selected", h.GetAttributeBySelectedObject)
		}

		devices := api.Group("/devices", h.userIdentity)
		{
			devices.POST("/", h.CreateDevice)
			devices.GET("/", h.GetDevicePage)
			devices.PUT("/", h.UpdateDevice)
			devices.DELETE("/", h.DeleteDevice)
			devices.POST("/assign", h.AssignDeviceToEmployee)
			devices.POST("/return", h.ReturnDeviceFromEmployee)
			devices.GET("/available", h.GetAvailableDevices)
		}

		device_attributes := api.Group("/device-attributes", h.userIdentity)
		{
			device_attributes.POST("/", h.CreateDeviceAttribute)
			device_attributes.PUT("/", h.UpdateDeviceAttribute)
			device_attributes.DELETE("/", h.DeleteDeviceAttribute)
		}

		employees := api.Group("/employees", h.userIdentity)
		{
			employees.POST("/", h.CreateEmployee)
			employees.GET("", h.GetEmployeePage)
			employees.PUT("", h.UpdateEmployee)
			employees.DELETE("", h.DeleteEmployee)
			employees.GET("/selected", h.GetEmployeeBySelectedObject)
			employees.GET("/devices", h.GetEmployeeDevices)
			employees.GET("/:id", h.GetEmployeeById)
			employees.GET("/:id/with-devices", h.GetEmployeeByIdWithDevices)
			employees.POST("/sync", h.SyncEmployees)
		}

		dashboard := api.Group("/dashboard", h.userIdentity)
		{
			dashboard.GET("/devices", h.getAllDevices)
			dashboard.GET("/devices/export", h.exportAllDevices)
		}

	}

	return router
}
