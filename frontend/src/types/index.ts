/**
 * Core Type Definitions for Sub2API Frontend
 */

// ==================== Common Types ====================

export interface SelectOption {
  value: string | number | boolean | null
  label: string
  [key: string]: any // Support extra properties for custom templates
}

export interface BasePaginationResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface FetchOptions {
  signal?: AbortSignal
}

// ==================== User & Auth Types ====================

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user' // User role for authorization
  balance: number // User balance for API usage
  concurrency: number // Allowed concurrent requests
  status: 'active' | 'disabled' // Account status
  allowed_groups: number[] | null // Allowed group IDs (null = all non-exclusive groups)
  subscriptions?: UserSubscription[] // User's active subscriptions
  created_at: string
  updated_at: string
}

export interface AdminUser extends User {
  // 管理员备注（普通用户接口不返回）
  notes: string
  // 用户专属分组倍率配置 (group_id -> rate_multiplier)
  group_rates?: Record<number, number>
  // 当前并发数（仅管理员列表接口返回）
  current_concurrency?: number
}

export interface LoginRequest {
  email: string
  password: string
  turnstile_token?: string
}

export interface RegisterRequest {
  email: string
  password: string
  verify_code?: string
  turnstile_token?: string
  promo_code?: string
  invitation_code?: string
}

export interface SendVerifyCodeRequest {
  email: string
  turnstile_token?: string
}

export interface SendVerifyCodeResponse {
  message: string
  countdown: number
}

export interface CustomMenuItem {
  id: string
  label: string
  icon_svg: string
  url: string
  visibility: 'user' | 'admin'
  sort_order: number
}

export interface CustomEndpoint {
  name: string
  endpoint: string
  description: string
}

export interface PublicSettings {
  registration_enabled: boolean
  email_verify_enabled: boolean
  registration_email_suffix_whitelist: string[]
  promo_code_enabled: boolean
  password_reset_enabled: boolean
  invitation_code_enabled: boolean
  turnstile_enabled: boolean
  turnstile_site_key: string
  site_name: string
  site_logo: string
  site_subtitle: string
  api_base_url: string
  contact_info: string
  doc_url: string
  home_content: string
  hide_ccs_import_button: boolean
  custom_menu_items: CustomMenuItem[]
  custom_endpoints: CustomEndpoint[]
  linuxdo_oauth_enabled: boolean
  backend_mode_enabled: boolean
  version: string
}

export interface AuthResponse {
  access_token: string
  refresh_token?: string  // New: Refresh Token for token renewal
  expires_in?: number     // New: Access Token expiry time in seconds
  token_type: string
  user: User & { run_mode?: 'standard' | 'simple' }
}

export interface CurrentUserResponse extends User {
  run_mode?: 'standard' | 'simple'
}

// ==================== Announcement Types ====================

export type AnnouncementStatus = 'draft' | 'active' | 'archived'
export type AnnouncementNotifyMode = 'silent' | 'popup'

export type AnnouncementConditionType = 'subscription' | 'balance'

export type AnnouncementOperator = 'in' | 'gt' | 'gte' | 'lt' | 'lte' | 'eq'

export interface AnnouncementCondition {
  type: AnnouncementConditionType
  operator: AnnouncementOperator
  group_ids?: number[]
  value?: number
}

export interface AnnouncementConditionGroup {
  all_of?: AnnouncementCondition[]
}

export interface AnnouncementTargeting {
  any_of?: AnnouncementConditionGroup[]
}

export interface Announcement {
  id: number
  title: string
  content: string
  status: AnnouncementStatus
  notify_mode: AnnouncementNotifyMode
  targeting: AnnouncementTargeting
  starts_at?: string
  ends_at?: string
  created_by?: number
  updated_by?: number
  created_at: string
  updated_at: string
}

export interface UserAnnouncement {
  id: number
  title: string
  content: string
  notify_mode: AnnouncementNotifyMode
  starts_at?: string
  ends_at?: string
  read_at?: string
  created_at: string
  updated_at: string
}

export interface CreateAnnouncementRequest {
  title: string
  content: string
  status?: AnnouncementStatus
  notify_mode?: AnnouncementNotifyMode
  targeting: AnnouncementTargeting
  starts_at?: number
  ends_at?: number
}

export interface UpdateAnnouncementRequest {
  title?: string
  content?: string
  status?: AnnouncementStatus
  notify_mode?: AnnouncementNotifyMode
  targeting?: AnnouncementTargeting
  starts_at?: number
  ends_at?: number
}

export interface AnnouncementUserReadStatus {
  user_id: number
  email: string
  username: string
  balance: number
  eligible: boolean
  read_at?: string
}

// ==================== Statistics Types ====================

