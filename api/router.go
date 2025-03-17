package api

import (
	"blog/config"
	"blog/controllers"
	"blog/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

func SetupRouter() *gin.Engine {
	config.Initialize()
	r := gin.Default()
	r.Use(Cors())
	api := r.Group("/api")

	// 用户相关路由
	userRoutes := api.Group("/user")
	{
		userController := controllers.NewUserController(config.DB)

		// 用户自身接口
		userRoutes.POST("/register", userController.RegisterUser)
		userRoutes.POST("/signin", userController.LoginUser)
		userRoutes.GET("/profile", utils.AuthMiddleware(utils.RoleUser), userController.GetUserProfile)
		userRoutes.PUT("/profile", utils.AuthMiddleware(utils.RoleUser), userController.UpdateUserProfile)
		userRoutes.GET("/all", utils.AuthMiddleware(utils.RoleMarketer), userController.GetAllUsers)

		// 管理员接口
		userRoutes.POST("/admin/create", utils.AuthMiddleware(utils.RoleAdmin), userController.CreateUserByAdmin)
		userRoutes.PUT("/admin/:id", utils.AuthMiddleware(utils.RoleAdmin), userController.UpdateUserByAdmin)
		userRoutes.DELETE("/:id", utils.AuthMiddleware(utils.RoleAdmin), userController.DeleteUser)
		userRoutes.GET("/admin/all", utils.AuthMiddleware(utils.RoleAdmin), userController.GetAdminAllUsers)
	}

	// 博客相关路由
	blogRoutes := api.Group("/blog")
	{
		blogController := controllers.NewBlogController(config.DB)

		// ✅ 创建、更新、删除仅限于作者或管理员
		blogRoutes.POST("/", utils.AuthMiddleware(utils.RoleMarketer), blogController.CreateBlog)
		blogRoutes.PUT("/:id", utils.AuthMiddleware(utils.RoleMarketer), blogController.UpdateBlog)
		blogRoutes.DELETE("/:id", utils.AuthMiddleware(utils.RoleMarketer), blogController.DeleteBlog)
		// 获取所有用户的博客
		blogRoutes.GET("/paginated", utils.AuthMiddleware(utils.RoleUser), blogController.GetBlogsPaginated)

		// ✅ 普通用户可以查看和筛选
		// 获取博客详情
		blogRoutes.GET("/:id", utils.AuthMiddleware(utils.RoleUser), blogController.GetBlogByID)
		// 获取当前用户的所有博客分页
		blogRoutes.GET("/user", utils.AuthMiddleware(utils.RoleUser), blogController.GetCurrentUserBlogs)
		// 获取当前用户的所有博客的目录
		blogRoutes.GET("/directory", utils.AuthMiddleware(utils.RoleMarketer), blogController.GetBlogDirectory)
		blogRoutes.GET("/my", utils.AuthMiddleware(utils.RoleMarketer), blogController.GetMyBlogInfo)

	}

	// 留言/评论相关路由
	commentRoutes := api.Group("/comment")
	{
		commentController := controllers.NewCommentController(config.DB)
		// 创建留言需要普通用户权限（角色值<=4）
		commentRoutes.POST("/", utils.AuthMiddleware(utils.RoleUser), commentController.CreateComment)
		commentRoutes.PUT("/:id", utils.AuthMiddleware(utils.RoleUser), commentController.UpdateComment)
		commentRoutes.DELETE("/:id", utils.AuthMiddleware(utils.RoleUser), commentController.DeleteComment)
		commentRoutes.GET("/:id", commentController.GetComment)
		commentRoutes.GET("/", commentController.ListComments)
		commentRoutes.GET("/blog/:blog_id", commentController.ListCommentsByBlog)
	}

	// 通知相关路由
	notificationRoutes := api.Group("/notification")
	{
		notificationController := controllers.NewNotificationController(config.DB)
		// 通知接口需要普通用户权限即可
		notificationRoutes.POST("/", utils.AuthMiddleware(utils.RoleUser), notificationController.CreateNotification)
		notificationRoutes.GET("/:id", utils.AuthMiddleware(utils.RoleUser), notificationController.GetNotification)
		notificationRoutes.PUT("/:id", utils.AuthMiddleware(utils.RoleUser), notificationController.UpdateNotification)
		notificationRoutes.DELETE("/:id", utils.AuthMiddleware(utils.RoleUser), notificationController.DeleteNotification)
		notificationRoutes.GET("/", utils.AuthMiddleware(utils.RoleUser), notificationController.ListNotifications)
	}

	// 员工收益相关路由
	employeeRevenueRoutes := api.Group("/employee-revenue")
	{
		employeeRevenueController := controllers.NewEmployeeRevenueController(config.DB)
		// 只有管理员或财务可以操作，角色要求 <= 2
		employeeRevenueRoutes.POST("/", utils.AuthMiddleware(utils.RoleUser), employeeRevenueController.CreateEmployeeRevenue)
		employeeRevenueRoutes.PUT("/:id", utils.AuthMiddleware(utils.RoleMarketer), employeeRevenueController.UpdateEmployeeRevenue)
		employeeRevenueRoutes.DELETE("/:id", utils.AuthMiddleware(utils.RoleMarketer), employeeRevenueController.DeleteEmployeeRevenue)
		employeeRevenueRoutes.GET("/:id", utils.AuthMiddleware(utils.RoleMarketer), employeeRevenueController.GetEmployeeRevenue)
		employeeRevenueRoutes.GET("/", utils.AuthMiddleware(utils.RoleMarketer), employeeRevenueController.ListEmployeeRevenue)
		employeeRevenueRoutes.GET("/user/revenue", utils.AuthMiddleware(utils.RoleUser), employeeRevenueController.GetUserEmployeeRevenueList)
	}

	// 充值流水相关路由
	rechargeTransactionRoutes := api.Group("/recharge-transaction")
	{
		rechargeTransactionController := controllers.NewRechargeTransactionController(config.DB)
		// 充值流水接口允许普通用户查询和操作
		rechargeTransactionRoutes.POST("/", utils.AuthMiddleware(utils.RoleUser), rechargeTransactionController.CreateRechargeTransaction)
		rechargeTransactionRoutes.PUT("/:id", utils.AuthMiddleware(utils.RoleUser), rechargeTransactionController.UpdateRechargeTransaction)
		rechargeTransactionRoutes.DELETE("/:id", utils.AuthMiddleware(utils.RoleUser), rechargeTransactionController.DeleteRechargeTransaction)
		rechargeTransactionRoutes.GET("/:id", utils.AuthMiddleware(utils.RoleUser), rechargeTransactionController.GetRechargeTransaction)
		rechargeTransactionRoutes.GET("/", utils.AuthMiddleware(utils.RoleUser), rechargeTransactionController.ListRechargeTransactions)
	}

	return r
}

func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
			c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
			c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
			c.Header("Access-Control-Allow-Credentials", "false")
			c.Set("content-type", "application/json")
		}
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
		}
		c.Next()
	}
}
