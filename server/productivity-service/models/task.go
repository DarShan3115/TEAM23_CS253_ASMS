package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Task struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	UserID      uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `json:"description"`
	DueDate     *string        `gorm:"type:date" json:"due_date"`
	DueTime     *string        `gorm:"type:time" json:"due_time"`
	CourseTag   string         `gorm:"type:varchar(6)" json:"course_tag"`
	CustomTag   string         `gorm:"type:varchar(50)" json:"custom_tag"`
	IsCompleted *bool          `gorm:"default:false" json:"is_completed"`
	CreatedAt   time.Time      `json:"created_at"`
}

func (Task) TableName() string {
	return "tasks"
}