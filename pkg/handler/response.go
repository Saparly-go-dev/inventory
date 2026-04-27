package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type errorResponse struct {
	Message string `json:"message"`
}

type statusResponse struct {
	Status string `json:"status"`
}

func newErrorResponse(c *gin.Context, statuscode int, message string) {
	fields := logrus.Fields{
		"event":   "error_response",
		"status":  statuscode,
		"message": message,
	}

	if c != nil {
		fields["method"] = c.Request.Method
		fields["path"] = c.Request.URL.Path
		fields["client_ip"] = c.ClientIP()

		if requestID, ok := c.Get(requestIDCtx); ok {
			fields["request_id"] = requestID
		}

		if userID, ok := c.Get(userCtx); ok {
			fields["user_id"] = userID
		}

		if role, ok := c.Get(userRoleCtx); ok {
			fields["role"] = role
		}
	}

	if statuscode >= http.StatusInternalServerError {
		logrus.WithFields(fields).Error("request failed")
	} else {
		logrus.WithFields(fields).Warn("request rejected")
	}

	c.AbortWithStatusJSON(statuscode, errorResponse{message})
}
