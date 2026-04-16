package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/DarShan3115/TEAM23_CS253_ASMS/server/productivity-service/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SubmissionHandler struct {
	DB *gorm.DB
}

func NewSubmissionHandler(db *gorm.DB) *SubmissionHandler {
	return &SubmissionHandler{DB: db}
}

// SubmitTask handles the POST request from the frontend
func (h *SubmissionHandler) SubmitTask(c *gin.Context) {
	var input struct {
		AssignmentID string `json:"assignment_id" binding:"required"`
		Content      string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data"})
		return
	}

	// Extract Student ID from the verified JWT context
	studentIDStr := c.MustGet("userID").(string)
	studentID, _ := uuid.Parse(studentIDStr)
	assignmentID, _ := uuid.Parse(input.AssignmentID)

	submission := models.Submission{
		ID:           uuid.New(),
		AssignmentID: assignmentID,
		StudentID:    studentID,
		Content:      input.Content,
	}

	if err := h.DB.Create(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save submission"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Submission received successfully",
		"id":      submission.ID,
	})
}

// GetSubmissionByTask allows a student to see what they submitted
func (h *SubmissionHandler) GetSubmissionByTask(c *gin.Context) {
	assignmentID := c.Param("id")
	studentID := c.MustGet("userID").(string)

	var submission models.Submission
	result := h.DB.Where("assignment_id = ? AND student_id = ?", assignmentID, studentID).First(&submission)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No submission found for this task"})
		return
	}

	c.JSON(http.StatusOK, submission)
}

// GradeSubmission lets faculty enter marks and feedback for a submission
func (h *SubmissionHandler) GradeSubmission(c *gin.Context) {
	submissionID := c.Param("submissionId")
	var input struct {
		Marks    *int   `json:"marks"`
		Feedback string `json:"feedback"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid grading data"})
		return
	}

	var submission models.Submission
	if err := h.DB.First(&submission, "id = ?", submissionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission not found"})
		return
	}

	if input.Marks != nil {
		submission.Marks = input.Marks
	}
	if input.Feedback != "" {
		submission.Feedback = input.Feedback
	}

	if err := h.DB.Save(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save grade"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Grade saved", "submission_id": submission.ID})
}