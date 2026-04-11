package handlers

import (
	"net/http"

	"github.com/DarShan3115/TEAM23_CS253_ASMS/server/productivity-service/models"
	"github.com/gin-gonic/gin"
)

// UpdateSubmissionGrade allows faculty to grade a student's work
func (h *SubmissionHandler) UpdateSubmissionGrade(c *gin.Context) {
	submissionID := c.Param("id")
	var input struct {
		Grade    float64 `json:"grade" binding:"required"`
		Feedback string  `json:"feedback"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	var submission models.Submission
	if err := h.DB.First(&submission, "id = ?", submissionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Submission not found"})
		return
	}

	// Update fields
	submission.Grade = &input.Grade
	submission.Feedback = input.Feedback

	if err := h.DB.Save(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update grade"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Grade updated successfully", "submission": submission})
}

// GetSubmissionsByAssignment returns all student work for a specific task
func (h *SubmissionHandler) GetSubmissionsByAssignment(c *gin.Context) {
	assignmentID := c.Param("assignmentId")

	var submissions []models.Submission
	if err := h.DB.Where("assignment_id = ?", assignmentID).Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch submissions"})
		return
	}

	c.JSON(http.StatusOK, submissions)
}
