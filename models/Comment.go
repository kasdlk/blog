package models

// Comment 留言/评论表
type Comment struct {
	BaseModel
	BlogID   uint   `gorm:"not null" json:"blog_id"`           // 所属博客文章ID
	UserID   uint   `gorm:"not null" json:"user_id"`           // 留言用户ID
	Content  string `gorm:"type:text;not null" json:"content"` // 留言内容
	ParentID *uint  `json:"parent_id,omitempty"`               // 父评论ID（可选，用于回复或多级评论）
}

// TableName 指定 Comment 表名
func (Comment) TableName() string {
	return "comments"
}
