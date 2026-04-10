<template>
  <div class="mx-auto max-w-lg space-y-6">
    <!-- Back link -->
    <button
      type="button"
      @click="emit('back')"
      class="flex items-center gap-1 text-sm transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {{ t('payment.confirm.backToPlans') }}
    </button>

    <!-- Title -->
    <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
      {{ t('payment.confirm.title') }}
    </h2>

    <!-- Plan detail card -->
    <div class="rounded-2xl border p-5 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/80">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ plan.name }}</h3>
        <span class="rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          {{ periodLabel }}
        </span>
      </div>
      <div class="flex items-baseline gap-2">
        <span v-if="plan.original_price" class="text-sm line-through text-slate-400 dark:text-slate-500">
          ¥{{ plan.original_price }}
        </span>
        <span class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">¥{{ plan.price }}</span>
      </div>
      <p v-if="plan.description" class="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        {{ plan.description }}
      </p>
    </div>

    <!-- Payment method selector -->
    <div>
      <label class="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {{ t('payment.paymentMethod') }}
      </label>
      <div class="space-y-2">
        <button
          v-for="type in paymentTypes"
          :key="type"
          type="button"
          role="radio"
          :disabled="isMethodUnavailable(type)"
          :aria-checked="selectedPayment === type"
          :aria-label="getPaymentMethodLabel(type, t)"
          @click="!isMethodUnavailable(type) && (selectedPayment = type)"
          class="flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all"
          :class="getMethodClass(type)"
        >
          <!-- Radio indicator -->
          <span
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
            :class="selectedPayment === type ? getPaymentRadioBorderClass(type) : 'border-slate-300 dark:border-slate-600'"
          >
            <span v-if="selectedPayment === type" class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: getPaymentBrandColor(type) }" />
          </span>
          <!-- Payment Icon -->
          <span
            v-if="getPaymentIconType(type) === 'alipay'"
            class="flex h-7 w-7 items-center justify-center rounded-md bg-[#00AEEF] text-sm font-bold leading-none text-white"
          >支</span>
          <span
            v-else-if="getPaymentIconType(type) === 'wxpay'"
            class="flex h-7 w-7 items-center justify-center rounded-full bg-[#07C160] text-white"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
              <path d="M10 3C6.13 3 3 5.58 3 8.75c0 1.7.84 3.23 2.17 4.29l-.5 2.21 2.4-1.32c.61.17 1.25.27 1.93.27.22 0 .43-.01.64-.03C9.41 13.72 9 12.88 9 12c0-3.31 3.13-6 7-6 .26 0 .51.01.76.03C15.96 3.98 13.19 3 10 3z" />
              <path d="M16 8c-3.31 0-6 2.24-6 5s2.69 5 6 5c.67 0 1.31-.1 1.9-.28l2.1 1.15-.55-2.44C20.77 15.52 22 13.86 22 12c0-2.21-2.69-4-6-4z" />
            </svg>
          </span>
          <span
            v-else-if="getPaymentIconType(type) === 'stripe'"
            class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#635bff] text-white"
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
            </svg>
          </span>
          <!-- Label -->
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200">{{ getPaymentMethodLabel(type, t) }}</span>
        </button>
      </div>
    </div>

    <!-- Fee Breakdown -->
    <div class="rounded-xl border px-4 py-3 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60">
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-600 dark:text-slate-300">{{ t('payment.confirm.amountDue') }}</span>
        <span class="font-medium text-slate-900 dark:text-slate-100">¥{{ plan.price }}</span>
      </div>
      <template v-if="feeRate > 0">
        <div class="mt-1 flex items-center justify-between text-sm">
          <span class="text-slate-500 dark:text-slate-400">{{ t('payment.fee', { rate: feeRate }) }}</span>
          <span class="text-slate-500 dark:text-slate-400">¥{{ feeAmount.toFixed(2) }}</span>
        </div>
        <div class="mt-1.5 flex items-center justify-between border-t pt-1.5 border-slate-200 dark:border-slate-700">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-300">{{ t('payment.amountToPay') }}</span>
          <span class="text-xl font-bold text-emerald-500">¥{{ payAmount.toFixed(2) }}</span>
        </div>
      </template>
      <template v-else>
        <div class="mt-1 flex items-center justify-end">
          <span class="text-xl font-bold text-emerald-500">¥{{ plan.price }}</span>
        </div>
      </template>
    </div>

    <!-- Submit button -->
    <button
      type="button"
      :disabled="!selectedPayment || loading"
      @click="handleSubmit"
      class="w-full rounded-xl py-3 text-sm font-bold text-white transition-colors"
      :class="
        selectedPayment && !loading
          ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700'
          : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-400'
      "
    >
      {{ loading ? t('payment.processing') : t('payment.confirm.buyNow') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PaymentSubscriptionPlan, MethodLimit } from '@/types'
import { formatPeriodLabel, getPaymentMethodLabel, getPaymentIconType, getPaymentBrandColor, getPaymentRadioBorderClass, getPaymentConfirmSelectedClass } from '@/utils/payment'

const props = defineProps<{
  plan: PaymentSubscriptionPlan
  paymentTypes: string[]
  loading: boolean
  methodLimits?: Record<string, MethodLimit>
}>()

const emit = defineEmits<{
  back: []
  submit: [paymentType: string]
}>()

const { t } = useI18n()

const selectedPayment = ref(props.paymentTypes[0] || '')

const periodLabel = computed(() => formatPeriodLabel(props.plan.validity_days, props.plan.validity_unit, t))

const feeRate = computed(() => {
  const v = props.methodLimits?.[selectedPayment.value]?.fee_rate
  return v ? parseFloat(v) : 0
})

const planPriceCents = computed(() => Math.round(parseFloat(props.plan.price) * 100))

const feeAmount = computed(() => {
  if (feeRate.value <= 0 || planPriceCents.value <= 0) return 0
  return Math.ceil((planPriceCents.value * feeRate.value) / 100) / 100
})

const payAmount = computed(() => {
  if (feeRate.value <= 0 || planPriceCents.value <= 0) return parseFloat(props.plan.price)
  return (planPriceCents.value + Math.ceil((planPriceCents.value * feeRate.value) / 100)) / 100
})

function isMethodUnavailable(type: string): boolean {
  return props.methodLimits?.[type]?.available === false
}

function handleSubmit() {
  if (selectedPayment.value && !props.loading && !isMethodUnavailable(selectedPayment.value)) {
    emit('submit', selectedPayment.value)
  }
}

function getMethodClass(type: string): string {
  if (isMethodUnavailable(type)) return 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800/30'
  if (selectedPayment.value === type) return getPaymentConfirmSelectedClass(type)
  return 'border-slate-200 hover:border-slate-300 bg-white dark:border-slate-700 dark:hover:border-slate-600 dark:bg-slate-800/60'
}
</script>
