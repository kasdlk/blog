package models

import (
	"time"
)

type Users struct {
	BaseModel
	Username    string     `gorm:"unique;not null" json:"username"`
	Password    string     `gorm:"not null" json:"password"`
	Nickname    string     `gorm:"not null" json:"nickname"`
	Email       string     `gorm:"not null" json:"email"`
	Role        int        `gorm:"not null" json:"role"`
	Avatar      string     `gorm:"default:'default_avatar.png'" json:"avatar,omitempty"`
	Bio         string     `gorm:"type:text" json:"bio,omitempty"`
	Website     string     `gorm:"type:varchar(255)" json:"website,omitempty"`
	LastLoginAt *time.Time `json:"last_login_at,omitempty"`
	Status      int        `gorm:"not null;default:1" json:"status"`
}

// TableName sets the insert table name for this struct type
func (Users) TableName() string {
	return "users"
}
