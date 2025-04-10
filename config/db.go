package config

import (
	"blog/models"
	"blog/utils"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
)

var DB *gorm.DB

func Initialize() {
	// 加载配置文件，发生错误时终止程序
	utils.LoadConfig("config/config.yaml")

	var err error
	dbType := utils.AppConfig.Database.Type
	switch dbType {
	case "sqlite":
		DB, err = gorm.Open(sqlite.Open(utils.AppConfig.Database.Path), &gorm.Config{})
		if err != nil {
			log.Fatalf("Failed to connect to SQLite database: %v", err)
		}
	default:
		log.Fatalf("Unsupported database type: %s", dbType)
	}

	// 自动迁移数据库模型（开发阶段推荐全部创建）
	if err := DB.AutoMigrate(
		&models.Users{},
		&models.Blog{},
		&models.EmployeeRevenue{},
		&models.RechargeTransaction{},
		&models.Comment{},
		&models.Notification{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	adminInit(DB)
}

func adminInit(db *gorm.DB) {
	jwtTools := utils.NewJWTTools()

	defaultUsers := []struct {
		Name string
		Abbr string
		Role int
	}{
		{"admin", "admin", utils.RoleSuperAdmin},
		{"he", "he", utils.RoleFinance},
		{"涂雅莉", "tyl", utils.RoleFinance},
		{"黄开新", "hkx", utils.RoleMarketer},
		{"陈乐昕", "clx", utils.RoleMarketer},
		{"李骏", "lj", utils.RoleMarketer},
		{"付孝勇", "fxy", utils.RoleMarketer},
		{"赵靖", "zj", utils.RoleMarketer},
		{"莫聪波", "mcb", utils.RoleMarketer},
		{"许念", "xn", utils.RoleFinance},
		{"王喆", "wz", utils.RoleMarketer},
	}

	for _, u := range defaultUsers {
		hashedPwd, err := jwtTools.HashPassword(u.Abbr)
		if err != nil {
			log.Fatalf("Failed to hash password for user %s: %v", u.Name, err)
		}
		user := models.Users{
			Username: u.Abbr,
			Password: hashedPwd,
			Nickname: u.Name,
			Email:    u.Abbr + "@example.com",
			Role:     u.Role, // 使用结构体中的 Role 字段
			Avatar:   "default_avatar.png",
			Bio:      "",
			Website:  "",
		}
		if err := db.Debug().FirstOrCreate(&user, models.Users{Username: u.Abbr}).Error; err != nil {
			//log.Fatalf("Failed to create user %s: %v", u.Name, err)
		}
	}
}