// ==================== API Response Types ====================

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface ApiError {
  detail: string
  code?: string
  field?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

// ==================== UI State Types ====================

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  title?: string
  duration?: number // in milliseconds, undefined means no auto-dismiss
  startTime?: number // timestamp when toast was created, for progress bar
}

export interface AppState {
  sidebarCollapsed: boolean
  loading: boolean
  toasts: Toast[]
}

// ==================== Validation Types ====================

export interface ValidationError {
  field: string
  message: string
}

// ==================== Table/List Types ====================

export interface SortConfig {
  key: string
  order: 'asc' | 'desc'
}

export interface FilterConfig {
  [key: string]: string | number | boolean | null | undefined
}

export interface PaginationConfig {
  page: number
  page_size: number
}

// ==================== API Key & Group Types ====================

export type GroupPlatform = string

export type SubscriptionType = 'standard' | 'subscription'

export interface Group {
  id: number
  name: string
  description: string | null
  platform: GroupPlatform
  rate_multiplier: number
  is_exclusive: boolean
  status: 'active' | 'inactive'
  subscription_type: SubscriptionType
  daily_limit_usd: number | null
  weekly_limit_usd: number | null
  monthly_limit_usd: number | null
  created_at: string
  updated_at: string
}

export interface AdminGroup extends Group {
  sort_order: number
}

export interface ApiKey {
  id: number
  user_id: number
  key: string
  name: string
  group_id: number | null
  status: 'active' | 'inactive' | 'quota_exhausted' | 'expired'
  ip_whitelist: string[]
  ip_blacklist: string[]
  last_used_at: string | null
  quota: number // Quota limit in USD (0 = unlimited)
  quota_used: number // Used quota amount in USD
  expires_at: string | null // Expiration time (null = never expires)
  created_at: string
  updated_at: string
  group?: Group
  rate_limit_5h: number
  rate_limit_1d: number
  rate_limit_7d: number
  usage_5h: number
  usage_1d: number
  usage_7d: number
  window_5h_start: string | null
  window_1d_start: string | null
  window_7d_start: string | null
  reset_5h_at: string | null
  reset_1d_at: string | null
  reset_7d_at: string | null
}

export interface CreateApiKeyRequest {
  name: string
  group_id?: number | null
  custom_key?: string // Optional custom API Key
  ip_whitelist?: string[]
  ip_blacklist?: string[]
  quota?: number // Quota limit in USD (0 = unlimited)
  expires_in_days?: number // Days until expiry (null = never expires)
  rate_limit_5h?: number
  rate_limit_1d?: number
  rate_limit_7d?: number
}

export interface UpdateApiKeyRequest {
  name?: string
  group_id?: number | null
  status?: 'active' | 'inactive'
  ip_whitelist?: string[]
  ip_blacklist?: string[]
  quota?: number // Quota limit in USD (null = no change, 0 = unlimited)
  expires_at?: string | null // Expiration time (null = no change)
  reset_quota?: boolean // Reset quota_used to 0
  rate_limit_5h?: number
  rate_limit_1d?: number
  rate_limit_7d?: number
  reset_rate_limit_usage?: boolean
}

export interface CreateGroupRequest {
  name: string
  description?: string | null
  platform?: GroupPlatform
  rate_multiplier?: number
  is_exclusive?: boolean
  subscription_type?: SubscriptionType
  daily_limit_usd?: number | null
  weekly_limit_usd?: number | null
  monthly_limit_usd?: number | null
}

export interface UpdateGroupRequest {
  name?: string
  description?: string | null
  platform?: GroupPlatform
  rate_multiplier?: number
  is_exclusive?: boolean
  status?: 'active' | 'inactive'
  subscription_type?: SubscriptionType
  daily_limit_usd?: number | null
  weekly_limit_usd?: number | null
  monthly_limit_usd?: number | null
}

// ==================== Admin User Management ====================

