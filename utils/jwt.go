package utils

import (
	"blog/models"
	"github.com/dgrijalva/jwt-go"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"strconv"
	"time"
)

type JWTTools interface {
	GenerateToken(user *models.Users) (string, error)
	ParseToken(tokenString string) (*MyClaims, error)
	HashPassword(password string) (string, error)
	CheckPasswordHash(password, hash string) bool
}

type jwtTools struct{}

func NewJWTTools() JWTTools {
	return &jwtTools{}
}

type MyClaims struct {
	UserID uint `json:"user_id"`
	Role   int  `json:"role"`
	jwt.StandardClaims
}

// JWT密钥
var jwtKey = []byte("123456")
var jwtIssuer = "123"
var jwtAudience = "123"

// HashPassword 对密码进行哈希处理
func (s *jwtTools) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash 检查密码是否匹配哈希值
func (s *jwtTools) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateToken 生成JWT
func (s *jwtTools) GenerateToken(user *models.Users) (string, error) {
	now := time.Now()
	expirationTime := now.Add(24 * time.Hour) // Token 有效期为24小时

	claims := &MyClaims{
		UserID: user.ID, // 将数据库中固定的用户ID存入自定义字段
		Role:   user.Role,
		StandardClaims: jwt.StandardClaims{
			Issuer:    jwtIssuer,                  // 签发者
			Subject:   strconv.Itoa(int(user.ID)), // Subject 使用用户ID的字符串形式
			Audience:  jwtAudience,                // 受众
			Id:        uuid.New().String(),        // Token 实例的唯一标识
			ExpiresAt: expirationTime.Unix(),      // 到期时间
			IssuedAt:  now.Unix(),                 // 签发时间
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ParseToken 解析JWT
func (s *jwtTools) ParseToken(tokenString string) (*MyClaims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString, &MyClaims{}, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*MyClaims)
	if !ok || !token.Valid {
		return nil, err
	}

	return claims, nil
}
