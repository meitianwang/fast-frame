<template>
  <BaseDialog :show="true" @close="emit('close')" :title="t('payment.admin.processRefund')">
    <div class="space-y-4">
      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
          {{ t('payment.admin.orderId') }}
        </label>
        <p class="text-sm text-gray-900 dark:text-slate-100">#{{ orderId }}</p>
      </div>

      <div>
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
          {{ t('payment.admin.orderAmount') }}
        </label>
        <p class="text-sm font-medium text-gray-900 dark:text-slate-100">¥{{ orderAmount }}</p>
      </div>

      <!-- User balance / subscription info -->
      <div v-if="userBalance !== null" class="rounded-lg border p-3 border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/60">
        <p class="text-sm text-gray-600 dark:text-slate-400">
          {{ t('payment.admin.userBalance') }}: <span class="font-medium text-gray-900 dark:text-slate-100">¥{{ userBalance }}</span>
        </p>
        <p v-if="insufficientBalance" class="mt-1 text-xs text-amber-600 dark:text-amber-400">
          {{ t('payment.admin.insufficientBalance') }}
        </p>
      </div>

      <div v-if="subscriptionDaysRemaining !== null" class="rounded-lg border p-3 border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/60">
        <p class="text-sm text-gray-600 dark:text-slate-400">
          {{ t('payment.admin.subscriptionDaysRemaining') }}: <span class="font-medium text-gray-900 dark:text-slate-100">{{ subscriptionDaysRemaining }}</span>
        </p>
      </div>

      <div>
        <label for="admin-refund-amount" class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
          {{ t('payment.orders.refundAmount') }}
        </label>
        <input
          id="admin-refund-amount"
          :value="refundAmount"
          @input="handleAmountInput(($event.target as HTMLInputElement).value)"
          type="text"
          inputmode="decimal"
          pattern="^\d*(\.\d{0,2})?$"
          class="input w-full"
          :placeholder="orderAmount"
        />
        <p v-if="amountError" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ amountError }}</p>
      </div>

      <div>
        <label for="admin-refund-reason" class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
          {{ t('payment.orders.refundReason') }}
        </label>
        <textarea id="admin-refund-reason" v-model="reason" rows="3" class="input w-full" maxlength="500" />
      </div>

      <!-- Deduct balance option -->
      <label v-if="orderType === 'balance'" class="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
        <input type="checkbox" v-model="deductBalance" class="rounded" />
        {{ t('payment.admin.deductBalance') }}
      </label>

      <!-- Force refund option -->
      <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
        <input type="checkbox" v-model="forceRefund" class="rounded" />
        {{ t('payment.admin.forceRefund') }}
      </label>
      <p v-if="forceRefund" class="text-xs text-amber-600 dark:text-amber-400">
        {{ t('payment.admin.forceRefundWarning') }}
      </p>

      <div class="flex justify-end gap-3 pt-2">
        <button @click="emit('close')" class="btn btn-secondary">{{ t('common.cancel') }}</button>
        <button @click="handleSubmit" class="btn bg-red-600 text-white hover:bg-red-700" :disabled="loading">
          {{ loading ? t('payment.processing') : t('payment.admin.confirmRefund') }}
        </button>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseDialog from '@/components/common/BaseDialog.vue'
import { adminPayAPI } from '@/api/admin/pay'
import { useAppStore } from '@/stores'

const props = defineProps<{
  orderId: number
  orderAmount: string
  orderType?: string
  userId?: number
}>()

const emit = defineEmits<{
  close: []
  refunded: []
}>()

const { t } = useI18n()
const appStore = useAppStore()

const AMOUNT_PATTERN = /^\d*(\.\d{0,2})?$/
const refundAmount = ref(props.orderAmount)
const reason = ref('')
const forceRefund = ref(false)
const deductBalance = ref(true)
const userBalance = ref<string | null>(null)
const subscriptionDaysRemaining = ref<number | null>(null)

const insufficientBalance = computed(() => {
  if (userBalance.value === null) return false
  const balance = parseFloat(userBalance.value)
  const refund = parseFloat(refundAmount.value)
  return !isNaN(balance) && !isNaN(refund) && balance < refund
})

const amountError = computed(() => {
  if (!refundAmount.value) return ''
  const num = parseFloat(refundAmount.value)
  if (isNaN(num) || num <= 0) return t('payment.invalidAmount')
  if (num > parseFloat(props.orderAmount)) return t('payment.maxAmount', { amount: props.orderAmount })
  return ''
})

function handleAmountInput(val: string) {
  if (AMOUNT_PATTERN.test(val)) {
    refundAmount.value = val
  }
}

const loading = ref(false)

onMounted(async () => {
  // Fetch order detail to get user balance and subscription info
  try {
    const detail = await adminPayAPI.getOrderDetail(props.orderId)
    const order = detail.order
    if (order.user_id) {
      // Try to get user balance from the order detail if available
      // The admin API may include user_balance in the response
      if ((order as any).user_balance !== undefined) {
        userBalance.value = String((order as any).user_balance)
      }
    }
    // For subscription orders, calculate remaining days
    if (order.order_type === 'subscription' && order.completed_at && order.subscription_days) {
      const completedAt = new Date(order.completed_at)
      const expiresAt = new Date(completedAt.getTime() + order.subscription_days * 24 * 60 * 60 * 1000)
      const remaining = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      subscriptionDaysRemaining.value = remaining
    }
  } catch {
    // Non-critical: proceed without balance info
  }
})

async function handleSubmit() {
  if (loading.value) return
  const amount = parseFloat(refundAmount.value)
  if (isNaN(amount) || amount <= 0) {
    appStore.showError(t('payment.invalidAmount'))
    return
  }
  if (amount > parseFloat(props.orderAmount)) {
    appStore.showError(t('payment.maxAmount', { amount: props.orderAmount }))
    return
  }
  loading.value = true
  try {
    await adminPayAPI.processRefund({
      order_id: props.orderId,
      amount: refundAmount.value,
      reason: reason.value,
      force: forceRefund.value,
      deduct_balance: deductBalance.value
    })
    appStore.showSuccess(t('payment.admin.refundSuccess'))
    emit('refunded')
    emit('close')
  } catch (err: unknown) {
    appStore.showError(err instanceof Error ? err.message : t('common.error'))
  } finally {
    loading.value = false
  }
}
</script>
