package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func parsePageParams(c *gin.Context) (int, int, bool) {
	pageSizeRaw := c.Query("page_size")
	if pageSizeRaw == "" {
		pageSizeRaw = c.Query("pageSize")
	}

	pageNumberRaw := c.Query("page_number")
	if pageNumberRaw == "" {
		pageNumberRaw = c.Query("pageNumber")
	}

	pageSize, err := strconv.Atoi(pageSizeRaw)
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid page size")
		return 0, 0, false
	}

	pageNumber, err := strconv.Atoi(pageNumberRaw)
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid page number")
		return 0, 0, false
	}

	if pageSize <= 0 {
		newErrorResponse(c, http.StatusBadRequest, "page size must be greater than 0")
		return 0, 0, false
	}

	if pageNumber <= 0 {
		newErrorResponse(c, http.StatusBadRequest, "page number must be greater than 0")
		return 0, 0, false
	}

	return pageSize, pageNumber, true
}
