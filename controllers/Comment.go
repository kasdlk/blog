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

	// 从 token 中获取 userId（需要认证中间件提前设置）
	userIDRaw, exists := ctx.Get("userId")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user id in token"})
		return
	}
	// 使用 token 中的 user id，而不是请求体传入的
	comment.UserID = userID

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

	// 先查找评论
	var comment models.Comment
	if err := c.db.First(&comment, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Comment not found"})
		return
	}

	// 从 token 中获取当前用户ID（需要认证中间件设置）
	userIDRaw, exists := ctx.Get("userId")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user id in token"})
		return
	}

	// 如果当前用户不是评论的创建者，则检查是否为该博客的作者
	if comment.UserID != userID {
		var blog models.Blog
		if err := c.db.First(&blog, comment.BlogID).Error; err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Blog not found"})
			return
		}
		if blog.AuthorID != userID {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
			return
		}
	}

	// 允许删除
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

// 定义一个新的结构体，用于返回评论和昵称
type CommentWithUser struct {
	models.Comment
	Nickname string `json:"nickname"`
}

// ListCommentsByBlog 根据博客ID查询留言，支持分页查询，返回评论及对应的用户昵称
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

	var comments []CommentWithUser
	if err := c.db.Table("comments").
		Select("comments.*, users.nickname").
		Joins("LEFT JOIN users ON users.id = comments.user_id").
		Where("comments.blog_id = ?", blogID).
		Order("comments.created_at asc").
		Limit(limit).
		Offset(offset).
		Find(&comments).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments for the blog"})
		return
	}
	ctx.JSON(http.StatusOK, comments)
}
