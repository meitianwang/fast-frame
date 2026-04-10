<template>
  <AppLayout>
    <div class="px-4 pt-4">
      <PaymentAdminNav />
    </div>
    <TablePageLayout>
      <template #filters>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('payment.admin.providerInstances') }}</h2>
          <button @click="openCreateDialog" class="btn btn-primary btn-sm">{{ t('common.create') }}</button>
        </div>
      </template>

      <template #default>
        <div v-if="loading" class="flex items-center justify-center py-12">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" role="status" aria-label="Loading" />
        </div>

        <div v-else-if="instances.length === 0" class="py-12 text-center text-gray-500 dark:text-slate-400">
          {{ t('payment.admin.noProviderInstances') }}
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200 dark:border-slate-700">
                <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-400">ID</th>
                <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-400">{{ t('payment.admin.instanceName') }}</th>
                <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-400">{{ t('payment.admin.providerKey') }}</th>
                <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-400">{{ t('payment.admin.enabled') }}</th>
                <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-400">{{ t('payment.admin.refundEnabled') }}</th>
                <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-400">{{ t('payment.admin.sortOrder') }}</th>
                <th scope="col" class="px-4 py-3 text-left font-medium text-gray-500 dark:text-slate-400">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="inst in instances" :key="inst.id" class="border-b border-gray-100 dark:border-slate-800">
                <td class="px-4 py-3 text-gray-900 dark:text-slate-100">{{ inst.id }}</td>
                <td class="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{{ inst.name }}</td>
                <td class="px-4 py-3 text-gray-600 dark:text-slate-400">{{ inst.provider_key }}</td>
                <td class="px-4 py-3">
                  <span :class="inst.enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'" role="img" :aria-label="inst.enabled ? t('payment.admin.enabled') : t('payment.admin.disabled')">
                    {{ inst.enabled ? '✓' : '✗' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span :class="inst.refund_enabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400'" role="img" :aria-label="inst.refund_enabled ? t('payment.admin.enabled') : t('payment.admin.disabled')">
                    {{ inst.refund_enabled ? '✓' : '✗' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600 dark:text-slate-400">{{ inst.sort_order }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button @click="openEditDialog(inst)" :aria-label="t('common.edit') + ' ' + inst.name" class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      {{ t('common.edit') }}
                    </button>
                    <button @click="handleDelete(inst.id)" :aria-label="t('common.delete') + ' ' + inst.name" class="text-sm text-red-600 hover:text-red-700 dark:text-red-400">
                      {{ t('common.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </TablePageLayout>

    <!-- Create/Edit Dialog -->
    <BaseDialog :show="dialogOpen" @close="dialogOpen = false" :title="editingInstance ? t('payment.admin.editProviderInstance') : t('payment.admin.addProviderInstance')">
      <div class="space-y-4">
        <div>
          <label for="pi-provider-key" class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('payment.admin.providerKey') }}</label>
          <select id="pi-provider-key" v-model="form.provider_key" class="input w-full">
            <option value="alipay">alipay</option>
            <option value="wxpay">wxpay</option>
            <option value="stripe">stripe</option>
            <option value="easypay">easypay</option>
          </select>
        </div>
        <div>
          <label for="pi-name" class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('payment.admin.instanceName') }}</label>
          <input id="pi-name" v-model="form.name" class="input w-full" maxlength="100" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="pi-sort" class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('payment.admin.sortOrder') }}</label>
            <input id="pi-sort" v-model.number="form.sort_order" type="number" class="input w-full" />
          </div>
          <div>
            <label for="pi-supported-types" class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('payment.admin.supportedTypes') }}</label>
            <input id="pi-supported-types" v-model="form.supported_types" class="input w-full" placeholder="balance,subscription" maxlength="500" />
          </div>
        </div>
        <div class="flex gap-6">
          <label for="pi-enabled" class="flex items-center gap-2 text-sm">
            <input id="pi-enabled" type="checkbox" v-model="form.enabled" class="rounded" />
            {{ t('payment.admin.enabled') }}
          </label>
          <label for="pi-refund" class="flex items-center gap-2 text-sm">
            <input id="pi-refund" type="checkbox" v-model="form.refund_enabled" class="rounded" />
            {{ t('payment.admin.refundEnabled') }}
          </label>
        </div>
        <div>
          <label for="pi-config" class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('payment.admin.instanceConfig') }} (JSON)</label>
          <textarea id="pi-config" v-model="form.config" rows="4" class="input w-full font-mono text-xs" placeholder='{"app_id": "...", "secret_key": "..."}' />
        </div>
        <div>
          <label for="pi-limits" class="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('payment.admin.instanceLimits') }} (JSON)</label>
          <textarea id="pi-limits" v-model="form.limits" rows="3" class="input w-full font-mono text-xs" placeholder='{"balance": {"daily_limit": "10000", "single_min": "1", "single_max": "5000"}}' />
        </div>
        <div class="flex justify-end gap-3">
          <button @click="dialogOpen = false" class="btn btn-secondary">{{ t('common.cancel') }}</button>
          <button @click="handleSave" class="btn btn-primary" :disabled="formLoading">
            {{ formLoading ? t('payment.processing') : t('common.save') }}
          </button>
        </div>
      </div>
    </BaseDialog>

    <ConfirmDialog
      :show="showDeleteConfirm"
      :title="t('common.delete')"
      :message="t('common.confirmDelete')"
      :danger="true"
      @confirm="confirmDelete"
      @cancel="showDeleteConfirm = false"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import PaymentAdminNav from '@/components/admin/PaymentAdminNav.vue'
