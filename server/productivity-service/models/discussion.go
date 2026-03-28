package models

import (
	"time"
	"github.com/google/uuid"
)

type Discussion struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()" json:"id"`
	CourseID    uuid.UUID `gorm:"type:uuid;index;not null" json:"course_id"`
	AuthorID    uuid.UUID `gorm:"type:uuid;not null" json:"-"` // Hidden from JSON
	AuthorName  string    `gorm:"-" json:"author_name"`         // Populated only if not anonymous
	Content     string    `gorm:"type:text;not null" json:"content"`
	IsAnonymous bool      `gorm:"default:true" json:"is_anonymous"`
	Votes       int       `gorm:"default:0" json:"votes"`
	CreatedAt   time.Time `json:"created_at"`
}

func (Discussion) TableName() string {
	return "discussions"
}