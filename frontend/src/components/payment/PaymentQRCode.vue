<template>
  <!-- Cancel Blocked State -->
  <div v-if="cancelBlocked" class="flex flex-col items-center space-y-4 py-8">
    <div class="text-6xl text-green-600 dark:text-green-400">✓</div>
    <h2 class="text-xl font-bold text-green-600 dark:text-green-400">{{ t('payment.qr.paid') }}</h2>
    <p class="text-center text-sm text-gray-500 dark:text-slate-400">{{ t('payment.qr.paidCancelBlocked') }}</p>
    <button
      @click="emit('back')"
      class="mt-4 w-full rounded-lg py-3 font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600/90 dark:hover:bg-blue-600"
    >
      {{ t('payment.qr.backToRecharge') }}
    </button>
  </div>

  <!-- Main Payment View -->
  <div v-else class="flex flex-col items-center space-y-4">
    <!-- Amount Display -->
    <div class="text-center">
      <div class="text-4xl font-bold text-blue-600 dark:text-blue-400">¥{{ displayAmount.toFixed(2) }}</div>
      <div v-if="hasFeeDiff" class="mt-1 text-sm text-gray-500 dark:text-slate-400">
        {{ t('payment.qr.credited') }}¥{{ amount.toFixed(2) }}
      </div>
      <div
        class="mt-1 text-sm"
        :class="expired ? 'text-red-500' : timeLeftSeconds <= 60 ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-slate-400'"
      >
        {{ expired ? t('payment.qr.expired') : `${t('payment.qr.remaining')}: ${timeLeft}` }}
      </div>
    </div>

    <!-- Poll failure warning -->
    <div v-if="pollFailed && !expired" class="w-full rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-center dark:border-yellow-700 dark:bg-yellow-900/30">
      <p class="text-sm text-yellow-700 dark:text-yellow-400">{{ t('payment.qr.pollFailed') }}</p>
      <button
        @click="retryPolling"
        class="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {{ t('payment.qr.pollRetry') }}
      </button>
    </div>

    <!-- Payment Content (when not expired) -->
    <template v-if="!expired">
      <!-- Auto Redirect (mobile/H5) -->
      <template v-if="shouldAutoRedirect">
        <div class="flex items-center justify-center py-6">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span class="ml-3 text-sm text-gray-500 dark:text-slate-400">
            {{ t('payment.qr.redirecting', { channel: channelLabel }) }}
          </span>
        </div>
        <a
          :href="payUrl!"
          target="_self"
          rel="noopener noreferrer"
          class="flex w-full items-center justify-center gap-2 rounded-lg py-3 font-medium text-white shadow-md"
          :class="getPaymentButtonClass(paymentType)"
        >
          {{ redirected ? t('payment.qr.notRedirected', { channel: channelLabel }) : t('payment.qr.goto', { channel: channelLabel }) }}
        </a>
        <p class="text-center text-sm text-gray-500 dark:text-slate-400">{{ t('payment.qr.h5Hint') }}</p>
      </template>

      <!-- QR Code Display -->
      <template v-else-if="!isStripe">
        <div
          v-if="qrDataUrl"
          class="relative rounded-lg border p-4 border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-900"
        >
          <div v-if="imageLoading" class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/10">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
          <img :src="qrDataUrl" alt="payment qrcode" class="h-56 w-56 rounded" />
        </div>
        <div v-else class="text-center">
          <div class="rounded-lg border-2 border-dashed p-8 border-gray-300 dark:border-slate-700">
            <p v-if="qrError" class="text-sm text-red-500 dark:text-red-400">{{ t('payment.qr.qrFailed') }}</p>
            <p v-else class="text-sm text-gray-500 dark:text-slate-400">{{ t('payment.qr.scanPay') }}</p>
          </div>
        </div>
        <p class="text-center text-sm text-gray-500 dark:text-slate-400">
          {{ t('payment.qr.openScan', { channel: channelLabel }) }}
        </p>
      </template>

      <!-- Stripe Payment -->
      <template v-else>
        <div class="w-full max-w-md space-y-4">
          <div v-if="!clientSecret" class="rounded-lg border-2 border-dashed p-8 text-center border-gray-300 dark:border-slate-700">
            <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('payment.qr.initFailed') }}</p>
          </div>
          <template v-else>
            <div v-if="stripeLoading" class="flex items-center justify-center py-8">
              <div class="h-8 w-8 animate-spin rounded-full border-2 border-[#635bff] border-t-transparent" />
              <span class="ml-3 text-sm text-gray-500 dark:text-slate-400">{{ t('payment.qr.stripeLoading') }}</span>
            </div>
            <div v-else-if="stripeError" class="rounded-lg border-2 border-dashed p-8 text-center border-red-300 dark:border-red-700">
              <p class="text-sm text-red-500 dark:text-red-400">{{ stripeError }}</p>
              <button @click="initStripe" class="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                {{ t('payment.qr.stripeRetry') }}
              </button>
            </div>
            <div v-else>
              <div ref="stripeElementRef" class="rounded-lg border p-4 border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800" />
              <button
                @click="handleStripeSubmit"
                :disabled="stripeSubmitting"
                class="mt-4 w-full rounded-lg py-3 font-medium text-white bg-[#635bff] hover:bg-[#5851db] disabled:opacity-50"
              >
                {{ stripeSubmitting ? t('payment.processing') : t('payment.qr.stripePay') }}
              </button>
            </div>
          </template>
        </div>
      </template>
    </template>

    <!-- Action Buttons -->
    <div class="flex w-full gap-3">
      <button
        @click="emit('back')"
        class="flex-1 rounded-lg border py-2 text-sm border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {{ t('payment.qr.back') }}
      </button>
      <button
        v-if="!expired"
        @click="handleCancel"
        class="flex-1 rounded-lg border py-2 text-sm border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/30"
      >
        {{ t('payment.qr.cancelOrder') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
import { payAPI } from '@/api/pay'
import { getPaymentButtonClass, getPaymentMethodLabel, isSafePaymentUrl } from '@/utils/payment'

const TERMINAL_STATUSES = new Set(['completed', 'expired', 'cancelled', 'failed', 'refunded', 'refund_failed'])

const props = withDefaults(
  defineProps<{
    orderId: number
    payUrl?: string
    qrCode?: string
    clientSecret?: string
    paymentType: string
    amount: number
    payAmount?: number
    expiresAt: string
    isMobile?: boolean
    isEmbedded?: boolean
    accessToken?: string
  }>(),
  {
    isMobile: false,
    isEmbedded: false
  }
)

const emit = defineEmits<{
  statusChange: [status: string]
  back: []
  pollStopped: []
}>()

const { t } = useI18n()

// Timer constants
const TIMER_INTERVAL_MS = 1000
const POLL_INTERVAL_MS = 2000

const displayAmount = computed(() => props.payAmount ?? props.amount)
const hasFeeDiff = computed(() => props.payAmount !== undefined && props.payAmount !== props.amount)

const timeLeft = ref('')
const timeLeftSeconds = ref(Infinity)
const expired = ref(false)
const qrDataUrl = ref('')
const qrError = ref(false)
const imageLoading = ref(false)
const cancelBlocked = ref(false)
const redirected = ref(false)

const pollFailed = ref(false)

const stripeLoading = ref(false)
const stripeError = ref('')
const stripeSubmitting = ref(false)
const stripeElementRef = ref<HTMLDivElement | null>(null)
let stripeInstance: any = null
let stripeElements: any = null
let stripePaymentMethodListenerAdded = false

const isStripe = computed(() => props.paymentType?.includes('stripe'))
const shouldAutoRedirect = computed(
  () => !expired.value && !isStripe.value && !!props.payUrl && (props.isMobile || !props.qrCode)
)

const channelLabel = computed(() => getPaymentMethodLabel(props.paymentType || 'alipay', t))

// Auto redirect for mobile/H5
watch(shouldAutoRedirect, (val) => {
  if (val && !redirected.value && props.payUrl && isSafePaymentUrl(props.payUrl)) {
    redirected.value = true
    if (props.isEmbedded) {
      // In embedded (iframe) context, open in new tab to avoid replacing parent
      window.open(props.payUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.location.replace(props.payUrl)
    }
  }
}, { immediate: true })

// Generate QR code with cancellation support
let qrGeneration = 0
watch(
  () => props.qrCode,
  async (qrPayload) => {
    const gen = ++qrGeneration
    if (!qrPayload?.trim()) {
      qrDataUrl.value = ''
      return
    }
    imageLoading.value = true
    try {
      const url = await QRCode.toDataURL(qrPayload.trim(), {
        width: 224,
        margin: 1,
        errorCorrectionLevel: 'M'
      })
      if (gen === qrGeneration && !isUnmounted) {
        qrDataUrl.value = url
      }
    } catch (err: unknown) {
      console.warn('[PaymentQRCode] QR code generation failed:', err)
      if (gen === qrGeneration && !isUnmounted) {
        qrDataUrl.value = ''
        qrError.value = true
      }
    } finally {
      if (gen === qrGeneration && !isUnmounted) {
        imageLoading.value = false
      }
    }
  },
  { immediate: true }
)

// Timer countdown
let timerInterval: ReturnType<typeof setInterval> | null = null

function updateTimer() {
  const diff = new Date(props.expiresAt).getTime() - Date.now()
  if (diff <= 0) {
    timeLeft.value = t('payment.qr.expired')
    timeLeftSeconds.value = 0
    expired.value = true
    return
  }
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  timeLeft.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
  timeLeftSeconds.value = Math.floor(diff / 1000)
}

// Status polling with abort support
let pollInterval: ReturnType<typeof setInterval> | null = null
let pollAbort: AbortController | null = null
let isUnmounted = false
let consecutivePollFailures = 0
const MAX_POLL_FAILURES = 5

async function pollStatus() {
  if (isUnmounted) return
  pollAbort?.abort()
  pollAbort = new AbortController()
  try {
    const order = await payAPI.getOrder(props.orderId, { signal: pollAbort.signal })
    consecutivePollFailures = 0
    if (!isUnmounted && (order.paid_at || TERMINAL_STATUSES.has(order.status))) {
      emit('statusChange', order.status)
    }
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') return
    consecutivePollFailures++
    if (consecutivePollFailures >= MAX_POLL_FAILURES && pollInterval) {
      console.warn(`[PaymentQRCode] Polling stopped after ${MAX_POLL_FAILURES} consecutive failures`)
      clearInterval(pollInterval)
      pollInterval = null
      pollFailed.value = true
      emit('pollStopped')
    }
  }
}

function retryPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
  pollFailed.value = false
  consecutivePollFailures = 0
  pollStatus()
  pollInterval = setInterval(pollStatus, POLL_INTERVAL_MS)
}

function loadStripeJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Stripe) {
      resolve((window as any).Stripe)
      return
    }
    // Avoid duplicate script tags if already loading
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]')
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).Stripe), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Stripe.js')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.onload = () => resolve((window as any).Stripe)
    script.onerror = () => reject(new Error('Failed to load Stripe.js'))
    document.head.appendChild(script)
  })
}

