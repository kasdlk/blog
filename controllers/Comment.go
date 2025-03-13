package controllers

import (
	"net/http"
	"strconv"

	"blog/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CommentController 定义留言的接口
type CommentController interface {
	CreateComment(ctx *gin.Context)      // 创建留言
	GetComment(ctx *gin.Context)         // 获取单条留言
	UpdateComment(ctx *gin.Context)      // 更新留言
	DeleteComment(ctx *gin.Context)      // 删除留言
	ListComments(ctx *gin.Context)       // 分页查询留言
	ListCommentsByBlog(ctx *gin.Context) // 根据博客ID查询留言
}

type commentController struct {
	db *gorm.DB
}

// NewCommentController 创建一个新的 CommentController 实例
func NewCommentController(db *gorm.DB) CommentController {
	return &commentController{db: db}
}

// CreateComment 创建留言
func (c *commentController) CreateComment(ctx *gin.Context) {
	var comment models.Comment
	if err := ctx.ShouldBindJSON(&comment); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// 创建留言记录
	if err := c.db.Create(&comment).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}
	ctx.JSON(http.StatusCreated, comment)
}

// GetComment 获取单条留言
func (c *commentController) GetComment(ctx *gin.Context) {
	id := ctx.Param("id")
	var comment models.Comment
	if err := c.db.First(&comment, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}
	ctx.JSON(http.StatusOK, comment)
}

// UpdateComment 更新留言
func (c *commentController) UpdateComment(ctx *gin.Context) {
	id := ctx.Param("id")
	var comment models.Comment
	if err := c.db.First(&comment, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	var updateData models.Comment
	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 只允许更新内容和父评论（如果需要其他字段更新，可自行扩展）
	comment.Content = updateData.Content
	comment.ParentID = updateData.ParentID

	if err := c.db.Save(&comment).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update comment"})
		return
	}
	ctx.JSON(http.StatusOK, comment)
}

// DeleteComment 删除留言
func (c *commentController) DeleteComment(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.db.Delete(&models.Comment{}, id).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete comment"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "Comment deleted successfully"})
}

// ListComments 分页查询留言（全表查询）
func (c *commentController) ListComments(ctx *gin.Context) {
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

	var comments []models.Comment
	if err := c.db.Limit(limit).Offset(offset).Find(&comments).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}
	ctx.JSON(http.StatusOK, comments)
}

// ListCommentsByBlog 根据博客ID查询留言，支持分页查询
func (c *commentController) ListCommentsByBlog(ctx *gin.Context) {
	blogIDStr := ctx.Param("blog_id")
	blogID, err := strconv.Atoi(blogIDStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog_id"})
		return
	}

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

	var comments []models.Comment
	if err := c.db.Where("blog_id = ?", blogID).
		Order("created_at asc").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments for the blog"})
		return
	}
	ctx.JSON(http.StatusOK, comments)
}
