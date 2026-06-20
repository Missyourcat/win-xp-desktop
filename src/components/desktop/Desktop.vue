<template>
  <div class="xp-desktop">
    <DesktopIcons />

    <Window v-for="win in wins.windows" :key="win.id" :win="win" />

    <AuthModal v-if="showAuth" @close="showAuth = false" />

    <div v-if="!auth.isLoggedIn" class="activation-popup">
      <blockquote>
        <p class="title">激活 Windows</p>
        <p class="desc">点击左下角“登录”以激活 Windows。</p>
      </blockquote>
    </div>

    <button class="fullscreen-btn" @click="toggleFullscreen">
      <svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M896 128v288c0 19.2-12.8 32-32 32s-32-12.8-32-32V236.8L633.6 441.6c-6.4 6.4-19.2 6.4-25.6 6.4s-19.2 0-25.6-6.4c-6.4-12.8-6.4-38.4 0-51.2L787.2 192H608c-19.2 0-32-12.8-32-32s12.8-32 32-32H896zM441.6 582.4c-12.8-6.4-38.4-12.8-51.2 0L192 787.2V608c0-19.2-12.8-32-32-32s-32 12.8-32 32V896h288c19.2 0 32-12.8 32-32s-12.8-32-32-32H236.8l204.8-198.4c6.4-12.8 6.4-38.4 0-51.2zM448 160c0-19.2-12.8-32-32-32H128v288c0 19.2 12.8 32 32 32s32-12.8 32-32V236.8l198.4 198.4c6.4 12.8 19.2 12.8 25.6 12.8s19.2 0 25.6-6.4c6.4-12.8 6.4-38.4 0-51.2L236.8 192h179.2c19.2 0 32-12.8 32-32zM864 576c-19.2 0-32 12.8-32 32v179.2L633.6 588.8c-12.8-12.8-38.4-12.8-51.2 0-6.4 12.8-6.4 32 0 44.8l198.4 198.4H608c-19.2 0-32 12.8-32 32s12.8 32 32 32H896V608c0-19.2-12.8-32-32-32z" fill="#000"/></svg>
    </button>

    <TaskBar @open-auth="showAuth = true" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useWindowsStore } from '@/stores/windows'
import { useAuthStore } from '@/stores/auth'
import { useDesktopStore } from '@/stores/desktop'
import { toggleFullscreen } from '@/composable/fullWin'
import TaskBar from './TaskBar.vue'
import DesktopIcons from './DesktopIcons.vue'
import Window from '@/components/window/Window.vue'
import AuthModal from '@/components/auth/AuthModal.vue'

const wins = useWindowsStore()
const auth = useAuthStore()
const desktop = useDesktopStore()

const showAuth = ref(false)

onMounted(() => {
  desktop.fetchIcons()
})
</script>

<style scoped>
.xp-desktop {
  width: 100vw;
  height: 100dvh;
  background-color: #008080;
  position: relative;
  font-family: Tahoma, sans-serif;
  overflow: hidden;
}

.activation-popup {
  position: absolute;
  bottom: 45px;
  right: 15px;
  width: 265px;
  background-color: #c0c0c0;
  border: 2px solid #000;
  padding: 10px;
  box-shadow: 4px 4px #404040;
  z-index: 50;
}

.activation-popup blockquote {
  margin: 0;
  padding: 0;
}

.activation-popup .title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
  margin: 0 0 5px;
}

.activation-popup .desc {
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
}

.fullscreen-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  background: #c0c0c0;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.fullscreen-btn:active {
  border-top: 2px solid #404040;
  border-left: 2px solid #404040;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
}

@media (max-width: 600px) {
  .activation-popup {
    width: 200px;
    right: 8px;
    bottom: 40px;
    padding: 8px;
  }

  .activation-popup .title {
    font-size: 14px;
  }

  .activation-popup .desc {
    font-size: 12px;
  }

  .fullscreen-btn {
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
  }
}
</style>
