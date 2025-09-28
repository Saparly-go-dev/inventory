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

	docs.SwaggerInfo.BasePath = "/swagger/"

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

	}

	return router
}
