package controllers

import (
	"blog/config"
	"blog/models"
	"log"
	"testing"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestInsertEmployeeRevenues(t *testing.T) {
	// 使用 SQLite 数据库（测试环境）
	var err error
	config.DB, err = gorm.Open(sqlite.Open("blog.db"), &gorm.Config{})
	if err != nil {
		t.Fatalf("Failed to open database: %v", err)
	}

	if config.DB == nil {
		t.Fatal("Database not initialized")
	}

	// 自动迁移 EmployeeRevenue 表（确保表结构与模型一致）
	if err := config.DB.AutoMigrate(&models.EmployeeRevenue{}); err != nil {
		t.Fatalf("Failed to migrate database: %v", err)
	}

	// 定义 5 个虚拟的员工收益记录
	employeeRevenues := []models.EmployeeRevenue{
		{
			UserID:            1,
			AdPlatform:        "Facebook",
			ProductCategories: "Electronics",
			AdType:            "CPC",
			Region:            "North America",
			Expenditure:       1200.0,
			OrderCount:        40,
			ProductCost:       5000.0,
			ShippingFee:       300.0,
			AdDeliveryCount:   10000,
			Date:              time.Date(2025, 3, 1, 0, 0, 0, 0, time.UTC),
			Remark1:           "第一条测试记录",
			StartTime:         time.Date(2025, 3, 1, 9, 0, 0, 0, time.UTC),
			EndTime:           time.Date(2025, 3, 31, 18, 0, 0, 0, time.UTC),
			Remark2:           "测试成功",
		},
		{
			UserID:            2,
			AdPlatform:        "Google",
			ProductCategories: "Books",
			AdType:            "CPM",
			Region:            "Europe",
			Expenditure:       800.0,
			OrderCount:        30,
			ProductCost:       3000.0,
			ShippingFee:       150.0,
			AdDeliveryCount:   8000,
			Date:              time.Date(2025, 3, 2, 0, 0, 0, 0, time.UTC),
			Remark1:           "第二条测试记录",
			StartTime:         time.Date(2025, 3, 2, 10, 0, 0, 0, time.UTC),
			EndTime:           time.Date(2025, 3, 30, 17, 0, 0, 0, time.UTC),
			Remark2:           "反应良好",
		},
		{
			UserID:            3,
			AdPlatform:        "Instagram",
			ProductCategories: "Fashion",
			AdType:            "CPC",
			Region:            "Asia",
			Expenditure:       1500.0,
			OrderCount:        35,
			ProductCost:       4000.0,
			ShippingFee:       180.0,
			AdDeliveryCount:   9000,
			Date:              time.Date(2025, 3, 3, 0, 0, 0, 0, time.UTC),
			Remark1:           "第三条测试记录",
			StartTime:         time.Date(2025, 3, 3, 8, 30, 0, 0, time.UTC),
			EndTime:           time.Date(2025, 3, 29, 18, 0, 0, 0, time.UTC),
			Remark2:           "测试中",
		},
		{
			UserID:            4,
			AdPlatform:        "LinkedIn",
			ProductCategories: "Services",
			AdType:            "CPM",
			Region:            "Australia",
			Expenditure:       1000.0,
			OrderCount:        25,
			ProductCost:       3500.0,
			ShippingFee:       100.0,
			AdDeliveryCount:   7000,
			Date:              time.Date(2025, 3, 4, 0, 0, 0, 0, time.UTC),
			Remark1:           "第四条测试记录",
			StartTime:         time.Date(2025, 3, 4, 9, 30, 0, 0, time.UTC),
			EndTime:           time.Date(2025, 3, 28, 17, 30, 0, 0, time.UTC),
			Remark2:           "反馈不错",
		},
		{
			UserID:            5,
			AdPlatform:        "Twitter",
			ProductCategories: "Entertainment",
			AdType:            "CPC",
			Region:            "South America",
			Expenditure:       900.0,
			OrderCount:        20,
			ProductCost:       2800.0,
			ShippingFee:       120.0,
			AdDeliveryCount:   6000,
			Date:              time.Date(2025, 3, 5, 0, 0, 0, 0, time.UTC),
			Remark1:           "第五条测试记录",
			StartTime:         time.Date(2025, 3, 5, 10, 0, 0, 0, time.UTC),
			EndTime:           time.Date(2025, 3, 27, 16, 0, 0, 0, time.UTC),
			Remark2:           "效果一般",
		},
	}

	// 循环插入虚拟数据
	for _, record := range employeeRevenues {
		if err := config.DB.Create(&record).Error; err != nil {
			t.Errorf("Failed to insert employee revenue record: %v", err)
		} else {
			log.Printf("Inserted employee revenue for UserID: %d, Date: %s", record.UserID, record.Date.Format("2006-01-02"))
		}
	}
}
