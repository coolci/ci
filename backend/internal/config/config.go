package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config 集中管理后端运行时配置，所有敏感配置必须通过环境变量注入。
type Config struct {
	AppEnv          string
	HTTPPort        string
	DatabaseURL     string
	RedisURL        string
	JWTSecret       []byte
	JWTAccessTTL    time.Duration
	JWTRefreshTTL   time.Duration
	EncryptionKey   []byte // AES-256，用于加密 OVH 凭证
	CORSAllowed     []string
	RateLimitPerMin int
	LogLevel        string
}

// Load 从环境变量构造配置；启动时若缺少必填项会立即 panic，保证安全默认。
func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		AppEnv:          getenv("APP_ENV", "production"),
		HTTPPort:        getenv("HTTP_PORT", "8080"),
		DatabaseURL:     mustEnv("DATABASE_URL"),
		RedisURL:        mustEnv("REDIS_URL"),
		JWTSecret:       []byte(mustEnv("JWT_SECRET")),
		JWTAccessTTL:    parseDur("JWT_ACCESS_TTL", 15*time.Minute),
		JWTRefreshTTL:   parseDur("JWT_REFRESH_TTL", 7*24*time.Hour),
		EncryptionKey:   parseEncryptionKey(mustEnv("APP_ENCRYPTION_KEY")),
		CORSAllowed:     splitCSV(getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
		RateLimitPerMin: parseInt("RATE_LIMIT_PER_MIN", 100),
		LogLevel:        getenv("LOG_LEVEL", "info"),
	}

	if len(cfg.JWTSecret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET 长度至少 32 位")
	}
	return cfg, nil
}

func getenv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func mustEnv(k string) string {
	v := os.Getenv(k)
	if v == "" {
		panic(fmt.Sprintf("环境变量 %s 必须设置", k))
	}
	return v
}

func parseDur(k string, def time.Duration) time.Duration {
	if v := os.Getenv(k); v != "" {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return def
}

func parseInt(k string, def int) int {
	if v := os.Getenv(k); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}

func parseEncryptionKey(s string) []byte {
	// 必须为 32 字节（AES-256）
	if len(s) != 32 {
		panic("APP_ENCRYPTION_KEY 必须为 32 字节字符串 (AES-256)")
	}
	return []byte(s)
}

func splitCSV(s string) []string {
	out := []string{}
	cur := ""
	for _, c := range s {
		if c == ',' {
			if cur != "" {
				out = append(out, cur)
			}
			cur = ""
			continue
		}
		cur += string(c)
	}
	if cur != "" {
		out = append(out, cur)
	}
	return out
}
