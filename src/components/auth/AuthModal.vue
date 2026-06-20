<template>
  <div class="auth-overlay" @click.self="$emit('close')">
    <div class="auth-window">
      <div class="auth-titlebar">
        <span class="auth-title">{{ isLogin ? '登录' : '注册' }}</span>
        <button class="auth-close" @click="$emit('close')">✕</button>
      </div>
      <div class="auth-tabs">
        <button :class="{ active: isLogin }" @click="isLogin = true">登录</button>
        <button :class="{ active: !isLogin }" @click="isLogin = false">注册</button>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <template v-if="!isLogin">
          <label>用户名</label>
          <input v-model="name" type="text" required placeholder="请输入用户名" />
        </template>

        <label>邮箱</label>
        <input v-model="email" type="email" required placeholder="请输入邮箱" />

        <label>密码</label>
        <input v-model="password" type="password" required placeholder="请输入密码" />

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button type="submit" class="auth-submit" :disabled="loading">
          {{ loading ? '处理中...' : isLogin ? '登录' : '注册' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ close: [] }>()

const auth = useAuthStore()

const isLogin = ref(true)
const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    if (isLogin.value) {
      const err = await auth.login(email.value, password.value)
      if (err) {
        error.value = err
      } else {
        emit('close')
      }
    } else {
      if (!name.value.trim()) {
        error.value = '请输入用户名'
        return
      }
      const err = await auth.register(name.value, email.value, password.value)
      if (err) {
        error.value = err
      } else {
        const err2 = await auth.login(email.value, password.value)
        if (err2) {
          error.value = '注册成功，请手动登录'
        } else {
          emit('close')
        }
      }
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.auth-window {
  background: #ece9d8;
  border: 2px solid #0831d9;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
  width: 360px;
  max-width: 90vw;
  font-family: Tahoma, sans-serif;
}

.auth-titlebar {
  background: linear-gradient(to bottom, #3c8df0, #245edb);
  color: white;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: bold;
}

.auth-close {
  background: none;
  border: none;
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 0 4px;
}

.auth-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.auth-tabs button {
  flex: 1;
  padding: 8px;
  border: none;
  background: #d4d0c8;
  cursor: pointer;
  font-size: 13px;
  font-family: Tahoma, sans-serif;
}

.auth-tabs button.active {
  background: #ece9d8;
  font-weight: bold;
}

.auth-form {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auth-form label {
  font-size: 12px;
  font-weight: bold;
  color: #333;
}

.auth-form input {
  padding: 6px 8px;
  border: 1px solid #7f9db9;
  font-size: 13px;
  font-family: Tahoma, sans-serif;
}

.auth-form input:focus {
  outline: none;
  border-color: #0831d9;
}

.auth-error {
  color: #c00;
  font-size: 12px;
  margin: 0;
}

.auth-submit {
  margin-top: 8px;
  padding: 6px 16px;
  background: linear-gradient(to bottom, #ece9d8, #d4d0c8);
  border: 1px solid #7f9db9;
  font-size: 13px;
  cursor: pointer;
  font-family: Tahoma, sans-serif;
}

.auth-submit:active {
  background: linear-gradient(to bottom, #d4d0c8, #ece9d8);
}

.auth-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
