import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  function load() {
    const saved = localStorage.getItem('auth')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        token.value = data.token
        user.value = data.user
      } catch {
        localStorage.removeItem('auth')
      }
    }
  }

  function save() {
    localStorage.setItem('auth', JSON.stringify({ token: token.value, user: user.value }))
  }

  async function login(email: string, password: string): Promise<string | null> {
    const res = await api.login({ user_email: email, user_password: password })
    if (res.code === 200 && res.token) {
      token.value = res.token
      user.value = {
        user_id: res.user_id!,
        user_name: res.user_name!,
        user_email: res.user_email!,
        user_icon: res.user_icon,
      }
      save()
      return null
    }
    return res.msg || '登录失败'
  }

  async function register(
    name: string,
    email: string,
    password: string,
    icon?: string,
  ): Promise<string | null> {
    const res = await api.register({
      user_name: name,
      user_email: email,
      user_password: password,
      user_icon: icon,
    })
    if (res.code === 200) {
      return null
    }
    return res.msg || '注册失败'
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth')
  }

  load()

  return { user, token, isLoggedIn, login, register, logout }
})
