// 命令入口：OVH 抢购系统后端服务。
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"

	"github.com/coolci/ovh-buy/backend/internal/api"
	"github.com/coolci/ovh-buy/backend/internal/config"
	"github.com/coolci/ovh-buy/backend/internal/model"
	"github.com/coolci/ovh-buy/backend/internal/store"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("加载配置失败: %v", err)
	}

	logger, _ := zap.NewProduction()
	defer logger.Sync()
	logger.Info("启动 OVH 抢购后端", zap.String("env", cfg.AppEnv), zap.String("port", cfg.HTTPPort))

	db, err := store.NewPostgres(cfg.DatabaseURL)
	if err != nil {
		logger.Fatal("PostgreSQL 连接失败", zap.Error(err))
	}
	if err := model.AutoMigrate(db); err != nil {
		logger.Fatal("数据库迁移失败", zap.Error(err))
	}

	rdb, err := store.NewRedis(cfg.RedisURL)
	if err != nil {
		logger.Fatal("Redis 连接失败", zap.Error(err))
	}

	r := api.NewRouter(cfg, db, rdb, logger)

	srv := &http.Server{
		Addr:              ":" + cfg.HTTPPort,
		Handler:           r,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("HTTP 服务异常退出", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.Info("收到关闭信号，开始优雅退出")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
	_ = rdb.Close()
}
