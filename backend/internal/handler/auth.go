// Package handler 集中存放 HTTP 处理函数。
package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"github.com/coolci/ovh-buy/backend/internal/auth"
	"github.com/coolci/ovh-buy/backend/internal/config"
	"github.com/coolci/ovh-buy/backend/internal/middleware"
	"github.com/coolci/ovh-buy/backend/internal/model"
)

// AuthHandler 处理注册、登录、登出、当前用户。
type AuthHandler struct {
	DB     *gorm.DB
	Cfg    *config.Config
	Logger *zap.Logger
	v      *validator.Validate
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config, log *zap.Logger) *AuthHandler {
	return &AuthHandler{DB: db, Cfg: cfg, Logger: log, v: validator.New()}
}

type registerReq struct {
	Username string `json:"username" validate:"required,min=3,max=32,alphanumunicode|containsany=_-"`
	Email    string `json:"email"    validate:"required,email,max=255"`
	Password string `json:"password" validate:"required,min=8,max=128"`
}

type loginReq struct {
	Username string `json:"username" validate:"required,min=3,max=64"`
	Password string `json:"password" validate:"required,min=1,max=128"`
}

type tokenResp struct {
	AccessToken string     `json:"access_token"`
	User        userPublic `json:"user"`
}

type userPublic struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

func toPublic(u *model.User) userPublic {
	return userPublic{ID: u.ID.String(), Username: u.Username, Email: u.Email, Role: u.Role}
}

// Register POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "请求格式错误"})
		return
	}
	if err := h.v.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "输入校验失败: " + err.Error()})
		return
	}

	// 唯一性检查
	var count int64
	h.DB.Model(&model.User{}).Where("username = ? OR email = ?", req.Username, req.Email).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"message": "用户名或邮箱已被使用"})
		return
	}

	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "密码处理失败"})
		return
	}

	// 第一个用户默认设为管理员
	var existing int64
	h.DB.Model(&model.User{}).Count(&existing)
	role := "user"
	if existing == 0 {
		role = "admin"
	}

	u := &model.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hash,
		Role:         role,
	}
	if err := h.DB.Create(u).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "创建用户失败"})
		return
	}

	tok, _ := auth.Issue(h.Cfg.JWTSecret, u.ID, u.Role, "access", h.Cfg.JWTAccessTTL)
	h.audit(c, &u.ID, "user.register", u.Username)
	c.JSON(http.StatusOK, tokenResp{AccessToken: tok, User: toPublic(u)})
}

// Login POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "请求格式错误"})
		return
	}
	if err := h.v.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "输入校验失败"})
		return
	}

	var u model.User
	if err := h.DB.Where("username = ? OR email = ?", req.Username, req.Username).First(&u).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "用户名或密码错误"})
		return
	}
	if u.Disabled {
		c.JSON(http.StatusForbidden, gin.H{"message": "账号已被禁用"})
		return
	}
	if !auth.VerifyPassword(u.PasswordHash, req.Password) {
		h.audit(c, &u.ID, "user.login_failed", u.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"message": "用户名或密码错误"})
		return
	}

	now := time.Now()
	u.LastLoginAt = &now
	h.DB.Model(&u).Update("last_login_at", now)

	tok, _ := auth.Issue(h.Cfg.JWTSecret, u.ID, u.Role, "access", h.Cfg.JWTAccessTTL)
	h.audit(c, &u.ID, "user.login", u.Username)
	c.JSON(http.StatusOK, tokenResp{AccessToken: tok, User: toPublic(&u)})
}

// Logout POST /api/auth/logout （前端清除 token；服务端记录审计）
func (h *AuthHandler) Logout(c *gin.Context) {
	uid := middleware.MustUserID(c)
	h.audit(c, &uid, "user.logout", "")
	c.JSON(http.StatusOK, gin.H{"message": "已退出登录"})
}

// Me GET /api/auth/me
func (h *AuthHandler) Me(c *gin.Context) {
	uid := middleware.MustUserID(c)
	var u model.User
	if err := h.DB.First(&u, "id = ?", uid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "用户不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"user": toPublic(&u)})
}

func (h *AuthHandler) audit(c *gin.Context, uid *interface{ String() string }, action, target string) {
	go func() {
		var u *gormUUID
		if uid != nil {
			s := (*uid).String()
			u = parseUUID(s)
		}
		_ = h.DB.Create(&model.AuditLog{
			UserID:    (*gormUUIDPtr)(u),
			Action:    action,
			Target:    target,
			IP:        c.ClientIP(),
			UserAgent: c.Request.UserAgent(),
		}).Error
	}()
}
