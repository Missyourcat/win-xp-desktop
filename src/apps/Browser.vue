<template>
  <div class="browser-app">
    <div class="browser-toolbar">
      <button class="browser-btn" @click="goBack" :disabled="historyIndex <= 0">◀</button>
      <button class="browser-btn" @click="goForward" :disabled="historyIndex >= history.length - 1">▶</button>
      <button class="browser-btn" @click="refresh">⟳</button>
      <input
        class="browser-url"
        v-model="urlInput"
        @keydown.enter="navigate"
        placeholder="输入网址..."
      />
    </div>
    <div class="browser-body">
      <iframe
        v-if="currentUrl"
        :src="currentUrl"
        class="browser-iframe"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerpolicy="no-referrer"
      ></iframe>
      <div v-else class="browser-home">
        <div class="browser-logo">
          <svg viewBox="0 0 1024 1024" width="80" height="80">
            <path d="M981.333 533.333c0 17.067 0 36.267-2.133 53.334H373.333c0 104.533 91.734 181.333 192 181.333 68.267 0 134.4-34.133 168.534-93.867h221.866c-59.733 168.534-217.6 281.6-396.8 281.6-64 0-128-14.933-185.6-44.8C313.6 940.8 232.533 972.8 166.4 972.8c-89.6 0-123.733-53.333-123.733-138.667 0-49.066 10.666-96 25.6-142.933 6.4-29.867 42.666-91.733 57.6-121.6 64-115.2 147.2-230.4 249.6-317.867-78.934 34.134-168.534 121.6-224 185.6 42.666-189.866 213.333-326.4 407.466-326.4h25.6c64-29.866 155.734-61.866 228.267-61.866 83.2 0 157.867 32 157.867 128 0 49.066-19.2 104.533-40.534 151.466 34.134 61.867 51.2 134.4 51.2 204.8z" fill="#245edb"/>
          </svg>
        </div>
        <h2>Windows XP 浏览器</h2>
        <div class="browser-bookmarks">
          <div class="browser-bookmark" @click="gotoPreset('https://www.w3schools.com')">
            <span>W3Schools</span>
          </div>
          <div class="browser-bookmark" @click="gotoPreset('https://example.com')">
            <span>Example</span>
          </div>
          <div class="browser-bookmark" @click="gotoPreset('https://www.wikipedia.org')">
            <span>Wikipedia</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const urlInput = ref('')
const currentUrl = ref('')
const history = ref<string[]>([])
const historyIndex = ref(-1)

function navigate() {
  let url = urlInput.value.trim()
  if (!url) return
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  urlInput.value = url
  currentUrl.value = url
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(url)
  historyIndex.value = history.value.length - 1
}

function gotoPreset(url: string) {
  urlInput.value = url
  navigate()
}

function goBack() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    currentUrl.value = history.value[historyIndex.value]
    urlInput.value = currentUrl.value
  }
}

function goForward() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    currentUrl.value = history.value[historyIndex.value]
    urlInput.value = currentUrl.value
  }
}

function refresh() {
  if (currentUrl.value) {
    const tmp = currentUrl.value
    currentUrl.value = ''
    setTimeout(() => { currentUrl.value = tmp }, 50)
  }
}
</script>

<style scoped>
.browser-app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.browser-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: #ece9d8;
  border-bottom: 1px solid #ccc;
}

.browser-btn {
  width: 28px;
  height: 24px;
  border: 1px solid #7f9db9;
  background: linear-gradient(to bottom, #ece9d8, #d4d0c8);
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.browser-btn:active {
  background: linear-gradient(to bottom, #d4d0c8, #ece9d8);
}

.browser-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.browser-url {
  flex: 1;
  padding: 3px 6px;
  border: 1px solid #7f9db9;
  font-size: 12px;
  font-family: Tahoma, sans-serif;
}

.browser-body {
  flex: 1;
  overflow: hidden;
}

.browser-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.browser-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  gap: 16px;
  background: #fff;
}

.browser-logo svg {
  width: 80px;
  height: 80px;
}

.browser-home h2 {
  font-size: 18px;
  color: #333;
  font-weight: normal;
  margin: 0;
}

.browser-bookmarks {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.browser-bookmark {
  padding: 8px 16px;
  background: #ece9d8;
  border: 1px solid #7f9db9;
  cursor: pointer;
  font-size: 13px;
  border-radius: 2px;
}

.browser-bookmark:hover {
  background: #d4d0c8;
}
</style>
