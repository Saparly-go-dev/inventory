package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Get Statistics
// @Description Get aggregated statistics for the dashboard
// @Tags dashboard
// @Accept  json
// @Produce  json
// @Success 200 {object} repository.StatisticsData
// @Failure 500 {object} errorResponse
// @Router /api/dashboard/statistics [get]
// @Security ApiKeyAuth
func (h *Handler) getStatistics(c *gin.Context) {
	data, err := h.services.Statistics.GetStatistics()
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, data)
}
