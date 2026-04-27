package handler

import (
	"fmt"
	"net/http"
	"net/url"
	"runtime/debug"
	"strings"
	"sync/atomic"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

var requestCounter uint64

func requestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		requestID := getOrCreateRequestID(c.GetHeader("X-Request-ID"))

		c.Set(requestIDCtx, requestID)
		c.Writer.Header().Set("X-Request-ID", requestID)

		c.Next()

		status := c.Writer.Status()
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}

		fields := logrus.Fields{
			"event":      "http_request",
			"request_id": requestID,
			"status":     status,
			"method":     c.Request.Method,
			"path":       path,
			"client_ip":  c.ClientIP(),
			"latency_ms": float64(time.Since(start).Microseconds()) / 1000,
			"body_size":  c.Writer.Size(),
			"user_agent": c.Request.UserAgent(),
		}

		if query := sanitizeQuery(c.Request.URL.Query()); query != "" {
			fields["query"] = query
		}

		if userID, ok := c.Get(userCtx); ok {
			fields["user_id"] = userID
		}

		if role, ok := c.Get(userRoleCtx); ok {
			fields["role"] = role
		}

		if len(c.Errors) > 0 {
			fields["gin_errors"] = c.Errors.String()
		}

		entry := logrus.WithFields(fields)
		switch {
		case status >= http.StatusInternalServerError:
			entry.Error("request completed")
		case status >= http.StatusBadRequest:
			entry.Warn("request completed")
		default:
			entry.Info("request completed")
		}
	}
}

func recoveryLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if recovered := recover(); recovered != nil {
				requestID, _ := c.Get(requestIDCtx)
				fields := logrus.Fields{
					"event":      "panic_recovered",
					"request_id": requestID,
					"method":     c.Request.Method,
					"path":       c.Request.URL.Path,
					"client_ip":  c.ClientIP(),
					"panic":      fmt.Sprint(recovered),
					"stack":      string(debug.Stack()),
				}

				if userID, ok := c.Get(userCtx); ok {
					fields["user_id"] = userID
				}

				if role, ok := c.Get(userRoleCtx); ok {
					fields["role"] = role
				}

				logrus.WithFields(fields).Error("panic recovered")
				c.AbortWithStatusJSON(http.StatusInternalServerError, errorResponse{Message: "internal server error"})
			}
		}()

		c.Next()
	}
}

func getOrCreateRequestID(headerValue string) string {
	requestID := strings.TrimSpace(headerValue)
	if requestID != "" && len(requestID) <= 128 {
		return requestID
	}

	return fmt.Sprintf("%d-%d", time.Now().UnixNano(), atomic.AddUint64(&requestCounter, 1))
}

func sanitizeQuery(values url.Values) string {
	if len(values) == 0 {
		return ""
	}

	clean := make(url.Values, len(values))
	for key, value := range values {
		if isSensitiveLogKey(key) {
			continue
		}
		clean[key] = value
	}

	return clean.Encode()
}

func isSensitiveLogKey(key string) bool {
	key = strings.ToLower(strings.TrimSpace(key))
	return strings.Contains(key, "password") ||
		strings.Contains(key, "token") ||
		strings.Contains(key, "secret") ||
		strings.Contains(key, "authorization")
}
