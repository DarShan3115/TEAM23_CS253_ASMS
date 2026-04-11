package models

import (
	"time"
	"github.com/google/uuid"
)

type Submission struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	AssignmentID uuid.UUID `gorm:"type:uuid;not null" json:"assignment_id"`
	StudentID    uuid.UUID `gorm:"type:uuid;not null" json:"student_id"`
	Content      string    `gorm:"type:text" json:"content"`
	FileURL      string    `gorm:"type:text" json:"file_url"`
	Marks        *int      `gorm:"type:integer" json:"marks"`       // nullable until graded
	Feedback     string    `gorm:"type:text" json:"feedback"`
	SubmittedAt  time.Time `json:"submitted_at"`
}

func (Submission) TableName() string {
	return "submissions"
}