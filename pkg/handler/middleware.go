package handler

import (
	"errors"
	"inventory/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

const (
	authorizationHeader = "Authorization"
	userCtx             = "userId"
	userRoleCtx         = "userRole"
	userPermissionsCtx  = "userPermissions"
	requestIDCtx        = "requestId"
)

func (h *Handler) userIdentity(c *gin.Context) {
	header := c.GetHeader(authorizationHeader)
	if header == "" {
		newErrorResponse(c, http.StatusUnauthorized, "empty auth header")
		return
	}

	headerPartds := strings.Split(header, " ")
	if len(headerPartds) != 2 {
		newErrorResponse(c, http.StatusUnauthorized, "invalid auth header")
		return
	}

	// parse token
	userId, err := h.services.Authorization.ParseToken(headerPartds[1])
	if err != nil {
		newErrorResponse(c, http.StatusUnauthorized, err.Error())
		return
	}

	c.Set(userCtx, userId)

	user, err := h.services.User.GetById(userId)
	if err != nil {
		newErrorResponse(c, http.StatusUnauthorized, "user not found")
		return
	}

	role := normalizeRole(user.Role)
	c.Set(userRoleCtx, role)
	c.Set(userPermissionsCtx, h.services.Role.GetPermissionsByCode(role))
}

func getUserId(c *gin.Context) (int, error) {
	id, ok := c.Get(userCtx)
	if !ok {
		newErrorResponse(c, http.StatusInternalServerError, "user id not found")
		return 0, errors.New("user id not found")
	}

	idInt, ok := id.(int)
	if !ok {
		newErrorResponse(c, http.StatusInternalServerError, "user id is not invalid type")
		return 0, errors.New("user id is not invalid type")
	}

	return idInt, nil
}

func (h *Handler) requireRoles(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, err := getUserRole(c)
		if err != nil {
			return
		}

		if role == "admin" {
			c.Next()
			return
		}

		for _, allowedRole := range roles {
			if role == normalizeRole(allowedRole) {
				c.Next()
				return
			}
		}

		newErrorResponse(c, http.StatusForbidden, "permission denied")
	}
}

func (h *Handler) requirePermission(permission string) gin.HandlerFunc {
	return func(c *gin.Context) {
		permissions, err := getUserPermissions(c)
		if err != nil {
			return
		}

		role, err := getUserRole(c)
		if err != nil {
			return
		}

		if role == "admin" {
			c.Next()
			return
		}

		switch permission {
		case "users.manage":
			if permissions.CanManageUsers {
				c.Next()
				return
			}
		case "roles.manage":
			if permissions.CanManageRoles {
				c.Next()
				return
			}
		case "inventory.view":
			if permissions.CanViewInventory || permissions.CanView || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "inventory.create":
			if permissions.CanCreateInventory || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "inventory.update":
			if permissions.CanUpdateInventory || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "inventory.delete":
			if permissions.CanDeleteInventory || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "devices.assign":
			if permissions.CanAssignDevices || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "devices.return":
			if permissions.CanReturnDevices || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "devices.import":
			if permissions.CanImportDevices || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "devices.export":
			if permissions.CanExportDevices || permissions.CanView || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "devices.clone":
			if permissions.CanCloneDevices || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "employees.sync":
			if permissions.CanSyncEmployees || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "statistics.view":
			if permissions.CanViewStatistics || permissions.CanView || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "furnitures.view":
			if permissions.CanViewFurnitures || permissions.CanManageInventory || permissions.CanView {
				c.Next()
				return
			}
		case "furnitures.create":
			if permissions.CanCreateFurnitures || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "furnitures.update":
			if permissions.CanUpdateFurnitures || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "furnitures.delete":
			if permissions.CanDeleteFurnitures || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "furnitures.assign":
			if permissions.CanAssignFurnitures || permissions.CanManageInventory {
				c.Next()
				return
			}
		case "furnitures.return":
			if permissions.CanReturnFurnitures || permissions.CanManageInventory {
				c.Next()
				return
			}
		}

		newErrorResponse(c, http.StatusForbidden, "permission denied")
	}
}

func getUserPermissions(c *gin.Context) (models.RolePermissions, error) {
	permissions, ok := c.Get(userPermissionsCtx)
	if !ok {
		newErrorResponse(c, http.StatusInternalServerError, "user permissions not found")
		return models.RolePermissions{}, errors.New("user permissions not found")
	}

	permissionsValue, ok := permissions.(models.RolePermissions)
	if !ok {
		newErrorResponse(c, http.StatusInternalServerError, "user permissions is invalid type")
		return models.RolePermissions{}, errors.New("user permissions is invalid type")
	}

	return permissionsValue, nil
}

func getUserRole(c *gin.Context) (string, error) {
	role, ok := c.Get(userRoleCtx)
	if !ok {
		newErrorResponse(c, http.StatusInternalServerError, "user role not found")
		return "", errors.New("user role not found")
	}

	roleString, ok := role.(string)
	if !ok {
		newErrorResponse(c, http.StatusInternalServerError, "user role is invalid type")
		return "", errors.New("user role is invalid type")
	}

	return roleString, nil
}

func normalizeRole(role string) string {
	role = strings.ToLower(strings.TrimSpace(role))

	switch role {
	case "string":
		return "admin"
	case "":
		return "viewer"
	default:
		return role
	}
}
