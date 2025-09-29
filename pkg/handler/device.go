package handler

import (
	"inventory/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Create a new device
// @Description  Creates a new device with the provided data
// @Tags         devices
// @Accept       json
// @Produce      json
// @Param        input  body      models.UpdateDevice  true  "Device creation data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/devices [post]
func (h *Handler) CreateDevice(c *gin.Context) {
	var input models.UpdateDevice

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.services.Device.Create(input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get paginated devices
// @Description  Returns a paginated list of devices, optionally filtered by name
// @Tags         devices
// @Accept       json
// @Produce      json
// @Param        page_size    query     int     true   "Number of items per page"
// @Param        page_number  query     int     true   "Page number to retrieve"
// @Param        name         query     string  false  "Filter by device name"
// @Success      200          {object}  object  "Paginated list of devices"
// @Failure      400          {object}  errorResponse  "Invalid query parameters"
// @Failure      500          {object}  errorResponse  "Internal server error"
// @Router       /api/devices [get]
func (h *Handler) GetDevicePage(c *gin.Context) {
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

	result, err := h.services.Device.GetPage(name, pageSize, pageNumber)

	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary      Update device
// @Description  Updates an existing device with the provided data
// @Tags         devices
// @Accept       json
// @Produce      json
// @Param        id     query     int                 true  "Device ID"
// @Param        input  body      models.UpdateDevice  true  "Device update data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data or ID"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/devices [put]
func (h *Handler) UpdateDevice(c *gin.Context) {
	var input models.UpdateDevice
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Device.Update(id, input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Delete device
// @Description  Deletes a device by ID
// @Tags         devices
// @Accept       json
// @Produce      json
// @Param        id  query  int  true  "Device ID"
// @Success      200  {object}  statusResponse  "Success"
// @Failure      400  {object}  errorResponse   "Invalid ID parameter"
// @Failure      500  {object}  errorResponse   "Internal server error"
// @Router       /api/devices [delete]
func (h *Handler) DeleteDevice(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Device.Delete(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}
