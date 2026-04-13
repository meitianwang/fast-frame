package service

import (
	"context"

	infraerrors "github.com/meitianwang/fast-frame/internal/pkg/errors"
	"github.com/meitianwang/fast-frame/internal/pkg/pagination"
)

var (
	ErrGroupNotFound = infraerrors.NotFound("GROUP_NOT_FOUND", "group not found")
	ErrGroupExists   = infraerrors.Conflict("GROUP_EXISTS", "group name already exists")
)

// UserGroupRateEntry 分组下用户专属倍率条目
type UserGroupRateEntry struct {
	UserID         int64   `json:"user_id"`
	UserName       string  `json:"user_name"`
	UserEmail      string  `json:"user_email"`
	UserNotes      string  `json:"user_notes"`
	UserStatus     string  `json:"user_status"`
	RateMultiplier float64 `json:"rate_multiplier"`
}

// GroupRateMultiplierInput 批量设置分组倍率的输入条目
type GroupRateMultiplierInput struct {
	UserID         int64   `json:"user_id"`
	RateMultiplier float64 `json:"rate_multiplier"`
}

// GroupSortOrderUpdate 分组排序更新
type GroupSortOrderUpdate struct {
	ID        int64 `json:"id"`
	SortOrder int   `json:"sort_order"`
}

// UserGroupRateRepository 用户专属分组倍率仓储接口
type UserGroupRateRepository interface {
	GetByUserID(ctx context.Context, userID int64) (map[int64]float64, error)
	GetByUserAndGroup(ctx context.Context, userID, groupID int64) (*float64, error)
	GetByGroupID(ctx context.Context, groupID int64) ([]UserGroupRateEntry, error)
	SyncUserGroupRates(ctx context.Context, userID int64, rates map[int64]*float64) error
	SyncGroupRateMultipliers(ctx context.Context, groupID int64, entries []GroupRateMultiplierInput) error
	DeleteByGroupID(ctx context.Context, groupID int64) error
	DeleteByUserID(ctx context.Context, userID int64) error
}

// GroupRepository defines the repository interface for groups
type GroupRepository interface {
	Create(ctx context.Context, group *Group) error
	GetByID(ctx context.Context, id int64) (*Group, error)
	GetByIDLite(ctx context.Context, id int64) (*Group, error)
	Update(ctx context.Context, group *Group) error
	Delete(ctx context.Context, id int64) error
	DeleteCascade(ctx context.Context, id int64) ([]int64, error)
	List(ctx context.Context, params pagination.PaginationParams) ([]Group, *pagination.PaginationResult, error)
	ListActive(ctx context.Context) ([]Group, error)
	ListWithFilters(ctx context.Context, params pagination.PaginationParams, status, search string, isExclusive *bool) ([]Group, *pagination.PaginationResult, error)
	ExistsByName(ctx context.Context, name string) (bool, error)
	ExistsByIDs(ctx context.Context, ids []int64) (map[int64]bool, error)
	UpdateSortOrders(ctx context.Context, updates []GroupSortOrderUpdate) error
}
