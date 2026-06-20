<template>
  <div class="fs-app">
    <div class="fs-toolbar">
      <button class="fs-btn" @click="fs.navigateUp()" :disabled="fs.currentPath.length <= 1">向上</button>
    </div>
    <div class="fs-addressbar">
      <span class="fs-label">地址:</span>
      <span class="fs-path">{{ fs.getBreadcrumbs().join(' &gt; ') }}</span>
    </div>
    <div class="fs-body">
      <div class="fs-sidebar">
        <div
          class="fs-sidebar-item"
          :class="{ active: idx === fs.currentPath.length - 1 }"
          v-for="(crumb, idx) in fs.getBreadcrumbs()"
          :key="idx"
          @click="fs.navigateTo(idx)"
        >
          <svg viewBox="0 0 1024 1024" width="16" height="16"><path d="M0 213.422h955.734c37.7 0 68.261 28.677 68.266 64.059V886.14c0 35.386-30.566 64.074-68.266 64.074H68.271C30.566 950.214 0 921.526 0 886.14V213.422z" fill="#2c2c2c"/><path d="M415.953 73.786H67.124C30.058 73.786 0.005 102.468 0 137.85v32.028h536.951l-37.23-53.303c-18.675-26.736-50.11-42.789-83.768-42.789z" fill="#2c2c2c"/></svg>
          <span>{{ crumb }}</span>
        </div>
      </div>
      <div class="fs-content">
        <div v-if="fs.loading" class="fs-loading">加载中...</div>
        <template v-else>
          <div
            v-for="child in fs.currentFolder()?.children"
            :key="child.id"
            class="fs-item"
            :class="{ selected: fs.selectedFile === child }"
            @click="child.type === 'folder' ? fs.navigateInto(child) : handleFileClick(child)"
          >
            <div class="fs-item-icon">
              <svg v-if="child.type === 'folder'" viewBox="0 0 1024 1024" width="36" height="36"><path d="M0 213.422h955.734c37.7 0 68.261 28.677 68.266 64.059V886.14c0 35.386-30.566 64.074-68.266 64.074H68.271C30.566 950.214 0 921.526 0 886.14V213.422z" fill="#ffc107"/><path d="M415.953 73.786H67.124C30.058 73.786 0.005 102.468 0 137.85v32.028h536.951l-37.23-53.303c-18.675-26.736-50.11-42.789-83.768-42.789z" fill="#ffc107"/></svg>
              <svg v-else viewBox="0 0 1024 1024" width="36" height="36"><path d="M640 0v256h256L640 0z" fill="#ccc"/><path d="M576 0H128v1024h768V320H576V0z" fill="#eee"/></svg>
            </div>
            <span class="fs-item-name">{{ child.name }}</span>
            <span v-if="child.fileData?.file_ext" class="fs-item-ext">.{{ child.fileData.file_ext }}</span>
          </div>
          <div v-if="!fs.currentFolder()?.children?.length" class="fs-empty">
            <p>此文件夹为空</p>
          </div>
        </template>
      </div>
    </div>
    <div v-if="fs.fileDetail" class="fs-preview">
      <div class="fs-preview-title">{{ fs.fileDetail.file_name }}</div>
      <div class="fs-preview-meta">
        <div class="fs-meta-row"><span class="fs-meta-label">文件类型:</span><span>{{ fs.fileDetail.file_ext ? '.' + fs.fileDetail.file_ext : '未知' }}</span></div>
        <div class="fs-meta-row"><span class="fs-meta-label">路径:</span><span>{{ fs.fileDetail.relative_path }}</span></div>
        <div class="fs-meta-row"><span class="fs-meta-label">大小:</span><span>{{ formatSize(fs.fileDetail.file_size) }}</span></div>
        <div class="fs-meta-row"><span class="fs-meta-label">创建时间:</span><span>{{ fs.fileDetail.created_at || '未知' }}</span></div>
        <div class="fs-meta-row"><span class="fs-meta-label">绝对路径:</span><span>{{ fs.fileDetail.absolute_path || '无' }}</span></div>
      </div>
    </div>

    <div v-if="showDownloadPrompt" class="dl-overlay" @click.self="showDownloadPrompt = false">
      <div class="dl-dialog">
        <div class="dl-titlebar">
          <span class="dl-title">文件下载</span>
          <button class="dl-close" @click="showDownloadPrompt = false">✕</button>
        </div>
        <div class="dl-body">
          <p>是否要下载此文件？</p>
          <p class="dl-name">{{ pendingDownload?.fileData?.file_name }}</p>
        </div>
        <div class="dl-footer">
          <button class="dl-btn" @click="confirmDownload">是</button>
          <button class="dl-btn" @click="showDownloadPrompt = false">否</button>
        </div>
      </div>
    </div>

    <a :href="downloadUrl" ref="downloadLinkEl" style="display:none"></a>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useFsStore } from '@/stores/fs'
