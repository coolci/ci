// Package auth 提供密码哈希、JWT 签发与校验。
package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword 使用 bcrypt cost=12 哈希密码。
func HashPassword(pw string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(pw), 12)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// VerifyPassword 验证密码是否匹配。
func VerifyPassword(hash, pw string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(pw)) == nil
}

// Claims 自定义 JWT 载荷。
type Claims struct {
	UserID uuid.UUID `json:"uid"`
	Role   string    `json:"role"`
	Type   string    `json:"typ"` // access | refresh
	jwt.RegisteredClaims
}

// Issue 签发 JWT。
func Issue(secret []byte, uid uuid.UUID, role, typ string, ttl time.Duration) (string, error) {
	c := Claims{
		UserID: uid,
		Role:   role,
		Type:   typ,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			Issuer:    "ovh-buy",
			Subject:   uid.String(),
		},
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, c)
	return tok.SignedString(secret)
}

// Parse 校验并解析 JWT。
func Parse(secret []byte, tokenStr string) (*Claims, error) {
	tok, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("不支持的签名方法")
		}
		return secret, nil
	})
	if err != nil {
		return nil, err
	}
	c, ok := tok.Claims.(*Claims)
	if !ok || !tok.Valid {
		return nil, errors.New("token 无效")
	}
	return c, nil
}