async function initStripe() {
  if (!props.clientSecret) return
  stripeLoading.value = true
  stripeError.value = ''
  try {
    const Stripe = await loadStripeJs()
    const configResp = await payAPI.getConfig()
    const publishableKey = configResp.stripe_publishable_key
    if (!publishableKey) {
      stripeError.value = t('payment.qr.stripeNoKey')
      return
    }
    stripeInstance = Stripe(publishableKey)
    const isDark = document.documentElement.classList.contains('dark')
    stripeElements = stripeInstance.elements({
      clientSecret: props.clientSecret,
      appearance: {
        theme: isDark ? 'night' : 'stripe',
        variables: isDark ? {
          colorBackground: '#1e293b',
          colorText: '#e2e8f0',
          colorDanger: '#ef4444',
          borderRadius: '8px'
        } : undefined
      }
    })
    const paymentElement = stripeElements.create('payment')
    await nextTick()
    if (stripeElementRef.value && !isUnmounted) {
      paymentElement.mount(stripeElementRef.value)
      // Add payment method change listener only once to prevent duplicates
      if (!stripePaymentMethodListenerAdded) {
        stripePaymentMethodListenerAdded = true
        paymentElement.on('change', (event: any) => {
          if (event.error) {
            stripeError.value = event.error.message
          } else {
            stripeError.value = ''
          }
        })
      }
    }
  } catch (err: any) {
    stripeError.value = err?.message || t('payment.qr.initFailed')
  } finally {
    stripeLoading.value = false
  }
}

