package utils

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuthMiddleware 基于角色的 JWT 鉴权
func AuthMiddleware(requiredRole int) gin.HandlerFunc {
	return func(c *gin.Context) {
		jwtTools := NewJWTTools()

		// 解析 Authorization 头，支持 "Bearer <TOKEN>" 格式
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization token required"})
			return
		}

		// 处理 "Bearer <TOKEN>" 结构
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) == 2 && strings.ToLower(tokenParts[0]) == "bearer" {
			authHeader = tokenParts[1]
		}

		// 解析 JWT 令牌
		claims, err := jwtTools.ParseToken(authHeader)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization token"})
			return
		}

		// 权限检查（假设数字越小权限越高）
		if claims.Role > requiredRole {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			return
		}

		// 将解析后的 claims 存入上下文，方便后续使用（例如获取用户ID）
		c.Set("userId", claims.UserID) // 用户ID
		c.Set("role", claims.Role)     // 用户角色
		c.Next()
	}
}
