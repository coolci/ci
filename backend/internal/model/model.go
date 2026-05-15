package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Base 所有表的公共字段。
type Base struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (b *Base) BeforeCreate(_ *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}

// User 系统用户。
type User struct {
	Base
	Username     string  `gorm:"size:32;uniqueIndex;not null" json:"username"`
	Email        string  `gorm:"size:255;uniqueIndex;not null" json:"email"`
	PasswordHash string  `gorm:"size:255;not null" json:"-"`
	Role         string  `gorm:"size:16;not null;default:'user'" json:"role"` // admin | user
	Disabled     bool    `gorm:"not null;default:false" json:"disabled"`
	LastLoginAt  *time.Time `json:"last_login_at,omitempty"`
}

// OVHAccount 用户配置的 OVH 凭证（密文存储）。
type OVHAccount struct {
	Base
	UserID         uuid.UUID `gorm:"type:uuid;index;not null" json:"user_id"`
	Name           string    `gorm:"size:64;not null" json:"name"`
	Endpoint       string    `gorm:"size:32;not null;default:'ovh-eu'" json:"endpoint"`
	AppKeyEnc      string    `gorm:"type:text;not null" json:"-"`
	AppSecretEnc   string    `gorm:"type:text;not null" json:"-"`
	ConsumerKeyEnc string    `gorm:"type:text;not null" json:"-"`
	Enabled        bool      `gorm:"not null;default:true" json:"enabled"`
}

// AuditLog 关键操作的审计日志。
type AuditLog struct {
	Base
	UserID    *uuid.UUID `gorm:"type:uuid;index" json:"user_id,omitempty"`
	Action    string     `gorm:"size:64;index;not null" json:"action"`
	Target    string     `gorm:"size:128" json:"target"`
	IP        string     `gorm:"size:64" json:"ip"`
	UserAgent string     `gorm:"size:255" json:"user_agent"`
	Detail    string     `gorm:"type:text" json:"detail"`
}

// AutoMigrate 注册所有模型并迁移。
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&OVHAccount{},
		&AuditLog{},
	)
}
