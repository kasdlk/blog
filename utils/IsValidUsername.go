package utils

import "regexp"

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

// ✅ 导出函数（首字母大写）
func IsValidEmail(email string) bool {
	return emailRegex.MatchString(email)
}

var usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]{4,20}$`)

// ✅ 导出函数（首字母大写）
func IsValidUsername(username string) bool {
	return usernameRegex.MatchString(username)
}
