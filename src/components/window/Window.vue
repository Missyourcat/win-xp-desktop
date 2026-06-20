<template>
  <div
    v-show="!win.minimized"
    class="xp-window"
    :class="{ maximized: win.maximized }"
    :style="windowStyle"
    @mousedown="focus"
  >
    <div class="win-titlebar" ref="titlebarRef">
      <span class="win-title">{{ win.title }}</span>
      <div class="win-controls">
        <button class="win-btn" @click="minimize">_</button>
        <button class="win-btn" @click="toggleMax">□</button>
        <button class="win-btn win-close" @click="close">✕</button>
      </div>
    </div>
    <div class="win-body" ref="bodyRef">
      <component :is="appComponent" v-bind="appProps" />
    </div>
    <div v-if="!win.maximized" class="win-resize-handle" ref="resizeRef"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, markRaw } from 'vue'
import interact from 'interactjs'
import type { AppWindow } from '@/types'
import { useWindowsStore } from '@/stores/windows'
import FileSystem from '@/apps/FileSystem.vue'
import Browser from '@/apps/Browser.vue'

const props = defineProps<{ win: AppWindow }>()

const wins = useWindowsStore()

const titlebarRef = ref<HTMLElement | null>(null)
const bodyRef = ref<HTMLElement | null>(null)
const resizeRef = ref<HTMLElement | null>(null)

const appMap: Record<string, unknown> = {
  FileSystem: markRaw(FileSystem),
  Browser: markRaw(Browser),
  GenericApp: markRaw(GenericApp),
}

const appComponent = computed(() => {
  return appMap[props.win.component] || appMap.GenericApp
})

const appProps = computed(() => ({
  data: props.win.data,
}))

const windowStyle = computed(() => {
  if (props.win.maximized) {
    return { zIndex: props.win.zIndex }
  }
  return {
    left: `${props.win.x}px`,
    top: `${props.win.y}px`,
    width: `${props.win.width}px`,
    height: `${props.win.height}px`,
    zIndex: props.win.zIndex,
  }
})

function focus() {
  wins.focusWindow(props.win.id)
}

function minimize() {
  wins.minimizeWindow(props.win.id)
}

function toggleMax() {
  wins.toggleMaximize(props.win.id)
}

function close() {
  wins.closeWindow(props.win.id)
}

onMounted(() => {
  if (!props.win.maximized && titlebarRef.value) {
    interact(titlebarRef.value).draggable({
      inertia: false,
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: true,
        }),
      ],
      onmove(event) {
        const target = titlebarRef.value?.parentElement
        if (!target) return
        const x = (parseFloat(target.style.left) || 0) + event.dx
        const y = (parseFloat(target.style.top) || 0) + event.dy
        target.style.left = `${x}px`
        target.style.top = `${y}px`
        wins.updatePosition(props.win.id, x, y)
      },
    })
  }

  if (!props.win.maximized && resizeRef.value) {
    interact(resizeRef.value).resizable({
      edges: { left: false, right: false, top: false, bottom: true },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 300, height: 200 },
        }),
      ],
      onmove(event) {
        const target = resizeRef.value?.parentElement
        if (!target) return
        let { width, height } = event.rect
        target.style.width = `${width}px`
        target.style.height = `${height}px`
        wins.updateSize(props.win.id, width, height)
      },
    })
  }
})

onUnmounted(() => {
  if (titlebarRef.value) interact(titlebarRef.value).unset()
  if (resizeRef.value) interact(resizeRef.value).unset()
})
</script>

<script lang="ts">
import { defineComponent } from 'vue'

const GenericApp = defineComponent({
  props: ['data'],
  template: `
    <div class="generic-app">
      <div v-if="data?.icon" class="generic-icon" v-html="data.icon.desktop_image"></div>
      <p>{{ data?.icon?.desktop_name || '应用' }}</p>
    </div>
  `,
})
</script>

<style scoped>
.xp-window {
  position: absolute;
  background: #ece9d8;
  border: 2px solid #0831d9;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  font-family: Tahoma, sans-serif;
  min-width: 300px;
  min-height: 200px;
}

.xp-window.maximized {
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: calc(100% - 36px) !important;
}

.win-titlebar {
  background: linear-gradient(to bottom, #3c8df0, #245edb);
  color: white;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: default;
  flex-shrink: 0;
  user-select: none;
}

.win-title {
  font-size: 12px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.win-controls {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.win-btn {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.win-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.win-close:hover {
  background: #c00;
}

.win-body {
  flex: 1;
  overflow: auto;
  background: #fff;
  position: relative;
}

.win-resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6px;
  cursor: s-resize;
  background: transparent;
}

@media (max-width: 600px) {
  .xp-window:not(.maximized) {
    width: 100% !important;
    height: calc(100% - 36px) !important;
    top: 0 !important;
    left: 0 !important;
  }

  .win-resize-handle {
    display: none;
  }
}
</style>
