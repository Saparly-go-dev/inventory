package handler

import (
	"inventory/models"
	"net/http"
	"strconv"

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
func (h *Handler) CreateEmployee(c *gin.Context) {
	var input models.Employee

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
// @Description  Returns a paginated list of employees, optionally filtered by full name
// @Tags         employees
// @Accept       json
// @Produce      json
// @Param        page_size    query     int     true   "Number of items per page"
// @Param        page_number  query     int     true   "Page number to retrieve"
// @Param        name         query     string  false  "Filter by employee full name"
// @Success      200          {object}  object  "Paginated list of employees"
// @Failure      400          {object}  errorResponse  "Invalid query parameters"
// @Failure      500          {object}  errorResponse  "Internal server error"
// @Router       /api/employees [get]
func (h *Handler) GetEmployeePage(c *gin.Context) {
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

	result, err := h.services.Employee.GetPage(name, pageSize, pageNumber)
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
func (h *Handler) UpdateEmployee(c *gin.Context) {
	var input models.Employee
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
func (h *Handler) GetEmployeeBySelectedObject(c *gin.Context) {
	name := c.Query("name")

	result, err := h.services.Employee.GetEmployeesInSelectedObjects(name)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}
