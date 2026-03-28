package handlers

import (
	"net/http"

	"github.com/DarShan3115/TEAM23_CS253_ASMS/server/productivity-service/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TaskHandler struct {
	DB *gorm.DB
}

func NewTaskHandler(db *gorm.DB) *TaskHandler {
	return &TaskHandler{DB: db}
}

// GetUserTasks returns all assignments for a specific student
func (h *TaskHandler) GetUserTasks(c *gin.Context) {
	// For now, we'll take userID from a header or query param until JWT is fully synced
	userIDStr := c.GetHeader("x-user-id")
	if userIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID required"})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid User ID"})
		return
	}

	var tasks []models.Task
	if err := h.DB.Where("student_id = ?", userID).Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch tasks"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// CreateTask adds a new assignment
func (h *TaskHandler) CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create task"})
		return
	}

	c.JSON(http.StatusCreated, task)
}
