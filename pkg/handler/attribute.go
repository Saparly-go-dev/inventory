package handler

import (
	"inventory/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Create a new attribute
// @Description  Creates a new attribute with the provided data
// @Tags         attributes
// @Accept       json
// @Produce      json
// @Param        input  body      models.UpdateAttribute  true  "Attribute creation data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/attributes [post]
func (h *Handler) CreateAttribute(c *gin.Context) {
	var input models.UpdateAttribute

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.services.Attribute.Create(input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get paginated attributes
// @Description  Returns a paginated list of attributes, optionally filtered by name
// @Tags         attributes
// @Accept       json
// @Produce      json
// @Param        page_size    query     int     true   "Number of items per page"
// @Param        page_number  query     int     true   "Page number to retrieve"
// @Param        name         query     string  false  "Filter by attribute name"
// @Success      200          {object}  object  "Paginated list of attributes"
// @Failure      400          {object}  errorResponse  "Invalid query parameters"
// @Failure      500          {object}  errorResponse  "Internal server error"
// @Router       /api/attributes [get]
func (h *Handler) GetAttributePage(c *gin.Context) {
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

	result, err := h.services.Attribute.GetPage(name, pageSize, pageNumber)

	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary      Update attribute
// @Description  Updates an existing attribute with the provided data
// @Tags         attributes
// @Accept       json
// @Produce      json
// @Param        id     query     int                 true  "Attribute ID"
// @Param        input  body      models.UpdateAttribute  true  "Attribute update data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data or ID"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/attributes [put]
func (h *Handler) UpdateAttribute(c *gin.Context) {
	var input models.UpdateAttribute
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Attribute.Update(id, input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Delete attribute
// @Description  Deletes a attribute by ID
// @Tags         attributes
// @Accept       json
// @Produce      json
// @Param        id  query  int  true  "Attribute ID"
// @Success      200  {object}  statusResponse  "Success"
// @Failure      400  {object}  errorResponse   "Invalid ID parameter"
// @Failure      500  {object}  errorResponse   "Internal server error"
// @Router       /api/attributes [delete]
func (h *Handler) DeleteAttribute(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Attribute.Delete(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get attributes by selected object
// @Description  Returns attributes filtered by selected object name
// @Tags         attributes
// @Accept       json
// @Produce      json
// @Param        name  query  string  false  "Selected object name"
// @Success      200   {object}  object  "List of attributes"
// @Failure      400   {object}  errorResponse  "Invalid query parameters"
// @Failure      500   {object}  errorResponse  "Internal server error"
// @Router       /api/attributes/selected [get]
func (h *Handler) GetAttributeBySelectedObject(c *gin.Context) {
	name := c.Query("name")

	result, err := h.services.Attribute.GetAttributesInSelectedObjects(name)

	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}
