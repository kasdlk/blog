package controllers

import (
	"net/http"
	"strconv"

	"blog/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// NotificationController 定义通知的接口
type NotificationController interface {
	CreateNotification(ctx *gin.Context) // 创建通知
	GetNotification(ctx *gin.Context)    // 获取单个通知
	UpdateNotification(ctx *gin.Context) // 更新通知
	DeleteNotification(ctx *gin.Context) // 删除通知
	ListNotifications(ctx *gin.Context)  // 获取所有通知
}

type notificationController struct {
	db *gorm.DB
}

// NewNotificationController 创建新的通知控制器实例
func NewNotificationController(db *gorm.DB) NotificationController {
	return &notificationController{db: db}
}

// CreateNotification 创建通知
func (c *notificationController) CreateNotification(ctx *gin.Context) {
	var notification models.Notification
	if err := ctx.ShouldBindJSON(&notification); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := c.db.Create(&notification).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create notification"})
		return
	}
	ctx.JSON(http.StatusCreated, notification)
}

// GetNotification 获取单个通知
func (c *notificationController) GetNotification(ctx *gin.Context) {
	id := ctx.Param("id")
	var notification models.Notification
	if err := c.db.First(&notification, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}
	ctx.JSON(http.StatusOK, notification)
}

// UpdateNotification 更新通知
func (c *notificationController) UpdateNotification(ctx *gin.Context) {
	id := ctx.Param("id")
	var notification models.Notification
	if err := c.db.First(&notification, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	var updateData models.Notification
	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.db.Model(&notification).Updates(updateData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}
	ctx.JSON(http.StatusOK, notification)
}

// DeleteNotification 删除通知
func (c *notificationController) DeleteNotification(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.db.Delete(&models.Notification{}, id).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Notification deleted successfully"})
}

// ListNotifications 获取所有通知
func (c *notificationController) ListNotifications(ctx *gin.Context) {
	// 可选：支持分页查询
	pageStr := ctx.DefaultQuery("page", "1")
	limitStr := ctx.DefaultQuery("limit", "10")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	var notifications []models.Notification
	if err := c.db.Limit(limit).Offset(offset).Find(&notifications).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}
	ctx.JSON(http.StatusOK, notifications)
}
