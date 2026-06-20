export interface User {
  user_id: number
  user_name: string
  user_email: string
  user_icon?: string
}

export interface DesktopIcon {
  desktop_id: number
  desktop_name: string
  desktop_image: string
  desktop_url: string
}

export interface AppWindow {
  id: string
  title: string
  component: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  zIndex: number
  data?: Record<string, unknown>
}

export interface Category {
  id: number
  name: string
  parent_id?: number
  path?: string
  sort?: number
}

export interface FileResource {
  id: number
  category_id: number
  file_name: string
  file_ext?: string
  relative_path: string
  absolute_path?: string
  file_size?: number
  created_at?: string
}

export interface SystemInfo {
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

export interface FsEntry {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: FsEntry[]
  categoryId?: number
  fileData?: FileResource
}