import { getDownloadUrl } from '@/api'
import type { FsEntry } from '@/types'

const fs = useFsStore()

const showDownloadPrompt = ref(false)
const pendingDownload = ref<FsEntry | null>(null)
const downloadUrl = ref('')
const downloadLinkEl = ref<HTMLAnchorElement | null>(null)

function formatSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '未知'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function handleFileClick(entry: FsEntry) {
  fs.navigateInto(entry)
  if (entry.type === 'file') {
    showDownloadPrompt.value = true
    pendingDownload.value = entry
  }
}

function confirmDownload() {
  if (pendingDownload.value?.fileData) {
    downloadUrl.value = getDownloadUrl(pendingDownload.value.fileData.relative_path)
    setTimeout(() => {
      downloadLinkEl.value?.click()
    }, 50)
  }
  showDownloadPrompt.value = false
  pendingDownload.value = null
}

onMounted(() => {
  if (!fs.root.children || fs.root.children.length === 0) {
    fs.loadCategories()
  }
})
</script>

<style scoped>
.fs-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 12px;
}

.fs-toolbar {
  padding: 4px;
  background: #ece9d8;
  border-bottom: 1px solid #ccc;
}

.fs-btn {
  padding: 2px 8px;
  border: 1px solid #7f9db9;
  background: linear-gradient(to bottom, #ece9d8, #d4d0c8);
  cursor: pointer;
  font-size: 12px;
  font-family: Tahoma, sans-serif;
}

.fs-btn:active {
  background: linear-gradient(to bottom, #d4d0c8, #ece9d8);
}

.fs-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.fs-addressbar {
  padding: 4px 6px;
  background: #fff;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  gap: 6px;
}

.fs-label {
  font-weight: bold;
  color: #333;
  flex-shrink: 0;
}

.fs-path {
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fs-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.fs-sidebar {
  width: 180px;
  background: #fff;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  flex-shrink: 0;
}

.fs-sidebar-item {
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
}

.fs-sidebar-item:hover {
  background: #e8f0fe;
}

.fs-sidebar-item.active {
  background: #d4e0fc;
  font-weight: bold;
}

.fs-sidebar-item svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.fs-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
  padding: 8px;
  background: #fff;
}

.fs-loading {
  width: 100%;
  padding: 20px;
  text-align: center;
  color: #999;
}

.fs-item {
  width: 100px;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  border-radius: 2px;
  user-select: none;
  position: relative;
}

.fs-item:hover {
  background: #e8f0fe;
}

.fs-item.selected {
  background: #d4e0fc;
}

.fs-item-icon svg {
  width: 36px;
  height: 36px;
}

.fs-item-name {
  font-size: 11px;
  text-align: center;
  word-wrap: break-word;
  max-width: 100px;
  line-height: 1.2;
}

.fs-item-ext {
  font-size: 9px;
  color: #999;
  text-align: center;
}

.fs-empty {
  width: 100%;
  padding: 20px;
  text-align: center;
  color: #999;
}

.fs-preview {
  border-top: 1px solid #ccc;
  background: #fff;
}

.fs-preview-title {
  padding: 4px 8px;
  background: #ece9d8;
  font-weight: bold;
  font-size: 11px;
}

.fs-preview-meta {
  padding: 8px;
  font-size: 12px;
}

.fs-meta-row {
  display: flex;
  gap: 8px;
  padding: 2px 0;
}

.fs-meta-label {
  font-weight: bold;
  color: #333;
  min-width: 70px;
  flex-shrink: 0;
}

.dl-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.dl-dialog {
  background: #ece9d8;
  border: 2px solid #0831d9;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
  width: 320px;
  max-width: 90vw;
  font-family: Tahoma, sans-serif;
}

.dl-titlebar {
  background: linear-gradient(to bottom, #3c8df0, #245edb);
  color: white;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: bold;
}

.dl-close {
  background: none;
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 0 4px;
}

.dl-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dl-body {
  padding: 16px;
  text-align: center;
  font-size: 13px;
}

.dl-body p {
  margin: 0 0 8px;
}

.dl-name {
  font-weight: bold;
  color: #245edb;
  word-break: break-all;
}

.dl-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 0 16px 16px;
}

.dl-btn {
  min-width: 60px;
  padding: 4px 16px;
  background: linear-gradient(to bottom, #ece9d8, #d4d0c8);
  border: 1px solid #7f9db9;
  font-size: 13px;
  cursor: pointer;
  font-family: Tahoma, sans-serif;
}

.dl-btn:active {
  background: linear-gradient(to bottom, #d4d0c8, #ece9d8);
}

@media (max-width: 600px) {
  .fs-sidebar {
    width: 120px;
  }
  .fs-item {
    width: 80px;
  }
  .fs-item-icon svg {
    width: 28px;
    height: 28px;
  }
  .fs-item-name {
    font-size: 10px;
    max-width: 80px;
  }
}
</style>
