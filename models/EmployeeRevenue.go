package models

import (
	"time"
)

type EmployeeRevenue struct {
	// 基础模型，包含 ID、创建时间、更新时间等通用字段
	BaseModel

	// 用户 ID，标识该收益记录属于哪个用户（必填）
	UserID uint `gorm:"not null" json:"user_id"`
	// 广告平台，标识广告的来源平台（如 Google Ads、Facebook Ads 等）
	AdPlatform string `gorm:"type:varchar(255);not null" json:"ad_platform"`
	// 商品分类，标识该广告涉及的商品类型（如 电子产品、服装等）
	ProductCategories string `gorm:"type:varchar(255);not null" json:"product_categories"`
	// 广告类型（如 信息流广告、搜索广告等）
	AdType string `gorm:"type:varchar(255);not null" json:"ad_type"`
	// 地区（如 华东地区、北美地区等）
	Region string `gorm:"type:varchar(255);not null" json:"region"`
	// 广告支出（单位：美元）
	Expenditure float64 `gorm:"not null;default:0" json:"expenditure"`
	// 销售订单数量
	OrderCount int `gorm:"not null;default:0" json:"order_count"`
	// 上新品数量（表示每天上了多少个新品）
	AdCreationCount int `gorm:"not null;default:0" json:"ad_creation_count"`
	// 销售额（单位：美元）
	Revenue float64 `gorm:"not null;default:0" json:"revenue"`
	// ROI 销售额/广告费（自动计算）
	ROI float64 `gorm:"not null;default:0" json:"roi"`
	// 记录时间（替代 start_time）
	RecordTime time.Time `json:"record_time"`
	// 前端传入时间格式，数据库不存储该字段
	RecordTimeStr string `json:"record_time_str" gorm:"-"`

	// 备注（可选）
	Remark string `gorm:"type:text" json:"remark,omitempty"`

	User Users `gorm:"foreignKey:UserID" json:"user"`
}

// TableName 指定 EmployeeRevenue 表名
func (EmployeeRevenue) TableName() string {
	return "employee_revenue"
}
