package handler

import (
	"inventory/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Create a new model
// @Description  Creates a new model with the provided data
// @Tags         models
// @Accept       json
// @Produce      json
// @Param        input  body      models.UpdateModel  true  "Model creation data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/models [post]
// @Security ApiKeyAuth
func (h *Handler) CreateModel(c *gin.Context) {
	var input models.UpdateModel

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.services.Model.Create(input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get paginated models
// @Description  Returns a paginated list of models, optionally filtered by name
// @Tags         models
// @Accept       json
// @Produce      json
// @Param        page_size    query     int     true   "Number of items per page"
// @Param        page_number  query     int     true   "Page number to retrieve"
// @Param        name         query     string  false  "Filter by model name"
// @Success      200          {object}  object  "Paginated list of models"
// @Failure      400          {object}  errorResponse  "Invalid query parameters"
// @Failure      500          {object}  errorResponse  "Internal server error"
// @Router       /api/models [get]
// @Security ApiKeyAuth
func (h *Handler) GetModelPage(c *gin.Context) {
	pageSize, err := strconv.Atoi(c.Query("page_size"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	pageNumber, err := strconv.Atoi(c.Query("page_number"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	name := c.Query("name")

	result, err := h.services.Model.GetPage(name, pageSize, pageNumber)

	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary      Update model
// @Description  Updates an existing model with the provided data
// @Tags         models
// @Accept       json
// @Produce      json
// @Param        id     query     int                 true  "Model ID"
// @Param        input  body      models.UpdateModel  true  "Model update data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data or ID"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/models [put]
// @Security ApiKeyAuth
func (h *Handler) UpdateModel(c *gin.Context) {
	var input models.UpdateModel
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Model.Update(id, input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Delete model
// @Description  Deletes a model by ID
// @Tags         models
// @Accept       json
// @Produce      json
// @Param        id  query  int  true  "Model ID"
// @Success      200  {object}  statusResponse  "Success"
// @Failure      400  {object}  errorResponse   "Invalid ID parameter"
// @Failure      500  {object}  errorResponse   "Internal server error"
// @Router       /api/models [delete]
// @Security ApiKeyAuth
func (h *Handler) DeleteModel(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Model.Delete(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get models by selected object
// @Description  Returns models filtered by selected object name
// @Tags         models
// @Accept       json
// @Produce      json
// @Param        name  query  string  false  "Selected object name"
// @Param		 brand_id query int	  false	 "Brand id"
// @Success      200   {object}  object  "List of models"
// @Failure      400   {object}  errorResponse  "Invalid query parameters"
// @Failure      500   {object}  errorResponse  "Internal server error"
// @Router       /api/models/selected [get]
// @Security ApiKeyAuth
func (h *Handler) GetModelBySelectedObject(c *gin.Context) {
	name := c.Query("name")

	brandId, err := strconv.Atoi(c.Query("brand_id"))
	if err != nil {
		brandId = 0
	}

	result, err := h.services.Model.GetModelsInSelectedObjects(name, brandId)

	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}
