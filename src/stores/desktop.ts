import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import type { DesktopIcon } from '@/types'

export const useDesktopStore = defineStore('desktop', () => {
  const icons = ref<DesktopIcon[]>([])
  const loading = ref(false)

  async function fetchIcons() {
    loading.value = true
    try {
      const res = await api.getDesktopIcons()
      if (res.code === 200 && res.data) {
        icons.value = res.data
      }
    } catch {
      console.error('Failed to load desktop icons')
    } finally {
      loading.value = false
    }
  }

  return { icons, loading, fetchIcons }
})
