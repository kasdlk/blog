package models

import (
	"time"
)

type RechargeTransaction struct {
	BaseModel
	UserID          uint      `gorm:"not null" json:"user_id"`
	OrderNumber     string    `gorm:"type:varchar(100);unique;not null" json:"order_number"`
	Amount          float64   `gorm:"not null;default:0" json:"amount"`
	PaymentMethod   string    `gorm:"type:varchar(50);not null" json:"payment_method"`
	Status          string    `gorm:"type:varchar(50);not null" json:"status"`
	TransactionTime time.Time `gorm:"not null" json:"transaction_time"`
	Remark          string    `gorm:"type:text" json:"remark,omitempty"`
}

// TableName 指定 RechargeTransaction 表名
func (RechargeTransaction) TableName() string {
	return "recharge_transactions"
}
