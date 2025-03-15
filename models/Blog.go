package models

// Blog 博客表
type Blog struct {
	BaseModel
	UserID   uint   `gorm:"not null" json:"user_id"`                        // 关联员工或用户ID
	Title    string `gorm:"type:varchar(255);not null" json:"title"`        // 文章标题
	Content  string `gorm:"type:text;not null" json:"content"`              // 文章内容
	AuthorID uint   `gorm:"not null" json:"author_id"`                      // 作者ID
	Category string `gorm:"type:varchar(100);not null" json:"category"`     // 文章分类
	Tags     string `gorm:"type:varchar(255)" json:"tags"`                  // 文章标签（逗号分隔）
	Status   string `gorm:"type:varchar(50);default:'draft'" json:"status"` // 状态（draft/published）

	Users    Users     `gorm:"foreignKey:UserID"`
	Comments []Comment `gorm:"foreignKey:BlogID"` // 关联评论
}

// TableName sets the insert table name for this struct type
func (Blog) TableName() string {
	return "blog"
}
