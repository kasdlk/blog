package controllers

import (
	"blog/models"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// EmployeeRevenueController 定义员工收益统计表的接口
type EmployeeRevenueController interface {
	CreateEmployeeRevenue(ctx *gin.Context)
	GetEmployeeRevenue(ctx *gin.Context)
	UpdateEmployeeRevenue(ctx *gin.Context)
	DeleteEmployeeRevenue(ctx *gin.Context)
	ListEmployeeRevenue(ctx *gin.Context)
	GetUserEmployeeRevenueList(ctx *gin.Context)
}

type employeeRevenueController struct {
	db *gorm.DB
}

// NewEmployeeRevenueController ✅ NewEmployeeRevenueController 创建一个新的 EmployeeRevenueController
func NewEmployeeRevenueController(db *gorm.DB) EmployeeRevenueController {
	return &employeeRevenueController{db: db}
}

// EmployeeRevenueInput 用于接收前端传入的 JSON 数据
type EmployeeRevenueInput struct {
	AdPlatform        string  `json:"ad_platform"`
	ProductCategories string  `json:"product_categories"`
	AdType            string  `json:"ad_type"`
	Region            string  `json:"region"`
	Expenditure       float64 `json:"expenditure"`
	OrderCount        int     `json:"order_count"`
	AdCreationCount   int     `json:"ad_creation_count"`
	Revenue           float64 `json:"revenue"`
	RecordTimeStr     string  `json:"record_time"`
	Remark            string  `json:"remark"`
}

// CreateEmployeeRevenue ✅ CreateEmployeeRevenue 创建员工收益统计记录
func (c *employeeRevenueController) CreateEmployeeRevenue(ctx *gin.Context) {
	var input EmployeeRevenueInput
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 构造 EmployeeRevenue 实体
	revenue := models.EmployeeRevenue{
		AdPlatform:        input.AdPlatform,
		ProductCategories: input.ProductCategories,
		AdType:            input.AdType,
		Region:            input.Region,
		Expenditure:       input.Expenditure,
		OrderCount:        input.OrderCount,
		AdCreationCount:   input.AdCreationCount,
		Revenue:           input.Revenue,
		Remark:            input.Remark,
	}

	// 处理时间格式
	if input.RecordTimeStr != "" {
		parsedTime, err := parseFlexibleTime(input.RecordTimeStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid record_time format"})
			return
		}
		revenue.RecordTime = parsedTime
	} else {
		revenue.RecordTime = time.Now()
	}

	// 获取当前用户 ID
	userIDRaw, exists := ctx.Get("userId")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}
	revenue.UserID = userID

	// 计算 ROI（销售额 / 广告费）
	if revenue.Expenditure != 0 {
		revenue.ROI = revenue.Revenue / revenue.Expenditure
	} else {
		revenue.ROI = 0
	}

	// 插入记录到数据库
	if err := c.db.Create(&revenue).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create record"})
		return
	}

	ctx.JSON(http.StatusCreated, revenue)
}

// ✅ GetEmployeeRevenue 获取单条收益记录
func (c *employeeRevenueController) GetEmployeeRevenue(ctx *gin.Context) {
	id := ctx.Param("id")

	userIDRaw, _ := ctx.Get("userId")
	userID, _ := userIDRaw.(uint)

	var revenue models.EmployeeRevenue
	if err := c.db.Where("id = ? AND user_id = ?", id, userID).First(&revenue).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Record not found or unauthorized"})
		return
	}

	ctx.JSON(http.StatusOK, revenue)
}

// ✅ UpdateEmployeeRevenue 更新记录（限制当前用户）
func (c *employeeRevenueController) UpdateEmployeeRevenue(ctx *gin.Context) {
	id := ctx.Param("id")

	// 获取现有记录
	var revenue models.EmployeeRevenue
	if err := c.db.First(&revenue, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}

	// 获取当前用户 ID
	userIDRaw, _ := ctx.Get("userId")
	userID, _ := userIDRaw.(uint)
	if revenue.UserID != userID {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Permission denied"})
		return
	}

	// 绑定前端数据到更新结构体
	var input EmployeeRevenueInput
	if err := ctx.ShouldBindJSON(&input); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 将前端输入的数据复制到现有记录上
	revenue.AdPlatform = input.AdPlatform
	revenue.ProductCategories = input.ProductCategories
	revenue.AdType = input.AdType
	revenue.Region = input.Region
	revenue.Expenditure = input.Expenditure
	revenue.OrderCount = input.OrderCount
	revenue.AdCreationCount = input.AdCreationCount
	revenue.Revenue = input.Revenue
	revenue.Remark = input.Remark

	// 处理时间字段：先解析前端传入的 RecordTimeStr（字段名为 "record_time"）
	if input.RecordTimeStr != "" {
		parsedTime, err := parseFlexibleTime(input.RecordTimeStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid record_time format"})
			return
		}
		revenue.RecordTime = parsedTime
	}

	// 重新计算 ROI（销售额 / 广告费）
	if revenue.Expenditure != 0 {
		revenue.ROI = revenue.Revenue / revenue.Expenditure
	} else {
		revenue.ROI = 0
	}

	// 更新数据库记录
	if err := c.db.Save(&revenue).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update record"})
		return
	}

	ctx.JSON(http.StatusOK, revenue)
}

