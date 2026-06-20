<template>
  <div class="desktop-icons">
    <div
      v-for="icon in store.icons"
      :key="icon.desktop_id"
      class="desktop-icon"
      @dblclick="openApp(icon)"
    >
      <div class="desktop-icon-img" v-html="icon.desktop_image"></div>
      <span class="desktop-icon-label">{{ icon.desktop_name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDesktopStore } from '@/stores/desktop'
import { useWindowsStore } from '@/stores/windows'
import type { DesktopIcon } from '@/types'

const store = useDesktopStore()
const wins = useWindowsStore()

function openApp(icon: DesktopIcon) {
  if (icon.desktop_name === '我的文件') {
    wins.openWindow({
      id: 'filesystem',
      title: icon.desktop_name,
      component: 'FileSystem',
      x: 80,
      y: 40,
      width: 700,
      height: 480,
    })
  } else if (icon.desktop_name === '我的电脑') {
    wins.openWindow({
      id: 'system-info',
      title: icon.desktop_name,
      component: 'SystemInfo',
      x: 100,
      y: 40,
      width: 520,
      height: 440,
    })
  } else if (icon.desktop_name === '浏览器') {
    wins.openWindow({
      id: 'browser',
      title: icon.desktop_name,
      component: 'Browser',
      x: 100,
      y: 60,
      width: 800,
      height: 520,
    })
  } else {
    wins.openWindow({
      id: `app-${icon.desktop_id}`,
      title: icon.desktop_name,
      component: 'GenericApp',
      x: 100 + (icon.desktop_id % 5) * 30,
      y: 60 + (icon.desktop_id % 5) * 20,
      width: 500,
      height: 400,
      data: { icon },
    })
  }
}
</script>

<style scoped>
.desktop-icons {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.desktop-icon {
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 4px;
  user-select: none;
}

.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.15);
}

.desktop-icon:active {
  background: rgba(0, 0, 0, 0.15);
}

.desktop-icon-img {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.desktop-icon-img :deep(svg) {
  width: 48px;
  height: 48px;
}

.desktop-icon-label {
  color: white;
  font-size: 11px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  word-wrap: break-word;
  max-width: 72px;
  margin-top: 2px;
  line-height: 1.2;
}

@media (max-width: 600px) {
  .desktop-icons {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px;
    top: 8px;
    left: 8px;
  }

  .desktop-icon {
    width: 60px;
    padding: 4px 2px;
  }

  .desktop-icon-img {
    width: 40px;
    height: 40px;
  }

  .desktop-icon-img :deep(svg) {
    width: 40px;
    height: 40px;
  }

  .desktop-icon-label {
    font-size: 10px;
    max-width: 60px;
  }
}
</style>
