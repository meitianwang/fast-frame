<template>
  <nav class="mb-6 flex flex-wrap gap-1 rounded-lg border p-1 border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/50">
    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
      :class="isActive(item.path)
        ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
        : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'"
    >
      {{ item.label }}
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const navItems = computed(() => [
  { path: '/admin/payment', label: t('payment.admin.dashboard') },
  { path: '/admin/payment/orders', label: t('payment.admin.orders') },
  { path: '/admin/payment/config', label: t('payment.admin.paymentConfig') },
  { path: '/admin/payment/channels', label: t('payment.admin.channels') },
  { path: '/admin/payment/plans', label: t('payment.admin.subscriptionPlans') },
  { path: '/admin/payment/providers', label: t('payment.admin.providerInstances') }
])

function isActive(path: string): boolean {
  return route.path === path
}
</script>
