package controllers

import (
	"blog/config"
	"blog/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
	"testing"
)

// Blog 博客表

// TestInsertBlogs 测试插入博客数据
func TestInsertBlogs(t *testing.T) {
	config.DB, _ = gorm.Open(sqlite.Open("blog.db"), &gorm.Config{})

	if config.DB == nil {
		t.Fatal("Database not initialized")
	}

	// 迁移数据表
	if err := config.DB.AutoMigrate(&models.User{}, &models.Blog{}); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	blogs := []models.Blog{
		{Title: "Go 语言基础", Content: "这是一篇介绍 Go 语言基础的文章", AuthorID: 1, Category: "编程", Tags: "Go, 编程", Status: "published"},
		{Title: "Gin 框架入门", Content: "Gin 是一个轻量级的 Go Web 框架", AuthorID: 2, Category: "Web 开发", Tags: "Gin, Web", Status: "published"},
		{Title: "GORM 使用教程", Content: "GORM 是 Go 语言的 ORM 框架", AuthorID: 1, Category: "数据库", Tags: "GORM, 数据库", Status: "draft"},
	}

	for _, blog := range blogs {
		if err := config.DB.Create(&blog).Error; err != nil {
			log.Printf("Failed to insert blog: %v", err)
		} else {
			log.Printf("Inserted blog: %s", blog.Title)
		}
	}
}
