import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AppWindow } from '@/types'

export const useWindowsStore = defineStore('windows', () => {
  const windows = ref<AppWindow[]>([])
  let nextZ = 100

  function openWindow(win: Omit<AppWindow, 'zIndex' | 'minimized' | 'maximized'>) {
    const existing = windows.value.find((w) => w.id === win.id)
    if (existing) {
      focusWindow(existing.id)
      if (existing.minimized) {
        existing.minimized = false
      }
      return
    }
    windows.value.push({
      ...win,
      zIndex: nextZ++,
      minimized: false,
      maximized: false,
    })
  }

  function closeWindow(id: string) {
    const idx = windows.value.findIndex((w) => w.id === id)
    if (idx !== -1) windows.value.splice(idx, 1)
  }

  function minimizeWindow(id: string) {
    const win = windows.value.find((w) => w.id === id)
    if (win) win.minimized = true
  }

  function toggleMaximize(id: string) {
    const win = windows.value.find((w) => w.id === id)
    if (win) win.maximized = !win.maximized
  }

  function focusWindow(id: string) {
    const win = windows.value.find((w) => w.id === id)
    if (win) {
      win.zIndex = nextZ++
      win.minimized = false
    }
  }

  function updatePosition(id: string, x: number, y: number) {
    const win = windows.value.find((w) => w.id === id)
    if (win) {
      win.x = x
      win.y = y
    }
  }

  function updateSize(id: string, width: number, height: number) {
    const win = windows.value.find((w) => w.id === id)
    if (win) {
      win.width = Math.max(300, width)
      win.height = Math.max(200, height)
    }
  }

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focusWindow,
    updatePosition,
    updateSize,
  }
})