export interface UpdateUserRequest {
  email?: string
  password?: string
  username?: string
  notes?: string
  role?: 'admin' | 'user'
  balance?: number
  concurrency?: number
  status?: 'active' | 'disabled'
  allowed_groups?: number[] | null
  // 用户专属分组倍率配置 (group_id -> rate_multiplier | null)
  // null 表示删除该分组的专属倍率
  group_rates?: Record<number, number | null>
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

// ==================== User Subscription Types ====================

export interface UserSubscription {
  id: number
  user_id: number
  group_id: number
  status: 'active' | 'expired' | 'revoked'
  daily_usage_usd: number
  weekly_usage_usd: number
  monthly_usage_usd: number
  daily_window_start: string | null
  weekly_window_start: string | null
  monthly_window_start: string | null
  created_at: string
  updated_at: string
  expires_at: string | null
  user?: User
  group?: Group
}

export interface SubscriptionProgress {
  subscription_id: number
  daily: {
    used: number
    limit: number | null
    percentage: number
    reset_in_seconds: number | null
  } | null
  weekly: {
    used: number
    limit: number | null
    percentage: number
    reset_in_seconds: number | null
  } | null
  monthly: {
    used: number
    limit: number | null
    percentage: number
    reset_in_seconds: number | null
  } | null
  expires_at: string | null
  days_remaining: number | null
}

export interface AssignSubscriptionRequest {
  user_id: number
  group_id: number
  validity_days?: number
}

export interface BulkAssignSubscriptionRequest {
  user_ids: number[]
  group_id: number
  validity_days?: number
}

export interface ExtendSubscriptionRequest {
  days: number
}


// ==================== Redeem Types ====================

export type RedeemCodeType = 'balance' | 'concurrency' | 'subscription' | 'invitation'

export interface RedeemCode {
  id: number
  code: string
  type: RedeemCodeType
  value: number
  status: 'active' | 'used' | 'expired' | 'unused'
  used_by: number | null
  used_at: string | null
  created_at: string
  updated_at?: string
  group_id?: number | null
  validity_days?: number
  user?: User
  group?: Group
}

export interface GenerateRedeemCodesRequest {
  count: number
  type: RedeemCodeType
  value: number
  group_id?: number | null
  validity_days?: number
}

export interface RedeemCodeRequest {
  code: string
}

// ==================== Dashboard & Statistics ====================

export interface DashboardStats {
  total_users: number
  today_new_users: number
  active_users: number
  hourly_active_users: number
  stats_updated_at: string
  stats_stale: boolean
  total_api_keys: number
  active_api_keys: number
  total_requests: number
  total_cost: number
  total_actual_cost: number
  today_requests: number
  today_cost: number
  today_actual_cost: number
  uptime: number
}

export interface TrendDataPoint {
  date: string
  requests: number
  cost: number
  actual_cost: number
}

export interface ModelStat {
  model: string
  requests: number
  cost: number
  actual_cost: number
}

export interface GroupStat {
  group_id: number
  group_name: string
  requests: number
  total_tokens: number
  cost: number
  actual_cost: number
}

export interface UserBreakdownItem {
  user_id: number
  email: string
  requests: number
  total_tokens: number
  cost: number
  actual_cost: number
}

export interface UserUsageTrendPoint {
  date: string
  user_id: number
  email: string
  username: string
  requests: number
  tokens: number
  cost: number
  actual_cost: number
}

export interface UserSpendingRankingItem {
  user_id: number
  email: string
  actual_cost: number
  requests: number
  tokens: number
}

export interface UserSpendingRankingResponse {
  ranking: UserSpendingRankingItem[]
  total_actual_cost: number
  total_requests: number
  total_tokens: number
  start_date: string
  end_date: string
}

export interface ApiKeyUsageTrendPoint {
  date: string
  api_key_id: number
  key_name: string
  requests: number
  tokens: number
}

// ==================== Query Parameters ====================

// ==================== User Attribute Types ====================

export type UserAttributeType = 'text' | 'textarea' | 'number' | 'email' | 'url' | 'date' | 'select' | 'multi_select'

export interface UserAttributeOption {
  value: string
  label: string
  [key: string]: unknown
}

export interface UserAttributeValidation {
  min_length?: number
  max_length?: number
  min?: number
  max?: number
  pattern?: string
  message?: string
}

export interface UserAttributeDefinition {
  id: number
  key: string
  name: string
  description: string
  type: UserAttributeType
  options: UserAttributeOption[]
  required: boolean
  validation: UserAttributeValidation
  placeholder: string
  display_order: number
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface UserAttributeValue {
  id: number
  user_id: number
  attribute_id: number
  value: string
  created_at: string
  updated_at: string
}

export interface CreateUserAttributeRequest {
  key: string
  name: string
  description?: string
  type: UserAttributeType
  options?: UserAttributeOption[]
  required?: boolean
  validation?: UserAttributeValidation
  placeholder?: string
  display_order?: number
  enabled?: boolean
}

export interface UpdateUserAttributeRequest {
  key?: string
  name?: string
  description?: string
  type?: UserAttributeType
  options?: UserAttributeOption[]
  required?: boolean
  validation?: UserAttributeValidation
  placeholder?: string
  display_order?: number
  enabled?: boolean
}

export interface UserAttributeValuesMap {
  [attributeId: number]: string
}

// ==================== Promo Code Types ====================

export interface PromoCode {
  id: number
  code: string
  bonus_amount: number
  max_uses: number
  used_count: number
  status: 'active' | 'disabled'
  expires_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PromoCodeUsage {
  id: number
  promo_code_id: number
  user_id: number
  bonus_amount: number
  used_at: string
  user?: User
}

export interface CreatePromoCodeRequest {
  code?: string
  bonus_amount: number
  max_uses?: number
  expires_at?: number | null
  notes?: string
}

export interface UpdatePromoCodeRequest {
  code?: string
  bonus_amount?: number
  max_uses?: number
  status?: 'active' | 'disabled'
  expires_at?: number | null
  notes?: string
}

// ==================== TOTP (2FA) Types ====================

export interface TotpStatus {
  enabled: boolean
  enabled_at: number | null  // Unix timestamp in seconds
  feature_enabled: boolean
}

export interface TotpSetupRequest {
  email_code?: string
  password?: string
}

export interface TotpSetupResponse {
  secret: string
  qr_code_url: string
  setup_token: string
  countdown: number
}

export interface TotpEnableRequest {
  totp_code: string
  setup_token: string
}

export interface TotpEnableResponse {
  success: boolean
}

export interface TotpDisableRequest {
  email_code?: string
  password?: string
}

export interface TotpVerificationMethod {
  method: 'email' | 'password'
}

export interface TotpLoginResponse {
  requires_2fa: boolean
  temp_token?: string
  user_email_masked?: string
}

export interface TotpLogin2FARequest {
  temp_token: string
  totp_code: string
}

// ==================== Payment Types ====================

export interface UserPaymentOrder {
  id: number
  amount: string
  pay_amount?: string
  fee_rate?: string
  status: string
  payment_type: string
  order_type: string
  plan_id?: number
  subscription_group_id?: number
  subscription_days?: number
  refund_amount?: string
  refund_reason?: string
  refund_at?: string
  refund_requested_at?: string
  refund_request_reason?: string
  failed_reason?: string
  expires_at: string
  paid_at?: string
  completed_at?: string
  created_at: string
}

export interface CreateOrderRequest {
  amount: string
  payment_type: string
  order_type?: string
  plan_id?: number
  return_url?: string
  is_mobile?: boolean
  src_host?: string
  src_url?: string
}

export interface CreateOrderResponse {
  order_id: number
  amount: string
  pay_amount: string
  fee_rate: string
  status: string
  payment_type: string
  order_type: string
  pay_url?: string
  qr_code?: string
  client_secret?: string
  expires_at: string
  access_token?: string
}

export interface PaymentConfig {
  enabled_payment_types: string[]
  min_recharge_amount: string
  max_recharge_amount: string
  max_daily_recharge_amount: string
  balance_payment_disabled: boolean
  max_pending_orders: number
  pending_count: number
  method_limits: MethodLimit[]
  help_image_url?: string
  help_text?: string
  stripe_publishable_key?: string
}

export interface MethodLimit {
  payment_type: string
  available: boolean
  daily_limit: string
  daily_used: string
  remaining: string
  single_min: string
  single_max: string
  fee_rate: string
}

export interface PaymentChannel {
  id: number
  group_id?: number
  name: string
  platform: string
  rate_multiplier: string
  description?: string
  models?: string
  features?: string
  sort_order: number
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface PaymentSubscriptionPlan {
  id: number
  group_id?: number
  name: string
  description?: string
  price: string
  original_price?: string
  validity_days: number
  validity_unit: string
  features?: string
  product_name?: string
  platform?: string
  for_sale: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AdminPaymentOrder extends UserPaymentOrder {
  user_id: number
  user_email?: string
  user_name?: string
  recharge_code: string
  payment_trade_no?: string
  provider_instance_id?: number
  src_host?: string
  updated_at: string
}

export interface PaymentAuditLog {
  id: number
  order_id: number
  action: string
  detail?: string
  operator?: string
  created_at: string
}

export interface AdminOrderDetail {
  order: AdminPaymentOrder
  audit_logs: PaymentAuditLog[]
}

export interface PaymentDashboardData {
  today_amount: string
  today_order_count: number
  total_amount: string
  total_order_count: number
  daily_series: Array<{ date: string; amount: string; count: number }>
  payment_methods: Array<{ payment_type: string; amount: string; count: number; success_count: number; success_rate: number }>
  leaderboard?: Array<{ user_id: number; user_email?: string; amount: string; count: number }>
}

export interface PaymentProviderInstance {
  id: number
  provider_key: string
  name: string
  config: Record<string, string>
  supported_types: string
  enabled: boolean
  sort_order: number
  limits?: Record<string, { daily_limit?: string; single_min?: string; single_max?: string }>
  refund_enabled: boolean
  created_at: string
  updated_at: string
}
