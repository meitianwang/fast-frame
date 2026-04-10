<template>
  <div class="flex min-h-screen items-center justify-center p-4" :class="isDark ? 'bg-slate-950' : 'bg-slate-50'">
    <div
      class="w-full max-w-md space-y-4 rounded-2xl border p-6 shadow-lg"
      :class="isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'"
    >
      <!-- Amount display -->
      <div class="text-center">
        <div class="text-3xl font-bold" :class="isDark ? 'text-blue-400' : 'text-blue-600'">
          ¥{{ amount.toFixed(2) }}
        </div>
        <p class="mt-1 text-sm" :class="isDark ? 'text-slate-400' : 'text-gray-500'">
          {{ t('payment.stripePopup.orderId') }}: {{ orderId }}
        </p>
      </div>

      <!-- Waiting for credentials -->
      <template v-if="!credentials">
        <div class="flex items-center justify-center py-8">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-[#635bff] border-t-transparent" />
          <span class="ml-3 text-sm" :class="isDark ? 'text-slate-400' : 'text-gray-500'">
            {{ t('payment.stripePopup.init') }}
          </span>
        </div>
      </template>

      <!-- Alipay redirect flow -->
      <template v-else-if="isAlipay">
        <template v-if="stripeError">
          <div
            class="rounded-lg border p-3 text-sm"
            :class="isDark ? 'border-red-700 bg-red-900/30 text-red-400' : 'border-red-200 bg-red-50 text-red-600'"
          >
            {{ stripeError }}
          </div>
          <button
            type="button"
            @click="closeWindow"
            class="w-full text-sm underline"
            :class="isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'"
          >
            {{ t('payment.stripePopup.closeWindow') }}
          </button>
        </template>
        <div v-else class="flex items-center justify-center py-8">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-[#635bff] border-t-transparent" />
          <span class="ml-3 text-sm" :class="isDark ? 'text-slate-400' : 'text-gray-500'">
            {{ t('payment.stripePopup.redirecting') }}
          </span>
        </div>
      </template>

      <!-- Card payment flow -->
      <template v-else>
        <!-- Loading -->
        <div v-if="!stripeLoaded" class="flex items-center justify-center py-8">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-[#635bff] border-t-transparent" />
          <span class="ml-3 text-sm" :class="isDark ? 'text-slate-400' : 'text-gray-500'">
            {{ t('payment.stripePopup.loadingForm') }}
          </span>
        </div>

        <!-- Success -->
        <div v-else-if="stripeSuccess" class="py-6 text-center">
          <div class="text-5xl" :class="isDark ? 'text-green-400' : 'text-green-600'">✓</div>
          <p class="mt-3 text-sm" :class="isDark ? 'text-slate-400' : 'text-gray-500'">
            {{ t('payment.stripePopup.successClosing') }}
          </p>
          <button
            type="button"
            @click="closeWindow"
            class="mt-4 text-sm underline"
            :class="isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'"
          >
            {{ t('payment.stripePopup.closeWindowManually') }}
          </button>
        </div>

        <!-- Payment form -->
        <template v-else>
          <div
            v-if="stripeError"
            class="rounded-lg border p-3 text-sm"
            :class="isDark ? 'border-red-700 bg-red-900/30 text-red-400' : 'border-red-200 bg-red-50 text-red-600'"
          >
            {{ stripeError }}
          </div>
          <div
            ref="stripeElementRef"
            class="rounded-lg border p-4"
            :class="isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'"
          />
          <button
            type="button"
            :disabled="stripeSubmitting"
            @click="handleSubmit"
            class="w-full rounded-lg py-3 font-medium text-white shadow-md transition-colors bg-[#635bff] hover:bg-[#5851db] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <template v-if="stripeSubmitting">
              <span class="inline-flex items-center gap-2">
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {{ t('payment.processing') }}
              </span>
            </template>
            <template v-else>
              {{ t('payment.stripePopup.payAmount', { amount: amount.toFixed(2) }) }}
            </template>
          </button>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const orderId = String(route.query.order_id || '')
const amount = parseFloat(String(route.query.amount || '0')) || 0
const theme = String(route.query.theme || 'light')
const method = String(route.query.method || '')
const accessToken = String(route.query.access_token || '')

const isDark = theme === 'dark'
const isAlipay = method === 'alipay'

const credentials = ref<{ clientSecret: string; publishableKey: string } | null>(null)
const stripeLoaded = ref(false)
const stripeSubmitting = ref(false)
const stripeError = ref('')
const stripeSuccess = ref(false)
const stripeElementRef = ref<HTMLDivElement | null>(null)

let stripeInstance: any = null
let stripeElements: any = null
let isUnmounted = false
let closeTimer: ReturnType<typeof setTimeout> | null = null

function buildReturnUrl(): string {
  const url = new URL(window.location.href)
  url.pathname = '/purchase'
  url.search = ''
  url.searchParams.set('order_id', orderId)
  url.searchParams.set('status', 'success')
  url.searchParams.set('popup', '1')
  url.searchParams.set('theme', theme)
  if (accessToken) {
    url.searchParams.set('access_token', accessToken)
  }
  return url.toString()
}

function closeWindow() {
  window.close()
}

function handleMessage(event: MessageEvent) {
  if (event.origin !== window.location.origin) return
  if (event.data?.type !== 'STRIPE_POPUP_INIT') return
  const { clientSecret, publishableKey } = event.data
  if (clientSecret && publishableKey) {
    credentials.value = { clientSecret, publishableKey }
    initStripe(clientSecret, publishableKey)
  }
}

function loadStripeJs(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Stripe) {
      resolve((window as any).Stripe)
      return
    }
    const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]') as HTMLScriptElement | null
    if (existing) {
      // If the script tag exists, check if it's already loaded
      if ((window as any).Stripe) {
        resolve((window as any).Stripe)
        return
      }
      // Poll briefly in case the script is between loaded and Stripe being available
      let attempts = 0
      const check = setInterval(() => {
        attempts++
        if ((window as any).Stripe) {
          clearInterval(check)
          resolve((window as any).Stripe)
        } else if (attempts > 50) { // 5 seconds
          clearInterval(check)
          reject(new Error('Stripe.js loaded but Stripe object not available'))
        }
      }, 100)
      existing.addEventListener('error', () => { clearInterval(check); reject(new Error('Failed to load Stripe.js')) }, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/'
    script.onload = () => resolve((window as any).Stripe)
    script.onerror = () => reject(new Error('Failed to load Stripe.js'))
    document.head.appendChild(script)
  })
}

async function initStripe(clientSecret: string, publishableKey: string) {
  try {
    const Stripe = await loadStripeJs()
    if (isUnmounted) return
    stripeInstance = Stripe(publishableKey)

    if (isAlipay) {
      const result = await stripeInstance.confirmAlipayPayment(clientSecret, {
        return_url: buildReturnUrl()
      })
      if (isUnmounted) return
      if (result.error) {
        stripeError.value = result.error.message || t('payment.stripePopup.payFailed')
        stripeLoaded.value = true
      }
      return
    }

    stripeElements = stripeInstance.elements({
      clientSecret,
      appearance: {
        theme: isDark ? 'night' : 'stripe',
        variables: isDark ? {
          colorBackground: '#1e293b',
          colorText: '#e2e8f0',
          borderRadius: '8px'
        } : { borderRadius: '8px' }
      }
    })
    stripeLoaded.value = true

    await nextTick()
    if (stripeElementRef.value && !isUnmounted) {
      stripeElements.create('payment', { layout: 'tabs' }).mount(stripeElementRef.value)
    }
  } catch (err: any) {
    if (!isUnmounted) {
      stripeError.value = err?.message || t('payment.stripePopup.loadFailed')
      stripeLoaded.value = true
    }
  }
}

async function handleSubmit() {
  if (!stripeInstance || !stripeElements || stripeSubmitting.value) return
  stripeSubmitting.value = true
  stripeError.value = ''

  try {
    const { error } = await stripeInstance.confirmPayment({
      elements: stripeElements,
      confirmParams: { return_url: buildReturnUrl() },
      redirect: 'if_required'
    })
    if (error) {
      stripeError.value = error.message || t('payment.stripePopup.payFailed')
    } else {
      stripeSuccess.value = true
      closeTimer = setTimeout(() => window.close(), 2000)
    }
  } catch (err: any) {
    stripeError.value = err?.message || t('payment.stripePopup.payFailed')
  } finally {
    stripeSubmitting.value = false
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
  if (window.opener) {
    window.opener.postMessage({ type: 'STRIPE_POPUP_READY' }, window.location.origin)
  }
})

onUnmounted(() => {
  isUnmounted = true
  window.removeEventListener('message', handleMessage)
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  stripeInstance = null
  stripeElements = null
})
</script>
