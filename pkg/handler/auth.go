package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type signInInput struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// @Summary      Sign In
// @Description  Authenticates user and returns a JWT token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input  body      signInInput  true  "Login Credentials"
// @Success      200    {object}  map[string]string  "token response"
// @Failure      400    {object}  errorResponse
// @Failure      500    {object}  errorResponse
// @Router       /api/auth/signIn [post]
func (h *Handler) singIn(c *gin.Context) {
	var input signInInput

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	result, err := h.services.Authorization.GenerateToken(input.Username, input.Password)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}
