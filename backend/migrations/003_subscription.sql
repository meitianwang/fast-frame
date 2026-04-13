-- Fast-Frame 订阅功能迁移脚本
-- 添加订阅分组和用户订阅功能

-- 1. 扩展 groups 表添加订阅相关字段
ALTER TABLE groups ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) NOT NULL DEFAULT 'standard';
ALTER TABLE groups ADD COLUMN IF NOT EXISTS daily_limit_usd DECIMAL(20, 8) DEFAULT NULL;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS weekly_limit_usd DECIMAL(20, 8) DEFAULT NULL;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS monthly_limit_usd DECIMAL(20, 8) DEFAULT NULL;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS default_validity_days INT NOT NULL DEFAULT 30;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_groups_subscription_type ON groups(subscription_type);

-- 2. 创建 user_subscriptions 用户订阅表
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id                BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    -- 订阅有效期
    starts_at               TIMESTAMPTZ NOT NULL,
    expires_at              TIMESTAMPTZ NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'active',  -- active/expired/suspended

    -- 滑动窗口起始时间（NULL=未激活）
    daily_window_start      TIMESTAMPTZ,
    weekly_window_start     TIMESTAMPTZ,
    monthly_window_start    TIMESTAMPTZ,

    -- 当前窗口已用额度（USD，基于 total_cost 计算）
    daily_usage_usd         DECIMAL(20, 10) NOT NULL DEFAULT 0,
    weekly_usage_usd        DECIMAL(20, 10) NOT NULL DEFAULT 0,
    monthly_usage_usd       DECIMAL(20, 10) NOT NULL DEFAULT 0,

    -- 管理员分配信息
    assigned_by             BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assigned_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes                   TEXT,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 唯一约束：每个用户对每个分组只能有一个订阅
    UNIQUE(user_id, group_id)
);

-- user_subscriptions 索引
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_group_id ON user_subscriptions(group_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_assigned_by ON user_subscriptions(assigned_by);
