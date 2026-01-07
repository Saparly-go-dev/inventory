package handler

import (
	"inventory/pkg/repository"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary Get All Devices
// @Description Get a list of all devices with optional filters
// @Tags dashboard
// @Accept  json
// @Produce  json
// @Param model_id query int false "Model ID"
// @Param category_id query int false "Category ID"
// @Param brand_id query int false "Brand ID"
// @Param room_number query int false "Room Number"
// @Param employee_id query int false "Employee ID"
// @Param status query string false "Status"
// @Param attribute_id query int false "Attribute ID"
// @Param attribute_options query string false "Attribute Options"
// @Param attribute_info query string false "Attribute Info"
// @Success 200 {array} models.Device
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /api/dashboard/devices [get]
// @Security ApiKeyAuth
func (h *Handler) getAllDevices(c *gin.Context) {
	filters, err := h.parseDeviceFilters(c)
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid filter parameters: "+err.Error())
		return
	}

	devices, err := h.services.Dashboard.GetAllDevices(filters)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, devices)
}

// @Summary Export All Devices
// @Description Export a list of all devices to an Excel file with optional filters
// @Tags dashboard
// @Accept  json
// @Produce  octet-stream
// @Param model_id query int false "Model ID"
// @Param category_id query int false "Category ID"
// @Param brand_id query int false "Brand ID"
// @Param room_number query int false "Room Number"
// @Param employee_id query int false "Employee ID"
// @Param status query string false "Status"
// @Param attribute_id query int false "Attribute ID"
// @Param attribute_options query string false "Attribute Options"
// @Param attribute_info query string false "Attribute Info"
// @Success 200 {file} file
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /api/dashboard/devices/export [get]
// @Security ApiKeyAuth
func (h *Handler) exportAllDevices(c *gin.Context) {
	filters, err := h.parseDeviceFilters(c)
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid filter parameters: "+err.Error())
		return
	}

	fileBytes, err := h.services.Dashboard.ExportAllDevicesToExcel(filters)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=devices.xlsx")
	c.Data(http.StatusOK, "application/octet-stream", fileBytes)
}

func (h *Handler) parseDeviceFilters(c *gin.Context) (repository.DeviceFilters, error) {
	var filters repository.DeviceFilters
	var err error

	if modelIDStr := c.Query("model_id"); modelIDStr != "" {
		val, err := strconv.Atoi(modelIDStr)
		if err != nil {
			return filters, err
		}
		filters.ModelID = &val
	}
	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		val, err := strconv.Atoi(categoryIDStr)
		if err != nil {
			return filters, err
		}
		filters.CategoryID = &val
	}
	if brandIDStr := c.Query("brand_id"); brandIDStr != "" {
		val, err := strconv.Atoi(brandIDStr)
		if err != nil {
			return filters, err
		}
		filters.BrandID = &val
	}
	if roomNumberStr := c.Query("room_number"); roomNumberStr != "" {
		val, err := strconv.Atoi(roomNumberStr)
		if err != nil {
			return filters, err
		}
		filters.RoomNumber = &val
	}
	if employeeIDStr := c.Query("employee_id"); employeeIDStr != "" {
		val, err := strconv.Atoi(employeeIDStr)
		if err != nil {
			return filters, err
		}
		filters.EmployeeID = &val
	}
	if status := c.Query("status"); status != "" {
		filters.Status = &status
	}
	if attributeIDStr := c.Query("attribute_id"); attributeIDStr != "" {
		val, err := strconv.Atoi(attributeIDStr)
		if err != nil {
			return filters, err
		}
		filters.AttributeID = &val
	}
	if attributeOptions := c.Query("attribute_options"); attributeOptions != "" {
		filters.AttributeOptions = &attributeOptions
	}
	if attributeInfo := c.Query("attribute_info"); attributeInfo != "" {
		filters.AttributeInfo = &attributeInfo
	}

	return filters, err
}
