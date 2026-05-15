package api

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/coolci/ovh-buy/backend/internal/config"
	"github.com/coolci/ovh-buy/backend/internal/handler"
	"github.com/coolci/ovh-buy/backend/internal/middleware"
)

// NewRouter 装配所有路由。
func NewRouter(cfg *config.Config, db *gorm.DB, rdb *redis.Client, log *zap.Logger) *gin.Engine {
	if cfg.AppEnv == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(gin.Recovery(), middleware.RequestLog(log))

	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORSAllowed,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) })

	authH := handler.NewAuthHandler(db, cfg, log)

	api := r.Group("/api")
	{
		// 公共：登录注册（带严格限流）
		pub := api.Group("/auth")
		pub.Use(middleware.RateLimit(rdb, "auth", 20))
		pub.POST("/register", authH.Register)
		pub.POST("/login", authH.Login)

		// 受保护：JWT 鉴权 + 普通限流
		secured := api.Group("")
		secured.Use(middleware.JWTAuth(cfg.JWTSecret))
		secured.Use(middleware.RateLimit(rdb, "api", cfg.RateLimitPerMin))
		secured.POST("/auth/logout", authH.Logout)
		secured.GET("/auth/me", authH.Me)

		// TODO 第 2~4 期：
		// secured.GET/POST/PUT/DELETE("/ovh-accounts", ...)
		// secured.GET/POST("/catalog", ...)
		// secured.GET/POST("/tasks", ...)
		// secured.GET("/orders", ...)
		// secured.GET("/logs", ...)
		// secured.GET("/stats", ...)
	}

	return r
}
