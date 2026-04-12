-- SaaS 重构：清理 AI 网关相关表和字段
-- 对已有数据库执行，新数据库无需此迁移（这些表从未创建）

-- 1. 删除 AI 网关核心表
DROP TABLE IF EXISTS account_groups CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;
DROP TABLE IF EXISTS usage_logs CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS proxies CASCADE;

-- 2. 删除 Sora 相关表
DROP TABLE IF EXISTS sora_generations CASCADE;
DROP TABLE IF EXISTS sora_accounts CASCADE;

-- 3. 删除 Ops 监控表
DROP TABLE IF EXISTS ops_error_logs CASCADE;
DROP TABLE IF EXISTS ops_retry_attempts CASCADE;
DROP TABLE IF EXISTS ops_system_metrics CASCADE;
DROP TABLE IF EXISTS ops_job_heartbeats CASCADE;
DROP TABLE IF EXISTS ops_alert_rules CASCADE;
DROP TABLE IF EXISTS ops_alert_events CASCADE;
DROP TABLE IF EXISTS ops_alert_silences CASCADE;
DROP TABLE IF EXISTS ops_metrics_hourly CASCADE;
DROP TABLE IF EXISTS ops_metrics_daily CASCADE;
DROP TABLE IF EXISTS ops_system_logs CASCADE;
DROP TABLE IF EXISTS ops_system_log_cleanup_audit CASCADE;

-- 4. 删除 Usage 统计/清理表
DROP TABLE IF EXISTS usage_dashboard_hourly CASCADE;
DROP TABLE IF EXISTS usage_dashboard_daily CASCADE;
DROP TABLE IF EXISTS usage_dashboard_watermarks CASCADE;
DROP TABLE IF EXISTS usage_cleanup_tasks CASCADE;
DROP TABLE IF EXISTS usage_billing_dedup_archive CASCADE;
DROP TABLE IF EXISTS usage_billing_dedup CASCADE;
DROP TABLE IF EXISTS billing_usage_entries CASCADE;

-- 5. 删除其他 AI 相关表
DROP TABLE IF EXISTS scheduler_outbox CASCADE;
DROP TABLE IF EXISTS scheduled_test_results CASCADE;
DROP TABLE IF EXISTS scheduled_test_plans CASCADE;
DROP TABLE IF EXISTS error_passthrough_rules CASCADE;
DROP TABLE IF EXISTS tls_fingerprint_profiles CASCADE;

-- 6. 清理 groups 表上的 AI 字段（IF EXISTS 保证幂等）
ALTER TABLE groups DROP COLUMN IF EXISTS platform;
ALTER TABLE groups DROP COLUMN IF EXISTS image_price_360;
ALTER TABLE groups DROP COLUMN IF EXISTS image_price_540;
ALTER TABLE groups DROP COLUMN IF EXISTS image_price_1k;
ALTER TABLE groups DROP COLUMN IF EXISTS image_price_2k;
ALTER TABLE groups DROP COLUMN IF EXISTS sora_image_price_360;
ALTER TABLE groups DROP COLUMN IF EXISTS sora_image_price_540;
ALTER TABLE groups DROP COLUMN IF EXISTS sora_video_price_per_request;
ALTER TABLE groups DROP COLUMN IF EXISTS sora_video_price_per_request_hd;
ALTER TABLE groups DROP COLUMN IF EXISTS sora_storage_quota_bytes;
ALTER TABLE groups DROP COLUMN IF EXISTS claude_code_only;
ALTER TABLE groups DROP COLUMN IF EXISTS fallback_group_id;
ALTER TABLE groups DROP COLUMN IF EXISTS fallback_group_id_on_invalid_request;
ALTER TABLE groups DROP COLUMN IF EXISTS model_routing;
ALTER TABLE groups DROP COLUMN IF EXISTS model_routing_enabled;
ALTER TABLE groups DROP COLUMN IF EXISTS model_pricing;
ALTER TABLE groups DROP COLUMN IF EXISTS mcp_xml_inject;
ALTER TABLE groups DROP COLUMN IF EXISTS supported_model_scopes;
ALTER TABLE groups DROP COLUMN IF EXISTS allow_messages_dispatch;
ALTER TABLE groups DROP COLUMN IF EXISTS default_mapped_model;
ALTER TABLE groups DROP COLUMN IF EXISTS require_oauth_only;
ALTER TABLE groups DROP COLUMN IF EXISTS require_privacy_set;

