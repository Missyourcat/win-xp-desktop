// const API_BASE = import.meta.env.VITE_API_BASE || '/tof/r1/api'
const API_BASE = 'https://win-xp-kernel.onrender.com/tof/r1/api'

export function getDownloadUrl(relativePath: string): string {
  return `${API_BASE}/file/download?path=${encodeURIComponent(relativePath)}`
}

interface ApiResponse {
  code: number
  msg: string
  [key: string]: unknown
}

interface LoginResponse extends ApiResponse {
  token?: string
  user_id?: number
  user_name?: string
  user_email?: string
  user_icon?: string
}

interface RegisterResponse extends ApiResponse {
  user_id?: number
  user_name?: string
  user_email?: string
  user_icon?: string
}

interface DesktopIconsResponse extends ApiResponse {
  data?: Array<{
    desktop_id: number
    desktop_name: string
    desktop_image: string
    desktop_url: string
  }>
}

interface CategoriesResponse extends ApiResponse {
  data?: Array<{
    id: number
    name: string
    parent_id?: number
    path?: string
    sort?: number
  }>
}

interface FilesResponse extends ApiResponse {
  data?: Array<{
    id: number
    category_id: number
    file_name: string
    file_ext?: string
    relative_path: string
    absolute_path?: string
    file_size?: number
    created_at?: string
  }>
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  return res.json()
}

export const api = {
  register(data: {
    user_name: string
    user_email: string
    user_password: string
    user_icon?: string
  }): Promise<RegisterResponse> {
    return request('/register', { method: 'POST', body: JSON.stringify(data) })
  },
  login(data: {
    user_email: string
    user_password: string
  }): Promise<LoginResponse> {
    return request('/login', { method: 'POST', body: JSON.stringify(data) })
  },
  getDesktopIcons(): Promise<DesktopIconsResponse> {
    return request('/desktop_icons')
  },
  getCategories(): Promise<CategoriesResponse> {
    return request('/categories')
  },
  getFiles(categoryId: number): Promise<FilesResponse> {
    return request(`/files?category_id=${categoryId}`)
  },
}
