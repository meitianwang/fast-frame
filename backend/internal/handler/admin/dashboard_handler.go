package admin

import (
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/response"

	"github.com/gin-gonic/gin"
)

// DashboardHandler handles admin dashboard statistics
type DashboardHandler struct {
	startTime time.Time // Server start time for uptime calculation
}

// NewDashboardHandler creates a new admin dashboard handler
func NewDashboardHandler() *DashboardHandler {
	return &DashboardHandler{
		startTime: time.Now(),
	}
}

// GetRealtimeMetrics handles getting real-time system metrics
// GET /api/v1/admin/dashboard/realtime
func (h *DashboardHandler) GetRealtimeMetrics(c *gin.Context) {
	// Return mock data for now
	response.Success(c, gin.H{
		"active_requests":       0,
		"requests_per_minute":   0,
		"average_response_time": 0,
		"error_rate":            0.0,
	})
}
