package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/wire"
)

// JWTAuthMiddleware JWT 认证中间件类型
type JWTAuthMiddleware func(*gin.Context)

// AdminAuthMiddleware 管理员认证中间件类型
type AdminAuthMiddleware func(*gin.Context)

// ProviderSet 中间件层的依赖注入
var ProviderSet = wire.NewSet(
	NewJWTAuthMiddleware,
	NewAdminAuthMiddleware,
)
