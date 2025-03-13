package controllers

import (
	"blog/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"time"
)

type BlogController interface {
	CreateBlog(ctx *gin.Context)
	GetBlogByID(ctx *gin.Context)
	GetBlogsPaginated(ctx *gin.Context) // 分页查询
	GetBlogDirectory(ctx *gin.Context)  // 目录查询
	UpdateBlog(ctx *gin.Context)
	DeleteBlog(ctx *gin.Context)
	GetCurrentUserBlogs(ctx *gin.Context)
	GetMyBlogInfo(ctx *gin.Context)
}

type blogController struct {
	db *gorm.DB
}

func NewBlogController(db *gorm.DB) BlogController {
	return &blogController{db: db}
}

type BlogWithAuthor struct {
	ID        uint   `json:"id"`
	Title     string `json:"title"`
	Content   string `json:"content"`
	AuthorID  uint   `json:"author_id"`
	Category  string `json:"category"`
	Tags      string `json:"tags"`
	Status    string `json:"status"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
	Nickname  string `json:"nickname"`
}

// ✅ 创建博客（仅限登录用户）
func (c *blogController) CreateBlog(ctx *gin.Context) {
	var blog models.Blog
	if err := ctx.ShouldBindJSON(&blog); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ 从 Token 中获取 userId
	userIDRaw, exists := ctx.Get("userId")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID, _ := userIDRaw.(uint)

	blog.UserID = userID
	blog.AuthorID = userID

	if err := c.db.Create(&blog).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create blog"})
		return
	}

	ctx.JSON(http.StatusCreated, blog)
}

// ✅ 获取单个博客详情（所有用户都可查看）
func (c *blogController) GetBlogByID(ctx *gin.Context) {
	id := ctx.Param("id")

	var blog BlogWithAuthor
	if err := c.db.Table("blog").
		Select(`
			blog.id,
			blog.title,
			blog.content,
			blog.author_id,
			blog.category,
			blog.tags,
			blog.status,
			blog.created_at,
			blog.updated_at,
			users.nickname as nickname
		`).
		Joins("LEFT JOIN users ON users.id = blog.user_id").
		Where("blog.id = ?", id).
		First(&blog).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	ctx.JSON(http.StatusOK, blog)
}

// ✅ 获取博客列表（分页查询 + 权限判断）
func (c *blogController) GetBlogsPaginated(ctx *gin.Context) {
	pageStr := ctx.DefaultQuery("page", "1")
	date := ctx.Query("date")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit := 6
	offset := (page - 1) * limit

	// 根据日期筛选条件构造查询
	query := c.db.Model(&models.Blog{})
	if date != "" {
		startDate, _ := time.Parse("2006-01-02", date)
		endDate := startDate.AddDate(0, 0, 1).Add(-time.Nanosecond)
		query = query.Where("created_at BETWEEN ? AND ?", startDate, endDate)
	}

	// 统计总数
	var total int64
	if err := query.Count(&total).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count blogs"})
		return
	}

	// 查询数据并关联 users 表取 nickname
	var blogs []BlogWithAuthor
	dataQuery := c.db.Table("blog").
		Select(`
            blog.id,
            blog.title,
            blog.content,
            blog.author_id,
            blog.category,
            blog.tags,
            blog.status,
            blog.created_at,
            blog.updated_at,
            users.nickname as nickname
        `).
		Joins("LEFT JOIN users ON users.id = blog.user_id").
		Order("blog.created_at DESC").
		Limit(limit).
		Offset(offset)
	if date != "" {
		startDate, _ := time.Parse("2006-01-02", date)
		endDate := startDate.AddDate(0, 0, 1).Add(-time.Nanosecond)
		dataQuery = dataQuery.Where("blog.created_at BETWEEN ? AND ?", startDate, endDate)
	}
	if err := dataQuery.Scan(&blogs).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blogs"})
		return
	}
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	ctx.JSON(http.StatusOK, gin.H{
		"data":       blogs,
		"totalPages": totalPages,
	})
}

// ✅ 获取博客目录（根据身份筛选）
func (c *blogController) GetBlogDirectory(ctx *gin.Context) {
	// 从 token 中获取当前用户 ID
	userIDRaw, exists := ctx.Get("userId")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok || userID == 0 {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	// 查询当前用户的所有博客（不再区分管理员）
	var results []BlogWithAuthor
	if err := c.db.Table("blog").
		Select(`
            blog.id,
            blog.title,
            blog.author_id,
            blog.category,
            blog.tags,
            blog.status,
            blog.created_at,
            blog.updated_at,
            users.nickname as nickname
        `).
		Joins("LEFT JOIN users ON users.id = blog.user_id").
		Where("blog.author_id = ?", userID).
		Order("blog.created_at DESC").
		Scan(&results).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blog directory"})
		return
	}

	// 按年月分组
	directory := make(map[string][]BlogWithAuthor)
	for _, blog := range results {
		key := blog.CreatedAt[:7] // 格式例如 "2025-03"
		directory[key] = append(directory[key], blog)
	}

	ctx.JSON(http.StatusOK, directory)
}

// ✅ 更新博客（仅限作者或管理员）
func (c *blogController) UpdateBlog(ctx *gin.Context) {
	id := ctx.Param("id")

	var blog models.Blog
	if err := c.db.First(&blog, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	userIDRaw, _ := ctx.Get("userId")
	userID, _ := userIDRaw.(uint)

	if blog.AuthorID != userID {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	var updateData models.Blog
	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.db.Model(&blog).Updates(updateData)
	ctx.JSON(http.StatusOK, blog)
}

// ✅ 删除博客（仅限作者或管理员）
func (c *blogController) DeleteBlog(ctx *gin.Context) {
	id := ctx.Param("id")

	var blog models.Blog
	if err := c.db.First(&blog, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	userIDRaw, _ := ctx.Get("userId")
	userID, _ := userIDRaw.(uint)

	if blog.AuthorID != userID {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	c.db.Delete(&blog)
	ctx.JSON(http.StatusOK, gin.H{"message": "Blog deleted successfully"})
}

func (c *blogController) GetCurrentUserBlogs(ctx *gin.Context) {
	pageStr := ctx.DefaultQuery("page", "1")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit := 6
	offset := (page - 1) * limit

	userIDRaw, exists := ctx.Get("userId")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok || userID == 0 {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	// 统计符合条件的博客数量
	var total int64
	countQuery := c.db.Model(&models.Blog{}).Where("user_id = ?", userID)
	if err := countQuery.Count(&total).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count blogs"})
		return
	}

	// 查询博客数据并关联 users 表获取 nickname
	var blogs []BlogWithAuthor
	query := c.db.Table("blog").
		Select(`
            blog.id,
            blog.title,
            blog.content,
            blog.user_id AS author_id,
            blog.category,
            blog.tags,
            blog.status,
            blog.created_at,
            blog.updated_at,
            users.nickname as nickname
        `).
		Joins("LEFT JOIN users ON users.id = blog.user_id").
		Where("blog.user_id = ?", userID).
		Order("blog.created_at DESC").
		Limit(limit).
		Offset(offset)

	if err := query.Scan(&blogs).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user's blogs"})
		return
	}

	// 计算总页数
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	ctx.JSON(http.StatusOK, gin.H{
		"data":       blogs,
		"totalPages": totalPages,
	})
}
func (c *blogController) GetMyBlogInfo(ctx *gin.Context) {
	// 获取分页参数
	pageStr := ctx.DefaultQuery("page", "1")
	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit := 6
	offset := (page - 1) * limit

	// 从 token 中获取当前用户 ID
	userIDRaw, exists := ctx.Get("userId")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok || userID == 0 {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	// 查询当前用户的博客总数
	var total int64
	if err := c.db.Model(&models.Blog{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count blogs"})
		return
	}
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	// 查询当前用户的博客数据（分页）
	var blogs []BlogWithAuthor
	if err := c.db.Table("blog").
		Select(`
			blog.id,
			blog.title,
			blog.content,
			blog.user_id AS author_id,
			blog.category,
			blog.tags,
			blog.status,
			blog.created_at,
			blog.updated_at,
			users.nickname as nickname
		`).
		Joins("LEFT JOIN users ON users.id = blog.user_id").
		Where("blog.user_id = ?", userID).
		Order("blog.created_at DESC").
		Limit(limit).
		Offset(offset).
		Scan(&blogs).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blogs"})
		return
	}

	// 构造目录数据：按年月分组
	directory := make(map[string][]BlogWithAuthor)
	for _, blog := range blogs {
		// 可根据 blog.CreatedAt 截取年月，例如 "2025-03"
		key := blog.CreatedAt[:7]
		directory[key] = append(directory[key], blog)
	}

	// 获取用户资料
	var profile models.Users // 假设模型 User 存储用户资料
	if err := c.db.Table("users").Where("id = ?", userID).First(&profile).Error; err != nil {
		profile = models.Users{}
	}

	ctx.JSON(http.StatusOK, gin.H{
		"blogs":      blogs,
		"totalPages": totalPages,
		"directory":  directory,
		"profile":    profile,
	})
}
