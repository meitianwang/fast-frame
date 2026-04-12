package service

import (
	"context"
	"errors"
	"time"
)

// ErrRefreshTokenNotFound is returned when a refresh token is not found in cache.
var ErrRefreshTokenNotFound = errors.New("refresh token not found")

// RefreshTokenData 存储在Redis中的Refresh Token数据
type RefreshTokenData struct {
	UserID       int64     `json:"user_id"`
	TokenVersion int64     `json:"token_version"`
	FamilyID     string    `json:"family_id"`
	CreatedAt    time.Time `json:"created_at"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// RefreshTokenCache 管理Refresh Token的Redis缓存
type RefreshTokenCache interface {
	StoreRefreshToken(ctx context.Context, tokenHash string, data *RefreshTokenData, ttl time.Duration) error
	GetRefreshToken(ctx context.Context, tokenHash string) (*RefreshTokenData, error)
	DeleteRefreshToken(ctx context.Context, tokenHash string) error
	DeleteUserRefreshTokens(ctx context.Context, userID int64) error
	DeleteTokenFamily(ctx context.Context, familyID string) error
	AddToUserTokenSet(ctx context.Context, userID int64, tokenHash string, ttl time.Duration) error
	AddToFamilyTokenSet(ctx context.Context, familyID string, tokenHash string, ttl time.Duration) error
	GetUserTokenHashes(ctx context.Context, userID int64) ([]string, error)
	GetFamilyTokenHashes(ctx context.Context, familyID string) ([]string, error)
	IsTokenInFamily(ctx context.Context, familyID string, tokenHash string) (bool, error)
}

// APIKeyAuthCacheInvalidator provides cache invalidation for auth-related changes
type APIKeyAuthCacheInvalidator interface {
	InvalidateAuthCacheByKey(ctx context.Context, key string)
	InvalidateAuthCacheByUserID(ctx context.Context, userID int64)
	InvalidateAuthCacheByGroupID(ctx context.Context, groupID int64)
}

// BillingCache provides cache operations for user balance
type BillingCache interface {
	GetUserBalance(ctx context.Context, userID int64) (float64, error)
	SetUserBalance(ctx context.Context, userID int64, balance float64) error
	InvalidateUserBalance(ctx context.Context, userID int64) error
}

// BillingCacheService wraps billing cache with subscription invalidation
type BillingCacheService struct {
	cache BillingCache
}

// NewBillingCacheService creates a new BillingCacheService
func NewBillingCacheService(cache BillingCache) *BillingCacheService {
	return &BillingCacheService{cache: cache}
}

// InvalidateUserBalance invalidates user balance cache
func (s *BillingCacheService) InvalidateUserBalance(ctx context.Context, userID int64) error {
	if s.cache == nil {
		return nil
	}
	return s.cache.InvalidateUserBalance(ctx, userID)
}

// InvalidateSubscription invalidates subscription cache (no-op in base framework)
func (s *BillingCacheService) InvalidateSubscription(ctx context.Context, userID, groupID int64) error {
	return nil
}
