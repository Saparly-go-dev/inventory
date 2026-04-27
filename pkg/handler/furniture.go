package handler

import (
	"inventory/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func (h *Handler) CreateFurniture(c *gin.Context) {
	input, ok := h.parseFurnitureForm(c)
	if !ok {
		return
	}
	uploadedPhotoPath := uploadedFurniturePhotoPath(input.Photo)

	if err := h.services.Furniture.Create(input); err != nil {
		deleteUploadedFile(uploadedPhotoPath)
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

func (h *Handler) GetFurniturePage(c *gin.Context) {
	pageSize, pageNumber, ok := parsePageParams(c)
	if !ok {
		return
	}

	result, err := h.services.Furniture.GetPage(c.Query("name"), pageSize, pageNumber)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) UpdateFurniture(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid id param")
		return
	}

	existingFurniture, err := h.services.Furniture.GetById(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	input, ok := h.parseFurnitureForm(c)
	if !ok {
		return
	}

	uploadedPhotoPath := uploadedFurniturePhotoPath(input.Photo)

	if err := h.services.Furniture.Update(id, input); err != nil {
		deleteUploadedFile(uploadedPhotoPath)
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	if uploadedPhotoPath != "" && existingFurniture.Photo != "" {
		deleteUploadedFile(existingFurniture.Photo)
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

func (h *Handler) DeleteFurniture(c *gin.Context) {
	id, err := strconv.Atoi(c.Query("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	existingFurniture, err := h.services.Furniture.GetById(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	if err := h.services.Furniture.Delete(id); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	deleteUploadedFile(existingFurniture.Photo)

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

func (h *Handler) GetAvailableFurniture(c *gin.Context) {
	result, err := h.services.Furniture.GetAvailable()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) GetFurnitureAllocations(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid id param")
		return
	}

	result, err := h.services.Furniture.GetAllocations(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *Handler) AssignFurniture(c *gin.Context) {
	var input models.AssignFurnitureInput
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.services.Furniture.Assign(input); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

func (h *Handler) ReturnFurniture(c *gin.Context) {
	var input models.ReturnFurnitureInput
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.services.Furniture.Return(input); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{"Success"})
}

func (h *Handler) parseFurnitureForm(c *gin.Context) (models.UpdateFurniture, bool) {
	var input models.UpdateFurniture

	categoryID, err := strconv.Atoi(c.PostForm("category_id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid category_id param")
		return input, false
	}

	totalQuantity, err := strconv.Atoi(c.PostForm("total_quantity"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid total_quantity param")
		return input, false
	}

	input.Name = c.PostForm("name")
	input.Description = c.PostForm("description")
	input.Info = c.PostForm("info")
	input.Photo = c.PostForm("photo")
	input.CategoryId = categoryID
	input.TotalQuantity = totalQuantity

	file, err := c.FormFile("photo")
	if err == nil {
		filePath, uploadErr := uploadFile(file, "furnitures")
		if uploadErr != nil {
			newErrorResponse(c, http.StatusInternalServerError, uploadErr.Error())
			return input, false
		}
		input.Photo = filePath
	}

	return input, true
}

func uploadedFurniturePhotoPath(path string) string {
	if path == "" {
		return ""
	}

	cleanPath := strings.ReplaceAll(path, "\\", "/")
	if strings.HasPrefix(cleanPath, "uploads/") {
		return path
	}

	return ""
}
