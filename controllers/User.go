package controllers

import (
	"blog/models"
	"blog/utils"
	"gorm.io/gorm"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UserController interface {
	RegisterUser(ctx *gin.Context)
	LoginUser(ctx *gin.Context)
	GetUserProfile(ctx *gin.Context)
	UpdateUserProfile(ctx *gin.Context)
	GetAllUsers(ctx *gin.Context)
	DeleteUser(ctx *gin.Context)
	CreateUserByAdmin(ctx *gin.Context)
	UpdateUserByAdmin(ctx *gin.Context)
	GetAdminAllUsers(ctx *gin.Context)
}

type userController struct {
	db       *gorm.DB
	jwtTools utils.JWTTools
}

func NewUserController(db *gorm.DB) UserController {
	if db == nil {
		log.Fatalf("Database connection is nil")
	}
	return &userController{
		db:       db,
		jwtTools: utils.NewJWTTools(),
	}
}

// ✅ 用户注册
func (c *userController) RegisterUser(ctx *gin.Context) {
	var userInput models.Users
	if err := ctx.ShouldBindJSON(&userInput); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	// 密码加密
	hashedPassword, err := c.jwtTools.HashPassword(userInput.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "密码加密失败"})
		return
	}

	// 检查用户名是否存在
	var existingUser models.Users
	if err := c.db.Where("username = ?", userInput.Username).First(&existingUser).Error; err == nil {
		ctx.JSON(http.StatusConflict, gin.H{"status": "error", "message": "用户名已被注册"})
		return
	}

	userInput.Password = hashedPassword
	userInput.Role = utils.RoleUser // 默认角色为普通用户
	if err := c.db.Create(&userInput).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "创建用户失败"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"status": "success", "message": "用户注册成功"})
}

// ✅ 用户登录
func (c *userController) LoginUser(ctx *gin.Context) {
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := ctx.ShouldBindJSON(&loginData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "输入格式错误"})
		return
	}

	var user models.Users
	if err := c.db.Where("username = ?", loginData.Username).First(&user).Error; err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "用户名或密码不正确"})
		return
	}

	if !c.jwtTools.CheckPasswordHash(loginData.Password, user.Password) {
		ctx.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "用户名或密码不正确"})
		return
	}

	token, err := c.jwtTools.GenerateToken(&user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "生成 token 失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "登录成功",
		"user": gin.H{
			"nickname": user.Nickname,
			"email":    user.Email,
			"token":    token,
			"role":     user.Role,
		},
	})
}

// ✅ 获取当前用户资料（直接通过 token 解析）
func (c *userController) GetUserProfile(ctx *gin.Context) {
	userID, _ := ctx.Get("userId") // 通过 token 解析出的 userId

	var user models.Users
	if err := c.db.Where("id = ?", userID).First(&user).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"status": "error", "message": "用户不存在"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"nickname": user.Nickname,
		"email":    user.Email,
		"avatar":   user.Avatar,
		"bio":      user.Bio,
		"website":  user.Website,
	})
}

// UpdateUserProfile ✅ 更新用户资料（包括头像）
func (c *userController) UpdateUserProfile(ctx *gin.Context) {
	userID, _ := ctx.Get("userId")

	// 定义一个用于绑定更新字段的结构体，只包含需要更新的字段
	var updateData struct {
		Username string `json:"username,omitempty"`
		Email    string `json:"email,omitempty"`
		Avatar   string `json:"avatar,omitempty"`
		Bio      string `json:"bio,omitempty"`
		Website  string `json:"website,omitempty"`
	}

	// 绑定 JSON 数据
	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "输入格式错误"})
		return
	}

	// 可选：检查用户名是否重复、邮箱格式是否合法等校验逻辑

	// 更新用户数据（仅更新提供的字段）
	if err := c.db.Model(&models.Users{}).Where("id = ?", userID).Updates(updateData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "更新用户资料失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":    "success",
		"message":   "更新成功",
		"avatarUrl": updateData.Avatar, // 返回更新后的头像 URL
	})
}

// ✅ 获取所有用户
func (c *userController) GetAllUsers(ctx *gin.Context) {
	var users []models.Users

	// ✅ 直接筛选角色（role = 3）
	err := c.db.Select("id, username, nickname, email, role, avatar, bio, website, last_login_at, status, created_at, updated_at").
		Where("role = ?", utils.RoleMarketer).
		Order("created_at DESC").
		Find(&users).Error

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "获取用户列表失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "data": users})
}

// ✅ 获取所有用户
func (c *userController) GetAdminAllUsers(ctx *gin.Context) {
	var users []models.Users

	// ✅ 直接筛选角色（role = 3）
	err := c.db.Select("id, username, nickname, email, role, avatar, bio, website, last_login_at, status, created_at, updated_at").
		Where("role >= ?", 1).
		Order("created_at DESC").
		Find(&users).Error

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "获取用户列表失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "data": users})
}

func (c *userController) DeleteUser(ctx *gin.Context) {
	idStr := ctx.Param("id")

	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "非法用户ID"})
		return
	}

	if err := c.db.Where("id = ?", id).Delete(&models.Users{}).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "删除用户失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "message": "删除成功"})
}

// ✅ 管理员新增用户
func (c *userController) CreateUserByAdmin(ctx *gin.Context) {
	var userInput models.Users
	if err := ctx.ShouldBindJSON(&userInput); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "无效的输入格式"})
		return
	}

	// 检查用户名是否已存在
	var existingUser models.Users
	if err := c.db.Where("username = ?", userInput.Username).First(&existingUser).Error; err == nil {
		ctx.JSON(http.StatusConflict, gin.H{"status": "error", "message": "用户名已存在"})
		return
	}

	// 对角色权限进行限制
	if userInput.Role <= utils.RoleAdmin {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "非法角色"})
		return
	}

	// 加密密码
	hashedPassword, err := c.jwtTools.HashPassword(userInput.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "密码加密失败"})
		return
	}

	userInput.Password = hashedPassword

	if err := c.db.Create(&userInput).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "创建用户失败"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"status": "success", "message": "创建用户成功"})
}

// ✅ 管理员更新用户资料
func (c *userController) UpdateUserByAdmin(ctx *gin.Context) {
	// 获取当前登录管理员 ID 和权限
	currentUserIDRaw, _ := ctx.Get("userId")
	currentUserRoleRaw, _ := ctx.Get("role")
	currentUserID := int(currentUserIDRaw.(uint))
	currentUserRole := currentUserRoleRaw.(int)

	if currentUserRole > utils.RoleAdmin {
		ctx.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "权限不足"})
		return
	}

	// 获取目标用户 ID
	idStr := ctx.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "非法用户ID"})
		return
	}

	// 禁止管理员修改自己的权限（防止越权）
	if id == currentUserID {
		ctx.JSON(http.StatusForbidden, gin.H{"status": "error", "message": "无法修改自己的权限"})
		return
	}

	var updateData models.Users
	if err := ctx.ShouldBindJSON(&updateData); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "输入格式错误"})
		return
	}

	//// 角色权限校验（管理员不可修改超管权限）
	//if updateData.Role < utils.RoleUser || updateData.Role > utils.RoleAdmin {
	//	ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "非法角色"})
	//	return
	//}

	//if updateData.Email != "" && !utils.IsValidEmail(updateData.Email) {
	//	ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "邮箱格式不正确"})
	//	return
	//}

	// 更新目标用户（防止越权修改）
	if err := c.db.Model(&models.Users{}).Where("id = ?", id).Updates(updateData).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "更新用户失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": "success", "message": "用户更新成功"})
}