-- 7. 清理 users 表上的 AI 字段
ALTER TABLE users DROP COLUMN IF EXISTS sora_storage_quota_bytes;
ALTER TABLE users DROP COLUMN IF EXISTS sora_storage_used_bytes;
ALTER TABLE users DROP COLUMN IF EXISTS allowed_groups;
ALTER TABLE users DROP COLUMN IF EXISTS wechat;

-- 8. 清理孤儿 schema_migrations 记录（可选，不影响运行）
DELETE FROM schema_migrations WHERE filename IN (
    '002_account_type_migration.sql',
    '009_fix_usage_logs_cache_columns.sql',
    '010_add_usage_logs_aggregated_indexes.sql',
    '020_add_temp_unschedulable.sql',
    '024_add_gemini_tier_id.sql',
    '026_ops_metrics_aggregation_tables.sql',
    '027_usage_billing_consistency.sql',
    '028_add_account_notes.sql',
    '028_add_usage_logs_user_agent.sql',
    '028_group_image_pricing.sql',
    '029_add_group_claude_code_restriction.sql',
    '029_usage_log_image_fields.sql',
    '030_add_account_expires_at.sql',
    '031_add_ip_address.sql',
    '032_add_api_key_ip_restriction.sql',
    '033_ops_monitoring_vnext.sql',
    '034_ops_upstream_error_events.sql',
    '034_usage_dashboard_aggregation_tables.sql',
    '035_usage_logs_partitioning.sql',
    '036_ops_error_logs_add_is_count_tokens.sql',
    '036_scheduler_outbox.sql',
    '037_add_account_rate_multiplier.sql',
    '037_ops_alert_silences.sql',
    '038_ops_errors_resolution_retry_results_and_standardize_classification.sql',
    '039_ops_job_heartbeats_add_last_result.sql',
    '040_add_group_model_routing.sql',
    '041_add_model_routing_enabled.sql',
    '042_add_usage_cleanup_tasks.sql',
    '042b_add_ops_system_metrics_switch_count.sql',
    '043_add_usage_cleanup_cancel_audit.sql',
    '043b_add_group_invalid_request_fallback.sql',
    '044b_add_group_mcp_xml_inject.sql',
    '045_add_accounts_extra_index.sql',
    '045_add_api_key_quota.sql',
    '046_add_sora_accounts.sql',
    '046_add_usage_log_reasoning_effort.sql',
    '046b_add_group_supported_model_scopes.sql',
    '047_add_sora_pricing_and_media_type.sql',
    '048_add_error_passthrough_rules.sql',
    '049_unify_antigravity_model_mapping.sql',
    '050_map_opus46_to_opus45.sql',
    '051_migrate_opus45_to_opus46_thinking.sql',
    '052_migrate_upstream_to_apikey.sql',
    '053_add_skip_monitoring_to_error_passthrough.sql',
    '054_drop_legacy_cache_columns.sql',
    '054_ops_system_logs.sql',
    '055_add_cache_ttl_overridden.sql',
    '056_add_api_key_last_used_at.sql',
    '058_add_sonnet46_to_model_mapping.sql',
    '059_add_gemini31_pro_to_model_mapping.sql',
    '060_add_gemini31_flash_image_to_model_mapping.sql',
    '060_add_usage_log_openai_ws_mode.sql',
    '061_add_usage_log_request_type.sql',
    '062_add_scheduler_and_usage_composite_indexes_notx.sql',
    '063_add_sora_client_tables.sql',
    '064_add_api_key_rate_limits.sql',
    '066_add_scheduled_test_tables.sql',
    '067_add_account_load_factor.sql',
    '069_add_group_messages_dispatch.sql',
    '070_add_scheduled_test_auto_recover.sql',
    '070_add_usage_log_service_tier.sql',
    '071_add_gemini25_flash_image_to_model_mapping.sql',
    '071_add_usage_billing_dedup.sql',
    '072_add_usage_billing_dedup_created_at_brin_notx.sql',
    '073_add_usage_billing_dedup_archive.sql',
    '074_add_usage_log_endpoints.sql',
    '075_add_usage_log_upstream_model.sql',
    '075_map_haiku45_to_sonnet46.sql',
    '076_add_usage_log_upstream_model_index_notx.sql',
    '077_add_usage_log_requested_model.sql',
    '078_add_usage_log_requested_model_index_notx.sql',
    '079_ops_error_logs_add_endpoint_fields.sql',
    '080_create_tls_fingerprint_profiles.sql',
    '081_add_group_account_filter.sql',
    '082_add_group_model_pricing.sql',
    '083_add_usage_log_upstream_cost.sql',
    '084_add_dashboard_upstream_cost.sql'
);
