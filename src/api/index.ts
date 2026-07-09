const API_BASE = import.meta.env.VITE_API_BASE || '/tof/r1/api'
// const API_BASE = 'https://win-xp-kernel.onrender.com/tof/r1/api'

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

interface SystemInfoResponse extends ApiResponse {
  data?: {
    os_name?: string
    os_release?: string
    os_version?: string
    machine?: string
    hostname?: string
    cpu_count?: number
    cpu_model?: string
    mem_total_kb?: number
    mem_available_kb?: number
    ip_addresses?: Array<{ name: string; ip: string }>
    client_ip?: string
  }
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

export interface ArticleCategory {
  id: number
  name: string
  description?: string
}

export interface ArticleItem {
  id: number
  category_id: number
  title: string
  summary?: string
  content_md?: string
  view_count: number
  created_at?: string
  updated_at?: string
  keywords?: string[]
}

interface ArticleCategoriesResponse extends ApiResponse {
  data?: ArticleCategory[]
}

interface ArticlesResponse extends ApiResponse {
  data?: ArticleItem[]
}

interface ArticleResponse extends ApiResponse {
  data?: ArticleItem
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
  getSystemInfo(): Promise<SystemInfoResponse> {
    return request('/system/info')
  },
  getArticleCategories(): Promise<ArticleCategoriesResponse> {
    return request('/article_categories')
  },
  getArticles(categoryId?: number): Promise<ArticlesResponse> {
    const qs = categoryId ? `?category_id=${categoryId}` : ''
    return request('/articles' + qs)
  },
  getArticle(id: number): Promise<ArticleResponse> {
    return request(`/articles/${id}`)
  },
  incrementView(id: number): Promise<ApiResponse> {
    return request(`/articles/${id}/view`, { method: 'PUT' })
  },
}
