import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import type { FsEntry, Category, FileResource } from '@/types'

export const useFsStore = defineStore('fs', () => {
  const root = ref<FsEntry>({ id: 'root', name: '我的电脑', type: 'folder', children: [] })
  const currentPath = ref<FsEntry[]>([root.value])
  const selectedFile = ref<FsEntry | null>(null)
  const fileDetail = ref<FileResource | null>(null)
  const loading = ref(false)

  function currentFolder() {
    return currentPath.value[currentPath.value.length - 1]
  }

  async function loadCategories() {
    loading.value = true
    try {
      const res = await api.getCategories()
      if (res.code === 200 && res.data) {
        const flat: Category[] = res.data
        const children = buildTree(flat, undefined)
        root.value.children = children
      }
    } catch (e) {
      console.error('Failed to load categories', e)
    } finally {
      loading.value = false
    }
  }

  function buildTree(flat: Category[], parentId: number | undefined): FsEntry[] {
    return flat
      .filter((c) => c.parent_id === parentId || (!c.parent_id && parentId === undefined))
      .map((cat) => {
        const subs = buildTree(flat, cat.id)
        const entry: FsEntry = {
          id: `cat-${cat.id}`,
          name: cat.name,
          type: 'folder',
          categoryId: cat.id,
          children: subs.length > 0 ? subs : undefined,
        }
        return entry
      })
  }

  async function navigateInto(entry: FsEntry) {
    if (entry.type === 'folder') {
      if (entry.categoryId !== undefined && (!entry.children || entry.children.length === 0)) {
        await loadFilesFor(entry)
      }
      currentPath.value = [...currentPath.value, entry]
      selectedFile.value = null
      fileDetail.value = null
    } else {
      selectedFile.value = entry
      fileDetail.value = entry.fileData ?? null
    }
  }

  async function loadFilesFor(entry: FsEntry) {
    if (entry.categoryId === undefined) return
    loading.value = true
    try {
      const res = await api.getFiles(entry.categoryId)
      if (res.code === 200 && res.data) {
        entry.children = res.data.map((f) => ({
          id: `file-${f.id}`,
          name: f.file_name,
          type: 'file' as const,
          categoryId: f.category_id,
          fileData: f,
        }))
      }
    } catch (e) {
      console.error('Failed to load files', e)
    } finally {
      loading.value = false
    }
  }

  function navigateUp() {
    if (currentPath.value.length > 1) {
      currentPath.value.pop()
      selectedFile.value = null
      fileDetail.value = null
    }
  }

  function navigateTo(index: number) {
    if (index < currentPath.value.length) {
      currentPath.value = currentPath.value.slice(0, index + 1)
      selectedFile.value = null
      fileDetail.value = null
    }
  }

  function getBreadcrumbs() {
    return currentPath.value.map((n) => n.name)
  }

  return {
    root, currentPath, selectedFile, fileDetail, loading,
    currentFolder, loadCategories, navigateInto, navigateUp, navigateTo, getBreadcrumbs,
  }
})
