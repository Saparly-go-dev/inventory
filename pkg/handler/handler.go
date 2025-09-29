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

	docs.SwaggerInfo.BasePath = "/"

	router.GET("swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	api := router.Group("/api")
	{

		api.POST("/auth/signIn", h.signIn)

		users := api.Group("/users")
		{
			users.POST("/", h.createUser)
			users.GET("/", h.getUserPage)
			users.PATCH("/:id/status", h.changeUserStatus)
			users.DELETE("/:id", h.deleteUser)
			users.PUT("/:id", h.updateUser)
			users.POST("/password", h.changeUserPassword)
		}

		brands := api.Group("/brands")
		{
			brands.POST("/", h.CreateBrand)
			brands.GET("/", h.GetBrandPage)
			brands.PUT("/", h.UpdateBrand)
			brands.DELETE("/", h.DeleteBrand)
			brands.GET("/selected", h.GetBrandBySelectedObject)
		}

		models := api.Group("/models")
		{
			models.POST("/", h.CreateModel)
			models.GET("/", h.GetModelPage)
			models.PUT("/", h.UpdateModel)
			models.DELETE("/", h.DeleteModel)
			models.GET("/selected", h.GetModelBySelectedObject)
		}

		attributes := api.Group("/attributes")
		{
			attributes.POST("/", h.CreateAttribute)
			attributes.GET("/", h.GetAttributePage)
			attributes.PUT("/", h.UpdateAttribute)
			attributes.DELETE("/", h.DeleteAttribute)
			attributes.GET("/selected", h.GetAttributeBySelectedObject)
		}

		devices := api.Group("/devices")
		{
			devices.POST("/", h.CreateDevice)
			devices.GET("/", h.GetDevicePage)
			devices.PUT("/", h.UpdateDevice)
			devices.DELETE("/", h.DeleteDevice)
		}

		device_attributes := api.Group("/device-attributes")
		{
			device_attributes.PUT("/", h.UpdateDeviceAttribute)
			device_attributes.DELETE("/", h.DeleteDeviceAttribute)
		}

	}

	return router
}
