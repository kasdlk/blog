package controllers

import (
	"blog/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"math"
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

// ✅ GetUserEmployeeRevenueList 获取当前用户自己的收益记录（支持日期筛选 + 分页）
func (c *employeeRevenueController) GetUserEmployeeRevenueList(ctx *gin.Context) {
	pageStr := ctx.DefaultQuery("page", "1")
	limitStr := ctx.DefaultQuery("limit", "10")
	startDateStr := ctx.Query("startDate")
	endDateStr := ctx.Query("endDate")

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

	// 按时间筛选
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

	// 获取数据
	var revenues []models.EmployeeRevenue
	if err := query.Order("record_time DESC").Limit(limit).Offset(offset).Find(&revenues).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data"})
		return
	}

	// 统计总数
	var totalCount int64
	query.Count(&totalCount)

	// 对返回的数值字段进行四舍五入（保留两位小数）
	for i := range revenues {
		revenues[i].Revenue = math.Round(revenues[i].Revenue*100) / 100
		revenues[i].Expenditure = math.Round(revenues[i].Expenditure*100) / 100
		revenues[i].ROI = math.Round(revenues[i].ROI*100) / 100
	}

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
func (c *employeeRevenueController) ListEmployeeRevenue(ctx *gin.Context) {
	// 获取查询参数
	startDateStr := ctx.Query("startDate")
	endDateStr := ctx.Query("endDate")
	userIDStr := ctx.Query("userId")

	// 构造查询条件
	query := c.db.Model(&models.EmployeeRevenue{})

	// 按员工筛选（如果提供了 userId）
	if userIDStr != "" {
		if employeeID, err := strconv.Atoi(userIDStr); err == nil {
			query = query.Where("employee_revenue.user_id = ?", employeeID)
		}
	}

	// 按时间筛选（如果同时提供了 startDate 与 endDate）
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
		// 调整结束日期到当天最后一刻
		endDate = endDate.AddDate(0, 0, 1).Add(-time.Nanosecond)
		query = query.Where("employee_revenue.record_time BETWEEN ? AND ?", startDate, endDate)
	}

	// 定义聚合结果结构（每个员工一条记录）
	type AggregatedResult struct {
		UserID               int     `json:"user_id"`
		Nickname             string  `json:"nickname"`
		Avatar               string  `json:"avatar"`
		TotalRevenue         float64 `json:"total_revenue"`
		TotalExpenditure     float64 `json:"total_expenditure"`
		TotalOrderCount      int64   `json:"total_order_count"`
		TotalAdCreationCount int64   `json:"total_ad_creation_count"`
		AverageROI           float64 `json:"average_roi"`
	}

	var results []AggregatedResult

	// 使用聚合函数并按 user_id 分组，并通过左联接获取用户的 nickname 和 avatar
	err := query.
		Joins("left join users on users.id = employee_revenue.user_id").
		Select(
			"employee_revenue.user_id, " +
				"users.nickname as nickname, " +
				"users.avatar as avatar, " +
				"SUM(employee_revenue.revenue) as total_revenue, " +
				"SUM(employee_revenue.expenditure) as total_expenditure, " +
				"SUM(employee_revenue.order_count) as total_order_count, " +
				"SUM(employee_revenue.ad_creation_count) as total_ad_creation_count, " +
				"CASE WHEN SUM(employee_revenue.expenditure) <> 0 THEN SUM(employee_revenue.revenue)/SUM(employee_revenue.expenditure) ELSE 0 END as average_roi",
		).
		Group("employee_revenue.user_id").
		Scan(&results).Error

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch aggregated data"})
		return
	}

	// 对返回的 float 数值保留两位小数
	for i := range results {
		results[i].TotalRevenue = math.Round(results[i].TotalRevenue*100) / 100
		results[i].TotalExpenditure = math.Round(results[i].TotalExpenditure*100) / 100
		results[i].AverageROI = math.Round(results[i].AverageROI*100) / 100
	}

	// 返回所有员工的聚合数据
	// 当请求中传入 userId 参数时，返回数组中只包含该员工的一条记录，
	// 否则返回所有员工的统计数据，由前端进行总数据的统计计算
	ctx.JSON(http.StatusOK, gin.H{
		"data": results,
	})
}
