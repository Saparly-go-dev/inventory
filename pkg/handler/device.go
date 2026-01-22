package handler

import (
	"encoding/json"
	"fmt"
	"inventory/models"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

// @Summary      Create a new device
// @Description  Creates a new device with form data. Attributes should be a JSON string.
// @Tags         devices
// @Accept       mpfd
// @Produce      json
// @Param        name         formData  string                true  "Device name"
// @Param        description  formData  string                true  "Device description"
// @Param        info         formData  string                false "Device info"
// @Param        status       formData  string                true  "Device status"
// @Param        brand_id     formData  int                   true  "Brand ID"
// @Param        model_id     formData  int                   true  "Model ID"
// @Param        category_id  formData  int                   true  "Category ID"
// @Param        attributes   formData  string                false "Attributes as a JSON string array"
// @Param        photo        formData  file                  false "Device photo"
// @Success      200          {object}  statusResponse        "Success"
// @Failure      400          {object}  errorResponse         "Invalid input data"
// @Failure      500          {object}  errorResponse         "Internal server error"
// @Router       /api/devices [post]
// @Security ApiKeyAuth
func (h *Handler) CreateDevice(c *gin.Context) {
	var input models.UpdateDevice

	brandID, err := strconv.Atoi(c.PostForm("brand_id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid brand_id param")
		return
	}

	modelID, err := strconv.Atoi(c.PostForm("model_id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid model_id param")
		return
	}

	categoryID, err := strconv.Atoi(c.PostForm("category_id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid category_id param")
		return
	}

	input.Name = c.PostForm("name")
	input.Description = c.PostForm("description")
	input.Info = c.PostForm("info")
	input.Status = c.PostForm("status")
	input.BrandId = brandID
	input.ModelId = modelID
	input.CategoryId = categoryID

	// Handle attributes from JSON string
	attributesString := c.PostForm("attributes")
	if attributesString != "" {
		var attributes []models.UpdateDeviceAttribute
		if err := json.Unmarshal([]byte(attributesString), &attributes); err != nil {
			newErrorResponse(c, http.StatusBadRequest, "invalid attributes json format")
			return
		}
		input.Attributes = attributes
	}

	// Handle file upload
	file, err := c.FormFile("photo")
	if err == nil {
		filePath, err := uploadFile(file)
		if err != nil {
			newErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		input.Photo = filePath
	}

	if err := h.services.Device.Create(input); err != nil {
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
// @Security ApiKeyAuth
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
// @Description  Updates an existing device with form data. Attributes should be a JSON string.
// @Tags         devices
// @Accept       mpfd
// @Produce      json
// @Param        id           query     int                   true  "Device ID"
// @Param        name         formData  string                true  "Device name"
// @Param        description  formData  string                true  "Device description"
// @Param        info         formData  string                false "Device info"
// @Param        status       formData  string                true  "Device status"
// @Param        brand_id     formData  int                   true  "Brand ID"
// @Param        model_id     formData  int                   true  "Model ID"
// @Param        category_id  formData  int                   true  "Category ID"
// @Param        attributes   formData  string                false "Attributes as a JSON string array"
// @Param        photo        formData  file                  false "Device photo"
// @Success      200          {object}  statusResponse        "Success"
// @Failure      400          {object}  errorResponse         "Invalid input data or ID"
// @Failure      500          {object}  errorResponse         "Internal server error"
// @Router       /api/devices [put]
// @Security ApiKeyAuth
func (h *Handler) UpdateDevice(c *gin.Context) {
	var input models.UpdateDevice

	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid id param")
		return
	}

	brandID, err := strconv.Atoi(c.PostForm("brand_id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid brand_id param")
		return
	}

	modelID, err := strconv.Atoi(c.PostForm("model_id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid model_id param")
		return
	}

	categoryID, err := strconv.Atoi(c.PostForm("category_id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid category_id param")
		return
	}

	input.Name = c.PostForm("name")
	input.Description = c.PostForm("description")
	input.Info = c.PostForm("info")
	input.Status = c.PostForm("status")
	input.BrandId = brandID
	input.ModelId = modelID
	input.CategoryId = categoryID

	// Handle attributes from JSON string
	attributesString := c.PostForm("attributes")
	if attributesString != "" {
		var attributes []models.UpdateDeviceAttribute
		if err := json.Unmarshal([]byte(attributesString), &attributes); err != nil {
			newErrorResponse(c, http.StatusBadRequest, "invalid attributes json format")
			return
		}
		input.Attributes = attributes
	}

	// Handle file upload
	file, err := c.FormFile("photo")
	if err == nil {
		filePath, err := uploadFile(file)
		if err != nil {
			newErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		input.Photo = filePath
	}

	if err := h.services.Device.Update(id, input); err != nil {
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
// @Security ApiKeyAuth
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

// @Summary      Clone device
// @Description  Clones a device N times
// @Tags         devices
// @Accept       json
// @Produce      json
// @Param        id     path     int  true  "Device ID"
// @Param        input  body     map[string]int  true  "Count input"
// @Success      200    {object}  statusResponse  "Success"
// @Failure      400    {object}  errorResponse   "Invalid ID or input"
// @Failure      500    {object}  errorResponse   "Internal server error"
// @Router       /api/devices/{id}/clone [post]
// @Security ApiKeyAuth
func (h *Handler) CloneDevice(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid id param")
		return
	}

	var input struct {
		Count int `json:"count"`
	}

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if input.Count <= 0 {
		newErrorResponse(c, http.StatusBadRequest, "count must be greater than 0")
		return
	}

	if err := h.services.Device.Clone(id, input.Count); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

func uploadFile(file *multipart.FileHeader) (string, error) {
	// Generate a unique file name
	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), filepath.Ext(file.Filename))
	filePath := filepath.Join("uploads/devices", fileName)

	// Create the destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Copy the uploaded file to the destination file
	if _, err := io.Copy(dst, src); err != nil {
		return "", err
	}

	return filePath, nil
}

// @Summary      Import devices
// @Description  Import devices from Excel file
// @Tags         dashboard
// @Accept       mpfd
// @Produce      json
// @Param        file   formData  file  true  "Excel File"
// @Success      200    {object}  statusResponse  "Success"
// @Failure      400    {object}  errorResponse   "Invalid file"
// @Failure      500    {object}  errorResponse   "Internal server error"
// @Router       /api/dashboard/devices/import [post]
// @Security ApiKeyAuth
func (h *Handler) ImportDevices(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "file is required")
		return
	}

	f, err := file.Open()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer f.Close()

	if err := h.services.Device.Import(f); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

// @Summary      Get import template
// @Description  Download Excel template for devices import
// @Tags         dashboard
// @Produce      application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
// @Success      200  {file}    file            "Excel template"
// @Failure      500  {object}  errorResponse   "Internal server error"
// @Router       /api/dashboard/devices/template [get]
// @Security ApiKeyAuth
func (h *Handler) GetImportTemplate(c *gin.Context) {
	f := excelize.NewFile()
	defer f.Close()

	// Create header
	headers := []string{"Name", "Description", "Info", "Status", "Brand", "Model", "Category"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue("Sheet1", cell, header)
	}

	// Set buffer to response
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=devices_template.xlsx")

	if err := f.Write(c.Writer); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
}
