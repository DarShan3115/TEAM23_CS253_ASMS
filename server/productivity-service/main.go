package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/DarShan3115/TEAM23_CS253_ASMS/server/productivity-service/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Database Connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "host=db user=admin password=admin dbname=asms_db port=5432 sslmode=disable"
	}
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 1. Port configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 2. Set Gin mode
	mode := os.Getenv("GIN_MODE")
	if mode == "" {
		mode = gin.DebugMode
	}
	gin.SetMode(mode)

	r := gin.Default()

	// 3. CORS configuration for React integration
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "x-auth-token", "x-user-id"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 4. Routes
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "healthy",
			"service": "productivity-service",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	taskHandler := handlers.NewTaskHandler(db)
	discussionHandler := handlers.NewDiscussionHandler(db)
	submissionHandler := handlers.NewSubmissionHandler(db)

	v1 := r.Group("/api/v1")
	{
		v1.GET("/ping", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "pong from Go productivity-service",
			})
		})

		// Tasks APIs
		v1.GET("/tasks", taskHandler.GetUserTasks)
		v1.POST("/tasks", taskHandler.CreateTask)
		v1.PUT("/tasks/:taskId", taskHandler.UpdateTask)
		v1.DELETE("/tasks/:taskId", taskHandler.DeleteTask)

		// Discussions APIs
		v1.GET("/discussions/:courseId", discussionHandler.GetDiscussions)
		v1.POST("/discussions", discussionHandler.PostToDiscussion)

		// Submissions / Grading APIs (used by faculty and students)
		v1.POST("/submissions", submissionHandler.SubmitTask)
		v1.GET("/assignments/:id/submissions", submissionHandler.GetSubmissionByTask)
		v1.PUT("/submissions/:submissionId/grade", submissionHandler.GradeSubmission)
	}

	// 5. Start server
	log.Printf("Productivity service starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}