import TablePageLayout from '@/components/layout/TablePageLayout.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { adminPayAPI } from '@/api/admin/pay'
import { useAppStore } from '@/stores'
import type { PaymentProviderInstance } from '@/types'

const { t } = useI18n()
const appStore = useAppStore()

const loading = ref(true)
const instances = ref<PaymentProviderInstance[]>([])
const dialogOpen = ref(false)
const editingInstance = ref<PaymentProviderInstance | null>(null)
const formLoading = ref(false)

interface InstanceForm {
  provider_key: string
  name: string
  enabled: boolean
  refund_enabled: boolean
  sort_order: number
  supported_types: string
  config: string
  limits: string
}

const form = reactive<InstanceForm>({
  provider_key: 'alipay',
  name: '',
  enabled: true,
  refund_enabled: false,
  sort_order: 0,
  supported_types: '',
  config: '{}',
  limits: '{}'
})

async function loadInstances() {
  loading.value = true
  try {
    instances.value = await adminPayAPI.listProviderInstances()
  } catch (err: unknown) {
    appStore.showError(err instanceof Error ? err.message : t('common.error'))
  } finally {
    loading.value = false
  }
}

onMounted(loadInstances)

function resetForm() {
  form.provider_key = 'alipay'
  form.name = ''
  form.enabled = true
  form.refund_enabled = false
  form.sort_order = 0
  form.supported_types = ''
  form.config = '{}'
  form.limits = '{}'
}

function openCreateDialog() {
  editingInstance.value = null
  resetForm()
  dialogOpen.value = true
}

function openEditDialog(inst: PaymentProviderInstance) {
  editingInstance.value = inst
  form.provider_key = inst.provider_key
  form.name = inst.name
  form.enabled = inst.enabled
  form.refund_enabled = inst.refund_enabled
  form.sort_order = inst.sort_order
  form.supported_types = inst.supported_types || ''
  form.config = JSON.stringify(inst.config || {}, null, 2)
  form.limits = JSON.stringify(inst.limits || {}, null, 2)
  dialogOpen.value = true
}

async function handleSave() {
  form.name = form.name.trim()
  form.supported_types = form.supported_types.trim()

  if (!form.name) {
    appStore.showError(t('common.nameRequired'))
    return
  }

  let configObj: Record<string, string>
  try {
    configObj = JSON.parse(form.config)
  } catch {
    appStore.showError(t('payment.admin.instanceConfig') + ': invalid JSON')
    return
  }

  let limitsObj: Record<string, { daily_limit?: string; single_min?: string; single_max?: string }> | undefined
  try {
    const parsed = JSON.parse(form.limits)
    limitsObj = Object.keys(parsed).length > 0 ? parsed : undefined
  } catch {
    appStore.showError(t('payment.admin.instanceLimits') + ': invalid JSON')
    return
  }

  formLoading.value = true
  try {
    const payload: Omit<PaymentProviderInstance, 'id' | 'created_at' | 'updated_at'> = {
      provider_key: form.provider_key,
      name: form.name,
      config: configObj,
      supported_types: form.supported_types,
      enabled: form.enabled,
      sort_order: form.sort_order,
      limits: limitsObj,
      refund_enabled: form.refund_enabled
    }
    if (editingInstance.value) {
      await adminPayAPI.updateProviderInstance(editingInstance.value.id, payload)
    } else {
      await adminPayAPI.createProviderInstance(payload)
    }
    dialogOpen.value = false
    loadInstances()
    appStore.showSuccess(t('common.saved'))
  } catch (err: unknown) {
    appStore.showError(err instanceof Error ? err.message : t('common.error'))
  } finally {
    formLoading.value = false
  }
}

const showDeleteConfirm = ref(false)
const deletingId = ref<number | null>(null)

function handleDelete(id: number) {
  deletingId.value = id
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  showDeleteConfirm.value = false
  if (!deletingId.value) return
  try {
    await adminPayAPI.deleteProviderInstance(deletingId.value)
    loadInstances()
    appStore.showSuccess(t('common.deleted'))
  } catch (err: unknown) {
    appStore.showError(err instanceof Error ? err.message : t('common.error'))
  }
}
</script>
