package models

import (
	"time"
)

// BaseModel ✅ 通用基础模型，包含常规的 ID、时间戳、软删除
type BaseModel struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
