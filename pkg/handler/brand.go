package handler

import (
	"inventory/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Create a new brand
// @Description  Creates a new brand with the provided data
// @Tags         brands
// @Accept       json
// @Produce      json
// @Param        input  body      models.UpdateBrand  true  "Brand creation data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/brands/ [post]
// @Security ApiKeyAuth
func (h *Handler) CreateBrand(c *gin.Context) {
	var input models.UpdateBrand

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.services.Brand.Create(input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get paginated brands
// @Description  Returns a paginated list of brands, optionally filtered by name
// @Tags         brands
// @Accept       json
// @Produce      json
// @Param        page_size    query     int     true   "Number of items per page"
// @Param        page_number  query     int     true   "Page number to retrieve"
// @Param        name         query     string  false  "Filter by brand name"
// @Success      200          {object}  object  "Paginated list of brands"
// @Failure      400          {object}  errorResponse  "Invalid query parameters"
// @Failure      500          {object}  errorResponse  "Internal server error"
// @Router       /api/brands [get]
// @Security ApiKeyAuth
func (h *Handler) GetBrandPage(c *gin.Context) {
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

	result, err := h.services.Brand.GetPage(name, pageSize, pageNumber)

	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary      Update brand
// @Description  Updates an existing brand with the provided data
// @Tags         brands
// @Accept       json
// @Produce      json
// @Param        id     query     int                 true  "Brand ID"
// @Param        input  body      models.UpdateBrand  true  "Brand update data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data or ID"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/brands [put]
// @Security ApiKeyAuth
func (h *Handler) UpdateBrand(c *gin.Context) {
	var input models.UpdateBrand
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Brand.Update(id, input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Delete brand
// @Description  Deletes a brand by ID
// @Tags         brands
// @Accept       json
// @Produce      json
// @Param        id  query  int  true  "Brand ID"
// @Success      200  {object}  statusResponse  "Success"
// @Failure      400  {object}  errorResponse   "Invalid ID parameter"
// @Failure      500  {object}  errorResponse   "Internal server error"
// @Router       /api/brands [delete]
// @Security ApiKeyAuth
func (h *Handler) DeleteBrand(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Brand.Delete(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get brands by selected object
// @Description  Returns brands filtered by selected object name
// @Tags         brands
// @Accept       json
// @Produce      json
// @Param        name  query  string  false  "Selected object name"
// @Success      200   {object}  object  "List of brands"
// @Failure      400   {object}  errorResponse  "Invalid query parameters"
// @Failure      500   {object}  errorResponse  "Internal server error"
// @Router       /api/brands/selected [get]
// @Security ApiKeyAuth
func (h *Handler) GetBrandBySelectedObject(c *gin.Context) {
	name := c.Query("name")

	result, err := h.services.Brand.GetBrandsInSelectedObjects(name)

	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}
