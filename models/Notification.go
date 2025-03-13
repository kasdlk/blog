package models

type Notification struct {
	BaseModel
	UserID  uint   `gorm:"not null" json:"user_id"`
	Type    string `gorm:"type:varchar(50);not null" json:"type"`
	Content string `gorm:"type:text;not null" json:"content"`
	Status  string `gorm:"type:varchar(20);default:'unread'" json:"status"`
}

// TableName 指定 Notification 表名
func (Notification) TableName() string {
	return "notifications"
}
