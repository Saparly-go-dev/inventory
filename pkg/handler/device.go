package handler

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"inventory/models"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

// @Summary      Create a new device
// @Description  Creates a new device with the provided data
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
// @Param        photo        formData  file                  false "Device photo"
// @Success      200          {object}  statusResponse        "Success"
// @Failure      400          {object}  errorResponse         "Invalid input data"
// @Failure      500          {object}  errorResponse         "Internal server error"
// @Router       /api/devices [post]
func (h *Handler) CreateDevice(c *gin.Context) {
	var input models.UpdateDevice
	if err := c.ShouldBind(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	file, err := c.FormFile("photo")
	if err == nil {
		filePath, err := uploadFile(file)
		if err != nil {
			newErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		input.Photo = filePath
	}

	err = h.services.Device.Create(input)
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
// @Param        photo        formData  file                  false "Device photo"
// @Success      200          {object}  statusResponse        "Success"
// @Failure      400          {object}  errorResponse         "Invalid input data or ID"
// @Failure      500          {object}  errorResponse         "Internal server error"
// @Router       /api/devices [put]
func (h *Handler) UpdateDevice(c *gin.Context) {
	var input models.UpdateDevice
	if err := c.ShouldBind(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	file, err := c.FormFile("photo")
	if err == nil {
		filePath, err := uploadFile(file)
		if err != nil {
			newErrorResponse(c, http.StatusInternalServerError, err.Error())
			return
		}
		input.Photo = filePath
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
