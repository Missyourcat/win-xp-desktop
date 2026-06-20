<template>
  <div class="sysinfo-app">
    <div v-if="loading" class="sysinfo-loading">加载中...</div>
    <div v-else class="sysinfo-grid">
      <div class="sysinfo-section">
        <div class="sysinfo-section-title">操作系统</div>
        <div class="sysinfo-row"><span class="sysinfo-label">系统</span><span>{{ info.os_name || '-' }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">内核版本</span><span>{{ info.os_release || '-' }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">版本详情</span><span>{{ info.os_version || '-' }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">架构</span><span>{{ info.machine || '-' }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">主机名</span><span>{{ info.hostname || '-' }}</span></div>
      </div>

      <div class="sysinfo-section">
        <div class="sysinfo-section-title">处理器</div>
        <div class="sysinfo-row"><span class="sysinfo-label">型号</span><span>{{ info.cpu_model || '-' }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">核心数</span><span>{{ info.cpu_count ?? '-' }}</span></div>
      </div>

      <div class="sysinfo-section">
        <div class="sysinfo-section-title">内存</div>
        <div class="sysinfo-row"><span class="sysinfo-label">总计</span><span>{{ formatMem(info.mem_total_kb) }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">可用</span><span>{{ formatMem(info.mem_available_kb) }}</span></div>
      </div>

      <div class="sysinfo-section">
        <div class="sysinfo-section-title">网络(网络并非法外之地，请注意言行举止)</div>
        <div class="sysinfo-row"><span class="sysinfo-label">IP 地址</span><span>{{ info.client_ip || '-' }}</span></div>
      </div>

      <div class="sysinfo-section">
        <div class="sysinfo-section-title">本地浏览器信息</div>
        <div class="sysinfo-row"><span class="sysinfo-label">User-Agent</span><span class="sysinfo-val-wrap">{{ navigator.userAgent }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">平台</span><span>{{ navigator.platform }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">语言</span><span>{{ navigator.language }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">在线</span><span>{{ navigator.onLine ? '是' : '否' }}</span></div>
        <div class="sysinfo-row"><span class="sysinfo-label">屏幕</span><span>{{ screen.width }}x{{ screen.height }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'
import type { SystemInfo } from '@/types'

const info = ref<SystemInfo>({})
const loading = ref(true)

function formatMem(kb: number | undefined): string {
  if (kb === undefined) return '-'
  const mb = kb / 1024
  if (mb < 1024) return mb.toFixed(0) + ' MB'
  return (mb / 1024).toFixed(1) + ' GB'
}

const navigator = window.navigator
const screen = window.screen

onMounted(async () => {
  try {
    const res = await api.getSystemInfo()
    if (res.code === 200 && res.data) {
      info.value = res.data
    }
  } catch (e) {
    console.error('Failed to load system info', e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.sysinfo-app {
  height: 100%;
  overflow-y: auto;
  background: #fff;
  font-size: 12px;
}

.sysinfo-loading {
  padding: 20px;
  text-align: center;
  color: #999;
}

.sysinfo-grid {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sysinfo-section {
  border: 1px solid #d4d0c8;
  background: #f8f8f6;
}

.sysinfo-section-title {
  background: linear-gradient(to bottom, #ece9d8, #d4d0c8);
  padding: 4px 8px;
  font-weight: bold;
  font-size: 12px;
  border-bottom: 1px solid #d4d0c8;
}

.sysinfo-row {
  display: flex;
  padding: 3px 8px;
  border-bottom: 1px solid #eee;
}

.sysinfo-row:last-child {
  border-bottom: none;
}

.sysinfo-label {
  font-weight: bold;
  color: #333;
  min-width: 80px;
  flex-shrink: 0;
}

.sysinfo-val-wrap {
  word-break: break-all;
}
</style>
