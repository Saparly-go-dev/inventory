package handler

import (
	"inventory/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary      Update device attribute
// @Description  Updates an existing device attribute with the provided data
// @Tags         device_attributes
// @Accept       json
// @Produce      json
// @Param        id     query     int                 true  "Device attribute ID"
// @Param        input  body      models.UpdateDeviceAttribute  true  "Device attribute update data"
// @Success      200    {object}  statusResponse      "Success"
// @Failure      400    {object}  errorResponse       "Invalid input data or ID"
// @Failure      500    {object}  errorResponse       "Internal server error"
// @Router       /api/device-attributes [put]
func (h *Handler) UpdateDeviceAttribute(c *gin.Context) {
	var input models.UpdateDeviceAttribute
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.DeviceAttribute.Update(id, input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Delete device attribute
// @Description  Deletes a device attribute by ID
// @Tags         device_attributes
// @Accept       json
// @Produce      json
// @Param        id  query  int  true  "Device attribute ID"
// @Success      200  {object}  statusResponse  "Success"
// @Failure      400  {object}  errorResponse   "Invalid ID parameter"
// @Failure      500  {object}  errorResponse   "Internal server error"
// @Router       /api/device-attributes [delete]
func (h *Handler) DeleteDeviceAttribute(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.DeviceAttribute.Delete(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}
