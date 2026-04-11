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
	if err := h.DB.Where("user_id = ?", userID).Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch tasks"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// GetCourseTasks returns all assignments/tasks linked to a specific course
func (h *TaskHandler) GetCourseTasks(c *gin.Context) {
	courseIDStr := c.Param("courseId")
	if courseIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Course ID required"})
		return
	}

	courseID, err := uuid.Parse(courseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Course ID"})
		return
	}

	var tasks []models.Task
	if err := h.DB.Where("course_id = ?", courseID).Order("created_at desc").Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch course tasks"})
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

	userIDStr := c.GetHeader("x-user-id")
	if userIDStr != "" {
		if uid, err := uuid.Parse(userIDStr); err == nil {
			task.UserID = uid
		}
	}

	if err := h.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create task"})
		return
	}

	c.JSON(http.StatusCreated, task)
}

// UpdateTask handles toggling completions and tags
func (h *TaskHandler) UpdateTask(c *gin.Context) {
	taskID := c.Param("taskId")
	var task models.Task
	if err := h.DB.First(&task, "id = ?", taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.DB.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update task"})
		return
	}

	c.JSON(http.StatusOK, task)
}

// DeleteTask handles removal
func (h *TaskHandler) DeleteTask(c *gin.Context) {
	taskID := c.Param("taskId")
	if err := h.DB.Delete(&models.Task{}, "id = ?", taskID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not delete task"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Task deleted"})
}
