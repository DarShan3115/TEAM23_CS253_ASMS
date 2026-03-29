package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Task struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `json:"description"`
	CourseID    *uuid.UUID     `gorm:"type:uuid" json:"course_id"` // Optional link to a course
	UserID      uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	DueDate     *time.Time     `json:"due_date"`
	Priority    string         `gorm:"default:'Medium'" json:"priority"` // High, Medium, Low
	Status      string         `gorm:"default:'Pending'" json:"status"`   // Pending, Completed
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName matches the plural naming convention if needed, 
// but we'll stick to the init.sql schema if you add a tasks table there.
func (Task) TableName() string {
	return "assignments" // Mapping to your 'assignments' table in init.sql
}