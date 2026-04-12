package service

import "github.com/Wei-Shaw/sub2api/internal/domain"

// Status constants
const (
	StatusActive   = domain.StatusActive
	StatusDisabled = domain.StatusDisabled
	StatusError    = domain.StatusError
	StatusUnused   = domain.StatusUnused
	StatusUsed     = domain.StatusUsed
	StatusExpired  = domain.StatusExpired
)

// Role constants
const (
	RoleAdmin = domain.RoleAdmin
	RoleUser  = domain.RoleUser
)

// Redeem type constants
const (
	RedeemTypeBalance      = domain.RedeemTypeBalance
	RedeemTypeConcurrency  = domain.RedeemTypeConcurrency
	RedeemTypeSubscription = domain.RedeemTypeSubscription
	RedeemTypeInvitation   = domain.RedeemTypeInvitation
)

// PromoCode status constants
const (
	PromoCodeStatusActive   = domain.PromoCodeStatusActive
	PromoCodeStatusDisabled = domain.PromoCodeStatusDisabled
)

// Admin adjustment type constants
const (
	AdjustmentTypeAdminBalance     = domain.AdjustmentTypeAdminBalance
	AdjustmentTypeAdminConcurrency = domain.AdjustmentTypeAdminConcurrency
)

// Group subscription type constants
const (
	SubscriptionTypeStandard     = domain.SubscriptionTypeStandard
	SubscriptionTypeSubscription = domain.SubscriptionTypeSubscription
)

// Subscription status constants
const (
	SubscriptionStatusActive    = domain.SubscriptionStatusActive
	SubscriptionStatusExpired   = domain.SubscriptionStatusExpired
	SubscriptionStatusSuspended = domain.SubscriptionStatusSuspended
)

// LinuxDoConnectSyntheticEmailDomain 是 LinuxDo Connect 用户的合成邮箱后缀
const LinuxDoConnectSyntheticEmailDomain = "@linuxdo-connect.invalid"

// Setting keys
const (
	// 注册设置
	SettingKeyRegistrationEnabled              = "registration_enabled"
	SettingKeyEmailVerifyEnabled               = "email_verify_enabled"
	SettingKeyRegistrationEmailSuffixWhitelist = "registration_email_suffix_whitelist"
	SettingKeyPromoCodeEnabled                 = "promo_code_enabled"
	SettingKeyPasswordResetEnabled             = "password_reset_enabled"
	SettingKeyFrontendURL                      = "frontend_url"
	SettingKeyInvitationCodeEnabled            = "invitation_code_enabled"

	// 邮件服务设置
	SettingKeySMTPHost     = "smtp_host"
	SettingKeySMTPPort     = "smtp_port"
	SettingKeySMTPUsername = "smtp_username"
	SettingKeySMTPPassword = "smtp_password"
	SettingKeySMTPFrom     = "smtp_from"
	SettingKeySMTPFromName = "smtp_from_name"
	SettingKeySMTPUseTLS   = "smtp_use_tls"

	// Cloudflare Turnstile 设置
	SettingKeyTurnstileEnabled   = "turnstile_enabled"
	SettingKeyTurnstileSiteKey   = "turnstile_site_key"
	SettingKeyTurnstileSecretKey = "turnstile_secret_key"

	// TOTP 双因素认证设置
	SettingKeyTotpEnabled = "totp_enabled"

	// LinuxDo Connect OAuth 登录设置
	SettingKeyLinuxDoConnectEnabled      = "linuxdo_connect_enabled"
	SettingKeyLinuxDoConnectClientID     = "linuxdo_connect_client_id"
	SettingKeyLinuxDoConnectClientSecret = "linuxdo_connect_client_secret"
	SettingKeyLinuxDoConnectRedirectURL  = "linuxdo_connect_redirect_url"

	// OEM设置
	SettingKeySiteName        = "site_name"
	SettingKeySiteLogo        = "site_logo"
	SettingKeySiteSubtitle    = "site_subtitle"
	SettingKeyAPIBaseURL      = "api_base_url"
	SettingKeyContactInfo     = "contact_info"
	SettingKeyDocURL          = "doc_url"
	SettingKeyHomeContent     = "home_content"
	SettingKeyCustomMenuItems = "custom_menu_items"
	SettingKeyCustomEndpoints = "custom_endpoints"

	// 默认配置
	SettingKeyDefaultConcurrency   = "default_concurrency"
	SettingKeyDefaultBalance       = "default_balance"
	SettingKeyDefaultSubscriptions = "default_subscriptions"

	// 管理员 API Key
	SettingKeyAdminAPIKey = "admin_api_key"

	// Backend 模式
	SettingKeyBackendModeEnabled = "backend_mode_enabled"

	// 支付系统设置
	SettingKeyPayOrderTimeoutMinutes    = "pay_order_timeout_minutes"
	SettingKeyPayMinRechargeAmount      = "pay_min_recharge_amount"
	SettingKeyPayMaxRechargeAmount      = "pay_max_recharge_amount"
	SettingKeyPayMaxDailyRechargeAmount = "pay_max_daily_recharge_amount"
	SettingKeyPayProductName            = "pay_product_name"
	SettingKeyPayProviders              = "pay_providers"
	SettingKeyPayHelpImageURL           = "pay_help_image_url"
	SettingKeyPayHelpText               = "pay_help_text"
	SettingKeyPayMaxDailyAmountAlipay   = "pay_max_daily_amount_alipay"
	SettingKeyPayMaxDailyAmountWxpay    = "pay_max_daily_amount_wxpay"
	SettingKeyPayMaxDailyAmountStripe   = "pay_max_daily_amount_stripe"
	SettingKeyPayGracePeriodMinutes     = "pay_grace_period_minutes"

	// Cancel rate limiting settings
	SettingKeyPayCancelRateLimitEnabled    = "pay_cancel_rate_limit_enabled"
	SettingKeyPayCancelRateLimitWindow     = "pay_cancel_rate_limit_window"
	SettingKeyPayCancelRateLimitUnit       = "pay_cancel_rate_limit_unit"
	SettingKeyPayCancelRateLimitMax        = "pay_cancel_rate_limit_max"
	SettingKeyPayCancelRateLimitWindowMode = "pay_cancel_rate_limit_window_mode"
)

// AdminAPIKeyPrefix is the prefix for admin API keys
const AdminAPIKeyPrefix = "admin-"
