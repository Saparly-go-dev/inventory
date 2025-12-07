package handler

import (
	"inventory/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Create a new category
// @Description  Creates a new category with the provided data
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        input  body      models.UpdateCategory  true  "Category creation data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/categories/ [post]
func (h *Handler) CreateCategory(c *gin.Context) {
	var input models.UpdateCategory

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.services.Category.Create(input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get paginated categories
// @Description  Returns a paginated list of categories, optionally filtered by name
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        page_size    query     int     true   "Number of items per page"
// @Param        page_number  query     int     true   "Page number to retrieve"
// @Param        name         query     string  false  "Filter by category name"
// @Success      200          {object}  object  "Paginated list of categories"
// @Failure      400          {object}  errorResponse  "Invalid query parameters"
// @Failure      500          {object}  errorResponse  "Internal server error"
// @Router       /api/categories [get]
func (h *Handler) GetCategoryPage(c *gin.Context) {
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

	result, err := h.services.Category.GetPage(name, pageSize, pageNumber)

	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary      Update category
// @Description  Updates an existing category with the provided data
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id     query     int                 true  "Category ID"
// @Param        input  body      models.UpdateCategory  true  "Category update data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data or ID"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/categories [put]
func (h *Handler) UpdateCategory(c *gin.Context) {
	var input models.UpdateCategory
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Category.Update(id, input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Delete category
// @Description  Deletes a category by ID
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        id  query  int  true  "Category ID"
// @Success      200  {object}  statusResponse  "Success"
// @Failure      400  {object}  errorResponse   "Invalid ID parameter"
// @Failure      500  {object}  errorResponse   "Internal server error"
// @Router       /api/categories [delete]
func (h *Handler) DeleteCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Category.Delete(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get categories by selected object
// @Description  Returns categories filtered by selected object name
// @Tags         categories
// @Accept       json
// @Produce      json
// @Param        name  query  string  false  "Selected object name"
// @Success      200   {object}  object  "List of categories"
// @Failure      400   {object}  errorResponse  "Invalid query parameters"
// @Failure      500   {object}  errorResponse  "Internal server error"
// @Router       /api/categories/selected [get]
func (h *Handler) GetCategoryBySelectedObject(c *gin.Context) {
	name := c.Query("name")

	result, err := h.services.Category.Select(name)

	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}
