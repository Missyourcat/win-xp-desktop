<template>
  <div class="xp-taskbar">
    <div class="start-area">
      <button class="start-button" @click="toggleMenu">
        <svg viewBox="0 0 1181 1024" class="icon_xp"><path d="M1174.646154 141.331692C946.806154 234.496 837.474462 182.409846 739.249231 116.283077L626.806154 500.972308c98.225231 66.126769 217.718154 120.221538 435.436308 24.044307L1174.646154 141.331692z" fill="#91C300"/><path d="M434.412308 914.707692C335.202462 848.620308 227.84 794.525538 0 887.689846l111.399385-385.693538c227.84-93.144615 337.191385-40.073846 436.440615 26.052923l-113.427692 386.697846z" fill="#00B4F1"/><path d="M567.079385 458.909538c-59.746462-40.073846-123.549538-76.150154-214.685539-77.134769-59.746462-1.004308-131.643077 16.029538-221.755077 53.090462l112.403692-384.689231C470.882462-42.988308 580.233846 10.102154 679.483077 76.209231l-112.403692 382.680615z" fill="#F8682C"/><path d="M607.586462 565.090462c98.225231 66.126769 208.600615 118.212923 436.440615 25.048615L931.643077 973.824c-227.84 93.164308-337.211077 40.073846-435.436308-26.052923l111.399385-382.680615z" fill="#FFC300"/></svg>
        <span class="text_xp">Start</span>
      </button>
      <StartMenu :visible="showMenu" @close="showMenu = false" @open-auth="emit('openAuth')" />
    </div>

    <div class="task-area">
      <div
        v-for="w in wins.windows"
        :key="w.id"
        class="task-item"
        :class="{ active: w.zIndex === maxZ }"
        @click="wins.focusWindow(w.id)"
      >
        <span>{{ w.title }}</span>
      </div>
    </div>

    <div v-if="auth.isLoggedIn && auth.user" class="user-badge" @click="emit('openAuth')">
      <span>{{ auth.user.user_name }}</span>
    </div>

    <div class="clock">{{ time }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useClock } from '@/composable/useClock'
import { useAuthStore } from '@/stores/auth'
import { useWindowsStore } from '@/stores/windows'
import StartMenu from './StartMenu.vue'

const emit = defineEmits<{ openAuth: [] }>()

const auth = useAuthStore()
const wins = useWindowsStore()
const { time } = useClock()

const showMenu = ref(false)

const maxZ = computed(() => {
  if (!wins.windows.length) return 0
  return Math.max(...wins.windows.map((w) => w.zIndex))
})

function toggleMenu() {
  showMenu.value = !showMenu.value
}
</script>

<style scoped>
.xp-taskbar {
  height: 36px;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  background: linear-gradient(to bottom, #3c8df0, #245edb);
  border-top: 1px solid #6ea7ff;
  z-index: 100;
}

.start-area {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.start-button {
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  border: none;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(to bottom, #4ecb4e, #1f8f1f);
  color: white;
  font-weight: bold;
  cursor: pointer;
  flex-shrink: 0;
  font-family: Tahoma, sans-serif;
  font-size: 14px;
}

.start-button:active {
  background: linear-gradient(to bottom, #1f8f1f, #4ecb4e);
}

.icon_xp {
  height: 20px;
  width: auto;
  display: block;
}

.text_xp {
  font-size: 14px;
  white-space: nowrap;
}

.task-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
  overflow-x: auto;
  min-width: 0;
}

.task-item {
  height: 28px;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
  max-width: 150px;
  overflow: hidden;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.25);
}

.task-item.active {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.3);
}

.task-item span {
  font-size: 11px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-badge {
  height: 28px;
  padding: 0 8px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 4px;
  flex-shrink: 0;
}

.user-badge span {
  font-size: 11px;
  color: white;
  white-space: nowrap;
}

.clock {
  margin-right: 8px;
  padding: 0 10px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .xp-taskbar {
    height: 32px;
  }

  .start-button {
    height: 32px;
    padding: 0 10px;
    gap: 4px;
  }

  .icon_xp {
    height: 16px;
  }

  .text_xp {
    font-size: 12px;
  }

  .task-item {
    height: 24px;
    padding: 0 6px;
    max-width: 100px;
  }

  .clock {
    height: 24px;
    font-size: 11px;
    margin-right: 4px;
    padding: 0 6px;
  }

  .user-badge {
    height: 24px;
    padding: 0 6px;
  }

  .user-badge span {
    font-size: 10px;
  }
}
</style>
