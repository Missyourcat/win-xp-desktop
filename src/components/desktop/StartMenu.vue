<template>
  <div v-if="visible" class="start-menu-overlay" @click.self="close">
    <div class="start-menu">
      <div class="start-menu-header">
        <div class="start-user-icon">
          <svg viewBox="0 0 1024 1024" width="48" height="48">
            <path d="M512 512c-141.4 0-256-114.6-256-256S370.6 0 512 0s256 114.6 256 256-114.6 256-256 256z" fill="#fff"/>
            <path d="M512 544c-188.5 0-341.3 152.8-341.3 341.3h682.6c0-188.5-152.8-341.3-341.3-341.3z" fill="#fff"/>
          </svg>
        </div>
        <div class="start-user-info">
          <template v-if="auth.isLoggedIn && auth.user">
            <p class="start-user-name">{{ auth.user.user_name }}</p>
            <p class="start-user-email">{{ auth.user.user_email }}</p>
          </template>
          <template v-else>
            <p class="start-user-name">未登录</p>
            <p class="start-user-email">点击下方按钮登录</p>
          </template>
        </div>
      </div>

      <div class="start-menu-items">
        <div class="start-menu-item" @click="openSystemInfo">
          <svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M969.536 402.944a22.4 22.4 0 0 0-22.336 22.08V273.088a22.4 22.4 0 0 0 44.736-0.128h0.064V160a22.4 22.4 0 0 0-22.4-22.4H54.4a22.528 22.528 0 0 0-22.4 22.4v604.608c0 12.288 10.112 22.4 22.4 22.4h915.2a22.4 22.4 0 0 0 22.4-22.4V425.344a22.4 22.4 0 0 0-22.464-22.4z"/><path d="M969.6 328m-22.4 0a22.4 22.4 0 1 0 44.8 0 22.4 22.4 0 1 0-44.8 0Z"/><path d="M77.44 631.168a0.64 0.64 0 0 1-0.64-0.64V189.376a0.64 0.64 0 0 1 0.64-0.64h869.184c0.256 0 0.64 0.256 0.64 0.64v441.152c0 0.32-0.384 0.64-0.64 0.64H77.44z" fill="#545454"/><path d="M77.44 740.032a0.64 0.64 0 0 1-0.64-0.64v-69.12a0.64 0.64 0 0 1 0.64-0.64h869.184c0.256 0 0.64 0.32 0.64 0.64v69.12c0 0.32-0.384 0.64-0.64 0.64H77.44z" fill="#E0E0E0"/></svg>
          <span>我的电脑</span>
        </div>
        <div class="start-menu-item" @click="openFiles">
          <svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M0 213.422h955.734c37.7 0 68.261 28.677 68.266 64.059V886.14c0 35.386-30.566 64.074-68.266 64.074H68.271C30.566 950.214 0 921.526 0 886.14V213.422z" fill="#2c2c2c"/><path d="M415.953 73.786H67.124C30.058 73.786 0.005 102.468 0 137.85v32.028h536.951l-37.23-53.303c-18.675-26.736-50.11-42.789-83.768-42.789z" fill="#2c2c2c"/></svg>
          <span>我的文件</span>
        </div>
        <div class="start-menu-item" @click="openBrowser">
          <svg viewBox="0 0 1024 1024" width="24" height="24"><path d="M981.333 533.333c0 17.067 0 36.267-2.133 53.334H373.333c0 104.533 91.734 181.333 192 181.333 68.267 0 134.4-34.133 168.534-93.867h221.866c-59.733 168.534-217.6 281.6-396.8 281.6-64 0-128-14.933-185.6-44.8C313.6 940.8 232.533 972.8 166.4 972.8c-89.6 0-123.733-53.333-123.733-138.667 0-49.066 10.666-96 25.6-142.933 6.4-29.867 42.666-91.733 57.6-121.6 64-115.2 147.2-230.4 249.6-317.867-78.934 34.134-168.534 121.6-224 185.6 42.666-189.866 213.333-326.4 407.466-326.4h25.6c64-29.866 155.734-61.866 228.267-61.866 83.2 0 157.867 32 157.867 128 0 49.066-19.2 104.533-40.534 151.466 34.134 61.867 51.2 134.4 51.2 204.8z" fill="#fff"/></svg>
          <span>浏览器</span>
        </div>
      </div>

      <div class="start-menu-footer">
        <template v-if="auth.isLoggedIn">
          <button class="start-menu-btn" @click="handleLogout">注销</button>
        </template>
        <template v-else>
          <button class="start-menu-btn" @click="openLogin">登录</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useWindowsStore } from '@/stores/windows'

defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: []; openAuth: [] }>()

const auth = useAuthStore()
const wins = useWindowsStore()

function close() {
  emit('close')
}

function openSystemInfo() {
  wins.openWindow({
    id: 'system-info',
    title: '我的电脑',
    component: 'SystemInfo',
    x: 100,
    y: 40,
    width: 520,
    height: 440,
  })
  emit('close')
}

function openFiles() {
  wins.openWindow({
    id: 'filesystem',
    title: '我的文件',
    component: 'FileSystem',
    x: 80,
    y: 40,
    width: 700,
    height: 480,
  })
  emit('close')
}

function openBrowser() {
  wins.openWindow({
    id: 'browser',
    title: '浏览器',
    component: 'Browser',
    x: 100,
    y: 60,
    width: 800,
    height: 520,
  })
  emit('close')
}

function openLogin() {
  emit('openAuth')
  emit('close')
}

function handleLogout() {
  auth.logout()
  emit('close')
}
</script>

<style scoped>
.start-menu-overlay {
  position: fixed;
  bottom: 36px;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
  pointer-events: auto;
}

.start-menu {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 320px;
  background: #ece9d8;
  border: 2px solid #0831d9;
  border-bottom: none;
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.3);
  font-family: Tahoma, sans-serif;
}

.start-menu-header {
  background: linear-gradient(to bottom, #3c8df0, #245edb);
  color: white;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.start-user-icon svg {
  width: 48px;
  height: 48px;
}

.start-user-name {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
}

.start-user-email {
  font-size: 11px;
  margin: 2px 0 0;
  opacity: 0.8;
}

.start-menu-items {
  padding: 8px 0;
}

.start-menu-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.1s;
}

.start-menu-item:hover {
  background: #d4d0c8;
}

.start-menu-item svg {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.start-menu-footer {
  border-top: 1px solid #ccc;
  padding: 8px;
  display: flex;
  justify-content: center;
}

.start-menu-btn {
  width: 100%;
  padding: 6px 16px;
  background: linear-gradient(to bottom, #ece9d8, #d4d0c8);
  border: 1px solid #7f9db9;
  font-size: 13px;
  cursor: pointer;
  font-family: Tahoma, sans-serif;
}

.start-menu-btn:active {
  background: linear-gradient(to bottom, #d4d0c8, #ece9d8);
}

@media (max-width: 600px) {
  .start-menu {
    width: 100%;
  }
}
</style>
