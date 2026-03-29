package models

import (
	"time"
	"github.com/google/uuid"
)

type Submission struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	AssignmentID uuid.UUID `gorm:"type:uuid;not null;index" json:"assignment_id"`
	StudentID    uuid.UUID `gorm:"type:uuid;not null;index" json:"student_id"`
	Content      string    `gorm:"type:text" json:"content"` // Can be a URL, text, or file reference
	SubmittedAt  time.Time `gorm:"autoCreateTime" json:"submitted_at"`
	Grade        *float64  `json:"grade"`
	Feedback     string    `json:"feedback"`
}

func (Submission) TableName() string {
	return "submissions"
}