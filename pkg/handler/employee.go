package handler

import (
	"inventory/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary      Create a new employee
// @Description  Creates a new employee with the provided data
// @Tags         employees
// @Accept       json
// @Produce      json
// @Param        input  body      models.UpdateEmployee  true  "Employee creation data"
// @Success      200    {object}  statusResponse         "Success"
// @Failure      400    {object}  errorResponse          "Invalid input data"
// @Failure      500    {object}  errorResponse          "Internal server error"
// @Router       /api/employees/ [post]
// @Security ApiKeyAuth
func (h *Handler) CreateEmployee(c *gin.Context) {
	var input models.UpdateEmployee

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.services.Employee.Create(input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get paginated employees
// @Description  Returns a paginated list of employees, optionally filtered by full name and room numbers
// @Tags         employees
// @Accept       json
// @Produce      json
// @Param        page_size     query     int     true   "Number of items per page"
// @Param        page_number   query     int     true   "Page number to retrieve"
// @Param        name          query     string  false  "Filter by employee full name"
// @Param        room_numbers  query     string  false  "Filter by comma-separated room numbers"
// @Success      200           {object}  object  "Paginated list of employees"
// @Failure      400           {object}  errorResponse  "Invalid query parameters"
// @Failure      500           {object}  errorResponse  "Internal server error"
// @Router       /api/employees [get]
// @Security ApiKeyAuth
func (h *Handler) GetEmployeePage(c *gin.Context) {
	pageSize, pageNumber, ok := parsePageParams(c)
	if !ok {
		return
	}

	name := c.Query("name")
	roomNumbersStr := c.Query("room_numbers")
	var roomNumbers []int
	if roomNumbersStr != "" {
		roomNumberStrs := strings.Split(roomNumbersStr, ",")
		for _, s := range roomNumberStrs {
			n, err := strconv.Atoi(s)
			if err == nil {
				roomNumbers = append(roomNumbers, n)
			}
		}
	}

	result, err := h.services.Employee.GetPage(name, roomNumbers, pageSize, pageNumber)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary      Update employee
// @Description  Updates an existing employee with the provided data
// @Tags         employees
// @Accept       json
// @Produce      json
// @Param        id     query     int                   true  "Employee ID"
// @Param        input  body      models.UpdateEmployee  true  "Employee update data"
// @Success      200    {object}  statusResponse        "Success"
// @Failure      400    {object}  errorResponse         "Invalid input data or ID"
// @Failure      500    {object}  errorResponse         "Internal server error"
// @Router       /api/employees [put]
// @Security ApiKeyAuth
func (h *Handler) UpdateEmployee(c *gin.Context) {
	var input models.UpdateEmployee
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Employee.Update(id, input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Delete employee
// @Description  Deletes an employee by ID
// @Tags         employees
// @Accept       json
// @Produce      json
// @Param        id  query  int  true  "Employee ID"
// @Success      200  {object}  statusResponse  "Success"
// @Failure      400  {object}  errorResponse   "Invalid ID parameter"
// @Failure      500  {object}  errorResponse   "Internal server error"
// @Router       /api/employees [delete]
// @Security ApiKeyAuth
func (h *Handler) DeleteEmployee(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.Employee.Delete(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get employees by selected object
// @Description  Returns employees filtered by selected object name (full name)
// @Tags         employees
// @Accept       json
// @Produce      json
// @Param        name  query  string  false  "Selected object name"
// @Success      200   {object}  object  "List of employees"
// @Failure      400   {object}  errorResponse  "Invalid query parameters"
// @Failure      500   {object}  errorResponse  "Internal server error"
// @Router       /api/employees/selected [get]
// @Security ApiKeyAuth
func (h *Handler) GetEmployeeBySelectedObject(c *gin.Context) {
	name := c.Query("name")

	result, err := h.services.Employee.GetEmployeesInSelectedObjects(name)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary      Get employee by ID
// @Description  Returns employee details for a given ID
// @Tags         employees
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Employee ID"
// @Success      200  {object}  models.Employee
// @Failure      400  {object}  errorResponse  "Invalid ID format"
// @Failure      500  {object}  errorResponse  "Internal server error"
// @Router       /api/employees/{id} [get]
// @Security ApiKeyAuth
func (h *Handler) GetEmployeeById(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid id param")
		return
	}

	employee, err := h.services.Employee.GetById(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, employee)
}

// @Summary      Get employee by ID with assigned devices
// @Description  Returns employee details along with a list of their assigned devices and device attributes
// @Tags         employees
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "Employee ID"
// @Success      200  {object}  models.EmployeeWithDevices
// @Failure      400  {object}  errorResponse  "Invalid ID format"
// @Failure      500  {object}  errorResponse  "Internal server error"
// @Router       /api/employees/{id}/with-devices [get]
// @Security ApiKeyAuth
func (h *Handler) GetEmployeeByIdWithDevices(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid id param")
		return
	}

	employee, err := h.services.Employee.GetByIdWithDevices(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, employee)
}

// @Summary      Sync employees from MySQL
// @Description  Triggers a synchronization of employees from an external MySQL database
// @Tags         employees
// @Accept       json
// @Produce      json
// @Success      200  {object}  statusResponse  "Success"
// @Failure      500  {object}  errorResponse   "Internal server error"
// @Router       /api/employees/sync [post]
// @Security ApiKeyAuth
func (h *Handler) SyncEmployees(c *gin.Context) {
	err := h.services.Employee.SyncEmployeesFromMySQL()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}
