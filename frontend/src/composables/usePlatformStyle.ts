/**
 * Composable for platform-specific styling
 */

import { computed, type Ref } from 'vue'

export interface PlatformStyleResult {
  badgeClass: string
  accentClass: string
  modelTagClass: string
  dotClass: string
  buttonClass: string
}

const DEFAULT_STYLE: PlatformStyleResult = {
  badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  accentClass: 'text-slate-700 dark:text-slate-300',
  modelTagClass:
    'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300',
  dotClass: 'bg-slate-500',
  buttonClass: 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500'
}

/**
 * Returns reactive platform style classes based on a platform string.
 */
export function usePlatformStyle(platform: Ref<string> | (() => string)) {
  const resolve = typeof platform === 'function' ? platform : () => platform.value

  const style = computed(() => {
    resolve()
    return DEFAULT_STYLE
  })

  return {
    badgeClass: computed(() => style.value.badgeClass),
    accentClass: computed(() => style.value.accentClass),
    modelTagClass: computed(() => style.value.modelTagClass),
    dotClass: computed(() => style.value.dotClass),
    buttonClass: computed(() => style.value.buttonClass)
  }
}

/**
 * Non-reactive version for one-off lookups.
 */
export function getPlatformStyleClasses(_platform: string): PlatformStyleResult {
  return DEFAULT_STYLE
}
