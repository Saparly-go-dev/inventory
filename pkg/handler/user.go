package handler

import (
	"inventory/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type userProfileResponse struct {
	Id          int                    `json:"id"`
	Name        string                 `json:"name"`
	Surname     string                 `json:"surname"`
	Patronymic  string                 `json:"patronymic"`
	Username    string                 `json:"username"`
	Role        string                 `json:"role"`
	RoleName    string                 `json:"role_name"`
	Status      bool                   `json:"status"`
	CreatedAt   string                 `json:"created_at"`
	UpdatedAt   string                 `json:"updated_at"`
	Permissions models.RolePermissions `json:"permissions"`
}

func toUserProfileResponse(user models.User, roleName string, permissions models.RolePermissions) userProfileResponse {
	return userProfileResponse{
		Id:          user.Id,
		Name:        user.Name,
		Surname:     user.Surname,
		Patronymic:  user.Patronymic,
		Username:    user.Username,
		Role:        normalizeRole(user.Role),
		RoleName:    roleName,
		Status:      user.Status,
		CreatedAt:   user.CreatedAt.Format("02.01.2006"),
		UpdatedAt:   user.UpdatedAt.Format("02.01.2006"),
		Permissions: permissions,
	}
}

// @Summary      Get Current User
// @Description  Returns the profile for the authenticated user
// @Tags         users
// @Produce      json
// @Success      200  {object}  userProfileResponse
// @Failure      401  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /api/users/me [get]
// @Security ApiKeyAuth
func (h *Handler) getCurrentUser(c *gin.Context) {
	userId, err := getUserId(c)
	if err != nil {
		return
	}

	user, err := h.services.User.GetById(userId)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	permissions, err := getUserPermissions(c)
	if err != nil {
		return
	}

	roleName := normalizeRole(user.Role)
	if role, err := h.services.Role.GetByCode(roleName); err == nil && role.Name != "" {
		roleName = role.Name
	}

	c.JSON(http.StatusOK, toUserProfileResponse(user, roleName, permissions))
}

// @Summary      Create User
// @Description  Creates a new user
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        input  body      models.CreateUser  true  "User Info"
// @Success      200    {object}  statusResponse
// @Failure      400    {object}  errorResponse
// @Failure      500    {object}  errorResponse
// @Router       /api/users [post]
// @Security ApiKeyAuth
func (h *Handler) createUser(c *gin.Context) {
	var input models.CreateUser

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.services.User.Create(input)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{
		Status: "success",
	})
}

// @Summary      Get Users Page
// @Description  Returns a paginated list of users
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        pageSize    query     int     true  "Page Size"
// @Param        pageNumber  query     int     true  "Page Number"
// @Param        name        query     string  false "User Name"
// @Param        surname     query     string  false "User Surname"
// @Param        patronymic  query     string  false "User Patronymic"
// @Param        username    query     string  false "Username"
// @Success      200         {array}   models.User
// @Failure      400         {object}  errorResponse
// @Failure      500         {object}  errorResponse
// @Router       /api/users [get]
// @Security ApiKeyAuth
func (h *Handler) getUserPage(c *gin.Context) {

	pageSize, pageNumber, ok := parsePageParams(c)
	if !ok {
		return
	}

	name := c.Query("name")
	surname := c.Query("surname")
	patronymic := c.Query("patronymic")
	username := c.Query("username")

	result, err := h.services.GetUserPage(pageSize, pageNumber, name, surname, patronymic, username)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, result)
}

// @Summary      Change User Status
// @Description  Changes the status of a user by ID
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "User ID"
// @Success      200  {object}  statusResponse
// @Failure      400  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /api/users/{id}/status [patch]
// @Security ApiKeyAuth
func (h *Handler) changeUserStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.User.ChangeStatus(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{
		Status: "OK",
	})
}

// @Summary      Delete User
// @Description  Deletes a user by ID
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id   path      int  true  "User ID"
// @Success      200  {object}  statusResponse
// @Failure      400  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /api/users/{id} [delete]
// @Security ApiKeyAuth
func (h *Handler) deleteUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.User.Delete(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{
		Status: "OK",
	})
}

// @Summary      Update User
// @Description  Updates an existing user's data
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        id     path      int              true  "User ID"
// @Param        input  body      models.CreateUser  true  "Updated User Info"
// @Success      200    {object}  statusResponse
// @Failure      400    {object}  errorResponse
// @Failure      500    {object}  errorResponse
// @Router       /api/users/{id} [put]
// @Security ApiKeyAuth
func (h *Handler) updateUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	var inpput models.CreateUser
	if err := c.BindJSON(&inpput); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err = h.services.User.Update(id, inpput)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{
		Status: "OK",
	})
}

// @Summary      Change user password
// @Description  Changes the password for a user account
// @Tags         users
// @Accept       json
// @Produce      json
// @Param        input  body      models.Change_Password  true  "Change password request"
// @Success      200    {object}  statusResponse          "Password successfully changed"
// @Failure      400    {object}  errorResponse           "Invalid request format"
// @Failure      500    {object}  errorResponse           "Internal server error"
// @Router       /api/users/password [post]
// @Security ApiKeyAuth
func (h *Handler) changeUserPassword(c *gin.Context) {
	var inpput models.Change_Password
	if err := c.BindJSON(&inpput); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	err := h.services.User.ChangePassword(inpput)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, statusResponse{
		Status: "OK",
	})
}
