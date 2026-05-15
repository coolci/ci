// Package middleware 提供 Gin 中间件：JWT 鉴权、限流、请求日志、CORS 配置。
package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"

	"github.com/coolci/ovh-buy/backend/internal/auth"
)

const (
	CtxUserID = "ctx_user_id"
	CtxRole   = "ctx_role"
)

// JWTAuth 校验 Authorization: Bearer <token>。
func JWTAuth(secret []byte) gin.HandlerFunc {
	return func(c *gin.Context) {
		h := c.GetHeader("Authorization")
		if !strings.HasPrefix(h, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "缺少认证令牌"})
			return
		}
		token := strings.TrimPrefix(h, "Bearer ")
		claims, err := auth.Parse(secret, token)
		if err != nil || claims.Type != "access" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"message": "认证令牌无效或已过期"})
			return
		}
		c.Set(CtxUserID, claims.UserID)
		c.Set(CtxRole, claims.Role)
		c.Next()
	}
}

// RequireRole 限制角色（如 admin）。
func RequireRole(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.GetString(CtxRole) != role {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "权限不足"})
			return
		}
		c.Next()
	}
}

// MustUserID 从上下文取 userID。
func MustUserID(c *gin.Context) uuid.UUID {
	v, _ := c.Get(CtxUserID)
	id, _ := v.(uuid.UUID)
	return id
}

// RateLimit 基于 Redis 的滑动窗口限流：key 维度 + 每分钟最大次数。
func RateLimit(rdb *redis.Client, prefix string, perMin int) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := prefix + ":" + c.ClientIP()
		ctx, cancel := context.WithTimeout(c.Request.Context(), 200*time.Millisecond)
		defer cancel()
		n, err := rdb.Incr(ctx, key).Result()
		if err == nil && n == 1 {
			rdb.Expire(ctx, key, time.Minute)
		}
		if n > int64(perMin) {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"message": "请求过于频繁，请稍后再试"})
			return
		}
		c.Next()
	}
}

// RequestLog 结构化访问日志。
func RequestLog(log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		log.Info("http",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("latency", time.Since(start)),
			zap.String("ip", c.ClientIP()),
		)
	}
}
