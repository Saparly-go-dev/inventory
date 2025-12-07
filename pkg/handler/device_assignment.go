package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// локальный тип для тела запросов выдачи/возврата
type deviceAssignmentInput struct {
	DeviceID   int `json:"device_id" binding:"required"`
	EmployeeID int `json:"employee_id" binding:"required"`
}

// @Summary      Assign device to employee
// @Description  Assigns a device to an employee (creates active assignment and sets device status to 'assigned')
// @Tags         devices
// @Accept       json
// @Produce      json
// @Param        input  body      deviceAssignmentInput  true  "Device and employee IDs"
// @Success      200    {object}  statusResponse         "Success"
// @Failure      400    {object}  errorResponse          "Invalid input data"
// @Failure      500    {object}  errorResponse          "Internal server error"
// @Router       /api/devices/assign [post]
func (h *Handler) AssignDeviceToEmployee(c *gin.Context) {
	var input deviceAssignmentInput
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if input.DeviceID <= 0 || input.EmployeeID <= 0 {
		newErrorResponse(c, http.StatusBadRequest, "invalid device_id or employee_id")
		return
	}

	err := h.services.DeviceAssignment.AssignDeviceToEmployee(input.DeviceID, input.EmployeeID)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Return device from employee
// @Description  Marks device as returned from employee (closes assignment and sets device status to 'in_stock')
// @Tags         devices
// @Accept       json
// @Produce      json
// @Param        input  body      deviceAssignmentInput  true  "Device and employee IDs"
// @Success      200    {object}  statusResponse         "Success"
// @Failure      400    {object}  errorResponse          "Invalid input data"
// @Failure      500    {object}  errorResponse          "Internal server error"
// @Router       /api/devices/return [post]
func (h *Handler) ReturnDeviceFromEmployee(c *gin.Context) {
	var input deviceAssignmentInput
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if input.DeviceID <= 0 || input.EmployeeID <= 0 {
		newErrorResponse(c, http.StatusBadRequest, "invalid device_id or employee_id")
		return
	}

	err := h.services.DeviceAssignment.ReturnDeviceFromEmployee(input.DeviceID, input.EmployeeID)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get employee devices
// @Description  Returns all currently assigned devices for a specific employee
// @Tags         devices
// @Accept       json
// @Produce      json
// @Param        employee_id  query     int     true   "Employee ID"
// @Success      200          {object}  object  "List of devices"
// @Failure      400          {object}  errorResponse  "Invalid query parameters"
// @Failure      500          {object}  errorResponse  "Internal server error"
// @Router       /api/employees/devices [get]
func (h *Handler) GetEmployeeDevices(c *gin.Context) {
	empID, err := strconv.Atoi(c.Query("employee_id"))
	if err != nil || empID <= 0 {
		newErrorResponse(c, http.StatusBadRequest, "invalid employee_id")
		return
	}

	devices, err := h.services.DeviceAssignment.GetEmployeeDevices(empID)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, devices)
}

// @Summary      Get available devices
// @Description  Returns all devices with status 'in_stock'
// @Tags         devices
// @Accept       json
// @Produce      json
// @Success      200  {object}  object        "List of available devices"
// @Failure      500  {object}  errorResponse "Internal server error"
// @Router       /api/devices/available [get]
func (h *Handler) GetAvailableDevices(c *gin.Context) {
	devices, err := h.services.DeviceAssignment.GetAvailableDevices()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, devices)
}
