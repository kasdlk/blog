package controllers

import (
	"net/http"

	"blog/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RechargeTransactionController 定义充值流水表的接口
type RechargeTransactionController interface {
	CreateRechargeTransaction(ctx *gin.Context)
	GetRechargeTransaction(ctx *gin.Context)
	UpdateRechargeTransaction(ctx *gin.Context)
	DeleteRechargeTransaction(ctx *gin.Context)
	ListRechargeTransactions(ctx *gin.Context)
}

type rechargeTransactionController struct {
	db *gorm.DB
}

// NewRechargeTransactionController 创建一个新的 RechargeTransactionController
func NewRechargeTransactionController(db *gorm.DB) RechargeTransactionController {
	return &rechargeTransactionController{db: db}
}

// CreateRechargeTransaction 创建充值流水记录
func (c *rechargeTransactionController) CreateRechargeTransaction(ctx *gin.Context) {
	var rt models.RechargeTransaction
	if err := ctx.ShouldBindJSON(&rt); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := c.db.Create(&rt).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create recharge transaction"})
		return
	}
	ctx.JSON(http.StatusCreated, rt)
}

// GetRechargeTransaction 获取单条充值流水记录
func (c *rechargeTransactionController) GetRechargeTransaction(ctx *gin.Context) {
	id := ctx.Param("id")
	var rt models.RechargeTransaction
	if err := c.db.First(&rt, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Recharge transaction not found"})
		return
	}
	ctx.JSON(http.StatusOK, rt)
}

// UpdateRechargeTransaction 更新充值流水记录
func (c *rechargeTransactionController) UpdateRechargeTransaction(ctx *gin.Context) {
	id := ctx.Param("id")
	var rt models.RechargeTransaction
	if err := c.db.First(&rt, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Recharge transaction not found"})
		return
	}

	var updateData models.RechargeTransaction
	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := c.db.Model(&rt).Updates(updateData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update recharge transaction"})
		return
	}
	ctx.JSON(http.StatusOK, rt)
}

// DeleteRechargeTransaction 删除充值流水记录
func (c *rechargeTransactionController) DeleteRechargeTransaction(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.db.Delete(&models.RechargeTransaction{}, id).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete recharge transaction"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Recharge transaction deleted successfully"})
}

// ListRechargeTransactions 获取所有充值流水记录
func (c *rechargeTransactionController) ListRechargeTransactions(ctx *gin.Context) {
	var transactions []models.RechargeTransaction
	if err := c.db.Find(&transactions).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch recharge transactions"})
		return
	}
	ctx.JSON(http.StatusOK, transactions)
}