// ✅ DeleteEmployeeRevenue 删除记录（限制当前用户）
func (c *employeeRevenueController) DeleteEmployeeRevenue(ctx *gin.Context) {
	id := ctx.Param("id")

	userIDRaw, _ := ctx.Get("userId")
	userID, _ := userIDRaw.(uint)

	var revenue models.EmployeeRevenue
	if err := c.db.Where("id = ? AND user_id = ?", id, userID).First(&revenue).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Record not found or unauthorized"})
		return
	}

	if err := c.db.Delete(&revenue).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete record"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Record deleted successfully"})
}
func (c *employeeRevenueController) ListEmployeeRevenue(ctx *gin.Context) {
	pageStr := ctx.DefaultQuery("page", "1")
	limitStr := ctx.DefaultQuery("limit", "10")
	startDateStr := ctx.Query("startDate")
	endDateStr := ctx.Query("endDate")
	userIDStr := ctx.Query("userId")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	offset := (page - 1) * limit

	query := c.db.Model(&models.EmployeeRevenue{}).
		Preload("User").
		Debug() // ✅ 输出SQL到终端

	// ✅ 按用户筛选
	if userIDStr != "" {
		employeeID, _ := strconv.Atoi(userIDStr)
		query = query.Where("user_id = ?", employeeID)
	}

	// ✅ 按时间筛选
	if startDateStr != "" && endDateStr != "" {
		startDate, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid startDate format"})
			return
		}
		endDate, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid endDate format"})
			return
		}
		// 将结束日期调整到当天最后一刻：加一天，再减去一纳秒
		endDate = endDate.AddDate(0, 0, 1).Add(-time.Nanosecond)
		query = query.Where("record_time BETWEEN ? AND ?", startDate, endDate)
	}

	// ✅ 输出完整的 SQL 语句
	sql := query.ToSQL(func(tx *gorm.DB) *gorm.DB {
		return tx.Order("record_time DESC").Limit(limit).Offset(offset)
	})
	fmt.Println("Generated SQL:", sql)

	// ✅ 获取数据
	var revenues []models.EmployeeRevenue
	if err := query.Order("record_time DESC").Limit(limit).Offset(offset).Find(&revenues).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// ✅ 统计总数
	var totalCount int64
	query.Count(&totalCount)

	// ✅ 返回数据中带上 nickname
	response := make([]map[string]interface{}, 0)
	for _, revenue := range revenues {
		item := map[string]interface{}{
			"id":                revenue.ID,
			"user_id":           revenue.UserID,
			"nickname":          revenue.User.Nickname,
			"avatar":            revenue.User.Avatar,
			"ad_platform":       revenue.AdPlatform,
			"product_category":  revenue.ProductCategories,
			"ad_type":           revenue.AdType,
			"region":            revenue.Region,
			"expenditure":       revenue.Expenditure,
			"order_count":       revenue.OrderCount,
			"ad_creation_count": revenue.AdCreationCount,
			"revenue":           revenue.Revenue,
			"roi":               revenue.ROI,
			"record_time":       revenue.RecordTime,
			"remark":            revenue.Remark,
		}
		response = append(response, item)
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data":       response,
		"total":      totalCount,
		"page":       page,
		"limit":      limit,
		"totalPages": (totalCount + int64(limit) - 1) / int64(limit),
	})
}

// ✅ GetUserEmployeeRevenueList 获取当前用户自己的收益记录（支持日期筛选 + 分页）
func (c *employeeRevenueController) GetUserEmployeeRevenueList(ctx *gin.Context) {
	pageStr := ctx.DefaultQuery("page", "1")
	limitStr := ctx.DefaultQuery("limit", "10")
	startDateStr := ctx.Query("startDate")
	endDateStr := ctx.Query("endDate")

	// ✅ 获取当前用户 ID
	userIDRaw, exists := ctx.Get("userId")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, ok := userIDRaw.(uint)
	if !ok {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
		return
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	query := c.db.Model(&models.EmployeeRevenue{}).
		Where("user_id = ?", userID)

	// ✅ 按时间筛选
	if startDateStr != "" && endDateStr != "" {
		startDate, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid startDate format"})
			return
		}
		endDate, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid endDate format"})
			return
		}
		query = query.Where("record_time BETWEEN ? AND ?", startDate, endDate)
	}

	// ✅ 获取数据
	var revenues []models.EmployeeRevenue
	if err := query.Order("record_time DESC").Limit(limit).Offset(offset).Find(&revenues).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// ✅ 统计总数
	var totalCount int64
	query.Count(&totalCount)

	ctx.JSON(http.StatusOK, gin.H{
		"data":       revenues,
		"total":      totalCount,
		"page":       page,
		"limit":      limit,
		"totalPages": (totalCount + int64(limit) - 1) / int64(limit),
	})
}
func parseFlexibleTime(input string) (time.Time, error) {
	var parsedTime time.Time
	var err error

	// 定义支持的时间格式
	formats := []string{
		time.RFC3339,               // "2006-01-02T15:04:05Z07:00"
		"2006-01-02T15:04:05Z",     // "2025-03-10T16:00:00Z"
		"2006-01-02T15:04:05.000Z", // "2025-03-10T16:00:00.000Z"
		"2006-01-02T15:04",         // "2025-03-10T16:08"
		"2006-01-02 15:04:05",      // "2025-03-10 16:08:00"
		"2006-01-02 15:04",         // "2025-03-10 16:08"
		"2006-01-02",               // "2025-03-10"
	}

	// ✅ 兼容 T 和空格的替换
	if strings.Contains(input, "T") {
		input = strings.Replace(input, "T", " ", 1)
	}

	// ✅ 去除 `Z` 标识符（表示 UTC）
	input = strings.TrimSuffix(input, "Z")

	// ✅ 自动补全时间格式（如果是日期就加时间）
	if len(input) == 10 { // 格式为 `2025-03-10`
		input += " 00:00:00"
	} else if len(input) == 16 { // 格式为 `2025-03-10 16:08`
		input += ":00"
	}

	// 尝试按不同格式解析
	for _, format := range formats {
		parsedTime, err = time.Parse(format, input)
		if err == nil {
			return parsedTime, nil
		}
	}

	return parsedTime, err
}
