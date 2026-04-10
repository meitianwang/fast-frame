/**
 * Shared payment utilities
 */

import type { Composer } from 'vue-i18n'

/**
 * Format ISO date string to a consistent locale string.
 * Uses explicit options so the output is stable across browsers.
 */
export function formatPaymentDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

/**
 * Get Tailwind badge class for payment order status
 */
export function getPaymentStatusBadgeClass(status: string): string {
  if (status === 'completed')
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (status === 'pending')
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  if (status === 'paid' || status === 'recharging')
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (status === 'failed' || status === 'refund_failed')
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  if (
    status === 'refunded' ||
    status === 'partially_refunded' ||
    status === 'refund_requested' ||
    status === 'refunding'
  )
    return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
}

/**
 * Get payment method display label via i18n
 */
export function getPaymentMethodLabel(type: string, t: Composer['t']): string {
  if (type.includes('easypay')) return t('payment.easypay')
  if (type.includes('alipay')) return t('payment.alipay')
  if (type.includes('wxpay') || type.includes('wechat')) return t('payment.wechatPay')
  if (type.includes('stripe')) return 'Stripe'
  return type
}

/**
 * Get payment icon type from payment type string
 */
export function getPaymentIconType(type: string): string {
  if (type.includes('easypay')) return 'easypay'
  if (type.includes('alipay')) return 'alipay'
  if (type.includes('wxpay') || type.includes('wechat')) return 'wxpay'
  if (type.includes('stripe')) return 'stripe'
  return type
}

/**
 * Get payment button class for a given payment type
 */
export function getPaymentButtonClass(type: string): string {
  const iconType = getPaymentIconType(type)
  if (iconType === 'easypay') return 'bg-[#ff6600] hover:bg-[#e55c00]'
  if (iconType === 'alipay') return 'bg-[#00AEEF] hover:bg-[#009ad6]'
  if (iconType === 'wxpay') return 'bg-[#07C160] hover:bg-[#06ae56]'
  if (iconType === 'stripe') return 'bg-[#635bff] hover:bg-[#5851db]'
  return 'bg-blue-600 hover:bg-blue-700'
}

/**
 * Format subscription plan period label
 */
export function formatPeriodLabel(
  validityDays: number,
  validityUnit: string,
  t: Composer['t']
): string {
  const unit = validityUnit || 'day'
  if (unit === 'month') {
    if (validityDays === 1) return t('payment.plan.monthly')
    return `${validityDays} ${t('payment.plan.months')}`
  }
  if (unit === 'week') {
    if (validityDays === 1) return t('payment.plan.weekly')
    return `${validityDays} ${t('payment.plan.weeks')}`
  }
  return `${validityDays} ${t('payment.plan.days')}`
}

/**
 * Format subscription plan period suffix (e.g. "/month")
 */
export function formatPeriodSuffix(
  validityDays: number,
  validityUnit: string,
  t: Composer['t']
): string {
  const unit = validityUnit || 'day'
  if (unit === 'month') return `/${t('payment.plan.month')}`
  if (unit === 'week') return `/${t('payment.plan.week')}`
  return `/${validityDays}${t('payment.plan.day')}`
}

/**
 * Get payment method selected-state class (for method selector buttons)
 */
export function getPaymentSelectedClass(type: string): string {
  const iconType = getPaymentIconType(type)
  if (iconType === 'easypay') return 'border-[#ff6600] bg-orange-50 dark:bg-orange-950 text-slate-900 dark:text-slate-100 shadow-sm'
  if (iconType === 'alipay') return 'border-[#00AEEF] bg-blue-50 dark:bg-blue-950 text-slate-900 dark:text-slate-100 shadow-sm'
  if (iconType === 'wxpay') return 'border-[#07C160] bg-green-50 dark:bg-green-950 text-slate-900 dark:text-slate-100 shadow-sm'
  if (iconType === 'stripe') return 'border-[#635bff] bg-indigo-50 dark:bg-indigo-950 text-slate-900 dark:text-slate-100 shadow-sm'
  return 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-slate-900 dark:text-slate-100 shadow-sm'
}

/**
 * Get payment method radio border class (for subscription confirm radio buttons)
 */
export function getPaymentRadioBorderClass(type: string): string {
  const iconType = getPaymentIconType(type)
  if (iconType === 'easypay') return 'border-[#ff6600]'
  if (iconType === 'alipay') return 'border-[#00AEEF]'
  if (iconType === 'wxpay') return 'border-[#07C160]'
  if (iconType === 'stripe') return 'border-[#635bff]'
  return 'border-emerald-500'
}

/**
 * Get payment method brand color hex
 */
export function getPaymentBrandColor(type: string): string {
  const iconType = getPaymentIconType(type)
  if (iconType === 'easypay') return '#ff6600'
  if (iconType === 'alipay') return '#00AEEF'
  if (iconType === 'wxpay') return '#07C160'
  if (iconType === 'stripe') return '#635bff'
  return '#10b981'
}

/**
 * Get payment method confirm-selected bg class
 */
export function getPaymentConfirmSelectedClass(type: string): string {
  const iconType = getPaymentIconType(type)
  if (iconType === 'easypay') return 'border-[#ff6600] bg-orange-50/50 dark:bg-orange-950/30 ring-1 ring-current/20'
  if (iconType === 'alipay') return 'border-[#00AEEF] bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-current/20'
  if (iconType === 'wxpay') return 'border-[#07C160] bg-green-50/50 dark:bg-green-950/30 ring-1 ring-current/20'
  if (iconType === 'stripe') return 'border-[#635bff] bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-current/20'
  return 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-current/20'
}

/**
 * Validate a URL is safe for payment redirect.
 * Only checks protocol (http/https) and absence of embedded credentials.
 * Domain is NOT restricted because EasyPay and other aggregators use
 * arbitrary third-party domains that cannot be enumerated.
 * The pay_url is always sourced from our own backend, which already
 * validates provider responses.
 */
export function isSafePaymentUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    if (parsed.username || parsed.password) return false
    return true
  } catch {
    return false
  }
}

/** Amount input validation pattern: digits with up to 2 decimal places */
export const AMOUNT_TEXT_PATTERN = /^\d*(\.\d{0,2})?$/

/**
 * Detect if the current device is mobile.
 * Uses navigator.userAgentData if available, falls back to UA string and touch detection.
 */
export function detectDeviceIsMobile(): boolean {
  if ((navigator as any).userAgentData?.mobile) return true
  const ua = navigator.userAgent
  if (/Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true
  // Touch capability + small screen as fallback
  if ('ontouchstart' in window && window.innerWidth < 768) return true
  return false
}

/**
 * Check if a payment type is a redirect-based payment (no QR, just redirect)
 */
export function isRedirectPayment(type: string): boolean {
  return type === 'alipay_direct'
}