async function handleStripeSubmit() {
  if (!stripeInstance || !stripeElements || stripeSubmitting.value) return
  stripeSubmitting.value = true
  try {
    const returnUrl = new URL('/purchase/result', window.location.origin)
    returnUrl.searchParams.set('out_trade_no', String(props.orderId))
    if (props.accessToken) {
      returnUrl.searchParams.set('access_token', props.accessToken)
    }
    const { error } = await stripeInstance.confirmPayment({
      elements: stripeElements,
      confirmParams: {
        return_url: returnUrl.toString()
      },
      redirect: 'if_required'
    })
    if (error) {
      stripeError.value = error.message || t('payment.qr.initFailed')
    } else {
      emit('statusChange', 'paid')
    }
  } catch (err: any) {
    stripeError.value = err?.message || t('payment.qr.initFailed')
  } finally {
    stripeSubmitting.value = false
  }
}

onMounted(() => {
  updateTimer()
  timerInterval = setInterval(updateTimer, TIMER_INTERVAL_MS)
  pollStatus()
  pollInterval = setInterval(pollStatus, POLL_INTERVAL_MS)
  if (isStripe.value && props.clientSecret) {
    initStripe()
  }
})

onUnmounted(() => {
  isUnmounted = true
  if (timerInterval) clearInterval(timerInterval)
  if (pollInterval) clearInterval(pollInterval)
  pollAbort?.abort()
  timerInterval = null
  pollInterval = null
  pollAbort = null
  stripeInstance = null
  stripeElements = null
})

// Stop polling and timer when expired
watch(expired, (val) => {
  if (val) {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
})

async function handleCancel() {
  try {
    // Check current status first
    const order = await payAPI.getOrder(props.orderId)
    if (order.paid_at) {
      cancelBlocked.value = true
      return
    }
    if (TERMINAL_STATUSES.has(order.status)) {
      emit('statusChange', order.status)
      return
    }

    await payAPI.cancelOrder(props.orderId)
    emit('statusChange', 'cancelled')
  } catch (err: unknown) {
    // Cancel may fail if order was paid between check and cancel — refresh status
    console.warn('[PaymentQRCode] Cancel order failed, refreshing status:', err)
    await pollStatus()
  }
}
</script>
