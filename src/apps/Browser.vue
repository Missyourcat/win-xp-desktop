<template>
  <div class="browser-app">
    <div class="ie6-toolbar">
      <button class="ie6-btn" @click="goBack" :disabled="!canGoBack">◀</button>
      <button class="ie6-btn" @click="goForward" :disabled="!canGoForward">▶</button>
      <button class="ie6-btn" @click="goHome">⌂</button>
      <button class="ie6-btn" @click="refresh">⟳</button>
      <div class="ie6-address-bar">
        <span class="address-label">地址</span>
        <div class="address-input">{{ currentPath }}</div>
      </div>
      <button v-if="view === 'detail'" class="ie6-btn toc-btn" @click="showToc = !showToc" :class="{ active: showToc }">目录</button>
    </div>

    <div v-if="loading" class="ie6-loading">正在加载...</div>

    <div v-else-if="view === 'categories'" class="ie6-body">
      <div class="w3-header">
        <div class="w3-title">文章目录</div>
        <button class="w3-search-btn" @click="goAllArticles">搜索文章</button>
      </div>
      <div class="w3-filter"><input v-model="catFilter" placeholder="搜索目录名称..." /></div>
      <div v-if="catFilter && filteredCategories.length === 0" class="w3-none">无匹配目录</div>
      <div class="w3-cat-grid">
        <div v-for="cat in filteredCategories" :key="cat.id" class="w3-cat-card" @click="openCategory(cat)">
          <div class="w3-cat-card-title">{{ cat.name }}</div>
          <div v-if="cat.description" class="w3-cat-card-desc">{{ cat.description }}</div>
        </div>
      </div>
    </div>

    <!-- Articles (secondary browser) -->
    <div v-else-if="view === 'articles'" class="ie6-body">
      <div class="ie6-header">
        <span class="back-link" @click="goHome">← 返回</span>
        {{ currentCategory?.name || '文章列表' }}
      </div>
      <div class="search-panel">
        <div class="sr"><label>标题</label><input v-model="f.title" placeholder="输入标题" /></div>
        <div class="sr"><label>摘要</label><input v-model="f.summary" placeholder="输入摘要" /></div>
        <div class="sr"><label>关键词</label><input v-model="f.keywords" placeholder="输入关键词" /></div>
        <div class="sr">
          <label>排序</label>
          <select v-model="sortField"><option value="created_at">创建时间</option><option value="view_count">浏览量</option></select>
          <select v-model="sortOrder"><option value="desc">降序</option><option value="asc">升序</option></select>
          <span class="rc">共 {{ filtered.length }} 条</span>
        </div>
      </div>
      <div class="art-list">
        <div v-for="a in filtered" :key="a.id" class="art-item" @click="openArticle(a)">
          <div class="art-title"><b>{{ a.title }}</b></div>
          <div v-if="a.summary" class="art-summary">{{ a.summary }}</div>
          <div v-if="a.keywords?.length" class="art-kw">{{ a.keywords.join(', ') }}</div>
          <div class="art-footer">
            <span class="art-stat">{{ a.view_count }} 浏览</span>
            <span class="art-date">{{ fd(a.created_at) }}</span>
            <span v-if="a.updated_at" class="art-date">修改于 {{ fd(a.updated_at) }}</span>
          </div>
        </div>
        <div v-if="filtered.length === 0" class="ar-empty">无匹配文章</div>
      </div>
    </div>

    <div v-else-if="view === 'detail'" class="detail-root">
      <div class="detail-body">
        <div v-if="showToc" class="detail-toc">
          <div class="toc-title">目录</div>
          <div v-for="h in toc" :key="h.id" class="toc-item" :style="{ paddingLeft: (12 + (h.level - 1) * 16) + 'px' }" @click="scrollTo(h.id)">{{ h.text }}</div>
          <div v-if="toc.length === 0" class="toc-empty">无标题</div>
        </div>
        <div class="detail-page">
          <div class="page-header">
            <h1 class="doc-title">{{ article?.title }}</h1>
            <div v-if="article?.summary" class="doc-summary">{{ article.summary }}</div>
            <div v-if="article?.keywords?.length" class="doc-keywords"><b>关键词：</b>{{ article.keywords.join('、') }}</div>
            <div class="doc-meta">
              <span v-if="article?.created_at">创建: {{ fd(article.created_at) }}</span>
              <span v-if="article?.updated_at">更新: {{ fd(article.updated_at) }}</span>
              <span>浏览: {{ article?.view_count }}</span>
            </div>
          </div>
          <div class="page-divider"></div>
          <div class="page-body" v-html="bodyHtml"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api'
import type { ArticleCategory, ArticleItem } from '@/api'
import { useWindowsStore } from '@/stores/windows'
import { marked } from 'marked'

const props = defineProps<{ data?: Record<string, unknown> }>()
const wins = useWindowsStore()

const view = ref<'categories' | 'articles' | 'detail'>('categories')
const categories = ref<ArticleCategory[]>([])
const articles = ref<ArticleItem[]>([])
const currentCategory = ref<ArticleCategory | null>(null)
const article = ref<ArticleItem | null>(null)
const currentPath = ref('文章目录')
const loading = ref(false)
const showToc = ref(false)
const hist = ref<{v: string; c?: ArticleCategory; id?: number}[]>([])
const hi = ref(-1)

const searchText = ref('')
const catFilter = ref('')
const f = ref({ title: '', summary: '', keywords: '' })
const sortField = ref<'created_at' | 'view_count'>('created_at')
const sortOrder = ref<'desc' | 'asc'>('desc')

const canGoBack = computed(() => hi.value > 0)
const canGoForward = computed(() => hi.value < hist.value.length - 1)

const filteredCategories = computed(() => {
  const q = catFilter.value.toLowerCase().trim()
  if (!q) return categories.value
  return categories.value.filter(c => c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q))
})

interface TocItem { id: string; text: string; level: number }

function headingId(text: string): string {
  return text.trim().toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || 'h'
}

const toc = computed<TocItem[]>(() => {
  const r: TocItem[] = []
  const re = /^(#{1,6})\s+(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(article.value?.content_md || '')) !== null) {
    const text = m[2].trim()
    r.push({ id: headingId(text), text, level: m[1].length })
  }
  return r
})

const bodyHtml = computed(() => {
  const md = article.value?.content_md || ''
  if (!md) return ''
  let html = marked.parse(md, { gfm: true }) as string
  return html.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/g, (s, lvl, attrs, txt) => {
    if (/id=["']/.test(attrs)) return s
    return `<h${lvl}${attrs} id="${headingId(txt)}">${txt}</h${lvl}>`
  })
})

const filtered = computed(() => {
  let l = articles.value.slice()
  const t = f.value.title.toLowerCase().trim(), s = f.value.summary.toLowerCase().trim(), k = f.value.keywords.toLowerCase().trim()
  if (t) l = l.filter(a => a.title.toLowerCase().includes(t))
  if (s) l = l.filter(a => (a.summary || '').toLowerCase().includes(s))
  if (k) l = l.filter(a => (a.keywords || []).some(x => x.toLowerCase().includes(k)))
  l.sort((a, b) => {
    if (sortField.value === 'view_count') return sortOrder.value === 'asc' ? a.view_count - b.view_count : b.view_count - a.view_count
    const va = a.created_at || '', vb = b.created_at || ''
    return sortOrder.value === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
  })
  return l
})

async function doSearch() {
  if (!searchText.value.trim()) return
  loading.value = true; view.value = 'articles'
  try { const r = await api.getArticles(0); if (r.code === 200 && r.data) articles.value = r.data } catch(e) { console.error(e) }
  finally { loading.value = false }
}

async function goAllArticles() {
  loading.value = true; view.value = 'articles'; currentCategory.value = null; currentPath.value = '全部文章'; push('articles')
  try { const r = await api.getArticles(0); if (r.code === 200 && r.data) articles.value = r.data } catch(e) { console.error(e) }
  finally { loading.value = false }
}

function push(v: string, c?: ArticleCategory, id?: number) {
  hist.value = hist.value.slice(0, hi.value + 1)
  hist.value.push({ v, c, id })
  hi.value = hist.value.length - 1
}

async function goBack() { if (canGoBack.value) { hi.value--; await restore(hist.value[hi.value]) } }
async function goForward() { if (canGoForward.value) { hi.value++; await restore(hist.value[hi.value]) } }

async function restore(st: {v: string; c?: ArticleCategory; id?: number}) {
  view.value = st.v as any
  if (st.v === 'categories') { currentPath.value = '文章目录'; currentCategory.value = null; article.value = null }
  else if (st.v === 'articles' && st.c) { currentCategory.value = st.c; currentPath.value = st.c.name; loading.value = true; try { await loadArticles(st.c.id) } catch(e) { console.error(e) } finally { loading.value = false } }
  else if (st.v === 'detail' && st.id) { loading.value = true; try { await loadArticleDetail(st.id) } catch(e) { console.error(e) } finally { loading.value = false } }
}

function goHome() { view.value = 'categories'; currentPath.value = '文章目录'; article.value = null; searchText.value = ''; push('categories') }
async function refresh() { await loadCategories(); if (article.value) { loading.value = true; try { await loadArticleDetail(article.value.id) } catch(e) { console.error(e) } finally { loading.value = false } } }
function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

async function loadCategories() { loading.value = true; try { const r = await api.getArticleCategories(); if (r.code === 200 && r.data) categories.value = r.data } catch(e) { console.error(e) } finally { loading.value = false } }

function openCategory(cat: ArticleCategory) {
  wins.openWindow({ id: `bc-${cat.id}-${Date.now()}`, title: `文章 - ${cat.name}`, component: 'Browser', x: 60, y: 60, width: 760, height: 560, data: { categoryId: cat.id, categoryName: cat.name, view: 'articles' } })
}

async function initFromData() {
  const d = props.data; if (!d) return
  if (d.view === 'articles' && d.categoryId) { currentCategory.value = { id: d.categoryId as number, name: (d.categoryName as string) || '' }; currentPath.value = currentCategory.value.name; view.value = 'articles'; push('articles', currentCategory.value); await loadArticles(d.categoryId as number) }
  if (d.view === 'detail' && d.categoryId) { view.value = 'detail'; push('detail', undefined, d.articleId as number); await loadArticleDetail(d.articleId as number) }
}

async function loadArticles(cid: number) { loading.value = true; try { const r = await api.getArticles(cid); if (r.code === 200 && r.data) articles.value = r.data } catch(e) { console.error(e) } finally { loading.value = false } }

async function openArticle(a: ArticleItem) {
  view.value = 'detail'; currentPath.value = a.title; push('detail', undefined, a.id)
  loading.value = true
  try { await loadArticleDetail(a.id); await api.incrementView(a.id); a.view_count++ } catch(e) { console.error(e) } finally { loading.value = false }
}

async function loadArticleDetail(id: number) { try { const r = await api.getArticle(id); if (r.code === 200 && r.data) { article.value = r.data; currentPath.value = r.data.title } } catch(e) { console.error(e) } }

function fd(d?: string): string { return d ? d.slice(0, 10) : '-' }

onMounted(async () => { await initFromData(); if (view.value === 'categories') await loadCategories() })
</script>

<style scoped>
.browser-app { display: flex; flex-direction: column; height: 100%; font-family: Tahoma, 'Segoe UI', Geneva, sans-serif; font-size: 12px; color: #000; background: #ece9d8; }
.ie6-toolbar { display: flex; align-items: center; gap: 2px; padding: 3px 4px; background: linear-gradient(to bottom, #f0efe8, #d4d0c8); border-bottom: 1px solid #a7a394; flex-shrink: 0; }
.ie6-btn { width: 24px; height: 22px; border: 1px solid #7f9db9; background: linear-gradient(to bottom, #ece9d8, #d4d0c8); cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; padding: 0; color: #1a1a1a; border-radius: 2px; }
.ie6-btn:hover { border-color: #3c7fb1; background: linear-gradient(to bottom, #e8f0fe, #d4e8f8); }
.ie6-btn:active { background: linear-gradient(to bottom, #d4d0c8, #ece9d8); }
.ie6-btn:disabled { opacity: .35; cursor: default; border-color: #b0ad9a; }
.ie6-btn.active { background: linear-gradient(to bottom, #d4e8f8, #b8d4f0); border-color: #3c7fb1; }
.toc-btn { width: auto; padding: 0 6px; }
.ie6-address-bar { flex: 1; margin-left: 4px; display: flex; align-items: center; gap: 2px; }
.address-label { font-size: 11px; font-weight: bold; color: #1a1a1a; white-space: nowrap; }
.address-input { flex: 1; padding: 2px 5px; background: #fff; border: 1px solid #7f9db9; border-radius: 2px; font-size: 11px; line-height: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #333; }
.ie6-loading { display: flex; align-items: center; justify-content: center; flex: 1; color: #666; font-size: 12px; background: #fff; }
.ie6-body { flex: 1; overflow-y: auto; background: #fff; padding: 12px 14px; }
.ie6-header { font-size: 14px; font-weight: bold; color: #0c3b6b; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.back-link { color: #0563c1; cursor: pointer; font-size: 11px; font-weight: normal; }
.back-link:hover { text-decoration: underline; }
.w3-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.w3-title { font-size: 20px; font-weight: bold; color: #111827; }
.w3-search-btn { padding: 6px 14px; border: 1px solid #7f9db9; background: linear-gradient(to bottom, #ece9d8, #d4d0c8); cursor: pointer; font-size: 11px; border-radius: 2px; }
.w3-search-btn:hover { background: linear-gradient(to bottom, #e8f0fe, #d4e8f8); }
.w3-filter { margin-bottom: 10px; }
.w3-filter input { width: 100%; padding: 5px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; box-sizing: border-box; }
.w3-filter input:focus { border-color: #4a90d9; outline: none; }
.w3-none { text-align: center; color: #999; padding: 20px 0; font-size: 12px; }
.w3-cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.w3-cat-card { border: 1px solid #e0e0e0; border-radius: 6px; padding: 16px; cursor: pointer; background: #fff; transition: box-shadow .15s; }
.w3-cat-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.1); border-color: #4a90d9; }
.w3-cat-card-title { font-size: 15px; font-weight: 600; color: #1a1a2e; margin-bottom: 6px; }
.w3-cat-card-desc { font-size: 12px; color: #666; line-height: 1.5; }
.w3-search input { padding: 6px 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; width: 200px; }
.w3-search input:focus { border-color: #4a90d9; outline: none; box-shadow: 0 0 0 2px rgba(74,144,217,.2); }
.search-panel { background: #f8f8f8; border: 1px solid #d0d0d0; padding: 8px 10px; margin-bottom: 10px; }
.sr { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.sr label { width: 44px; font-size: 11px; font-weight: bold; color: #333; text-align: right; flex-shrink: 0; }
.sr input { flex: 1; padding: 2px 4px; border: 1px solid #a7a394; font-size: 11px; }
.sr select { padding: 2px 4px; border: 1px solid #a7a394; font-size: 11px; background: #fff; }
.rc { margin-left: auto; font-size: 11px; color: #666; }
.ar-empty { padding: 20px; text-align: center; color: #999; }
.art-list { display: flex; flex-direction: column; gap: 10px; }
.art-item { border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px 14px; cursor: pointer; background: #fff; }
.art-item:hover { border-color: #3c7fb1; background: #f5f9ff; }
.art-title { font-size: 14px; color: #0563c1; margin-bottom: 4px; }
.art-title b { font-weight: 600; }
.art-summary { font-size: 12px; color: #444; line-height: 1.6; margin-bottom: 6px; }
.art-footer { display: flex; gap: 10px; font-size: 10px; color: #888; flex-wrap: wrap; }
.art-kw { color: #1f4a7a; }
.detail-root { flex: 1; display: flex; flex-direction: column; background: #fff; overflow: hidden; }
.detail-body { flex: 1; display: flex; overflow: hidden; }
.detail-toc { width: 170px; flex-shrink: 0; overflow-y: auto; border-right: 1px solid #d0d0d0; background: #fafafa; padding: 8px 0; }
.toc-title { font-size: 11px; font-weight: bold; color: #333; padding: 4px 10px 4px 12px; border-bottom: 1px solid #d0d0d0; margin-bottom: 4px; }
.toc-item { padding: 3px 10px; font-size: 11px; color: #0563c1; cursor: pointer; }
.toc-item:hover { background: #e8f0fe; }
.toc-empty { padding: 8px 12px; font-size: 11px; color: #999; }
.detail-page { flex: 1; overflow-y: auto; padding: 24px 32px; }
.page-header { margin-bottom: 16px; }
.doc-title { font-size: 22px; font-weight: bold; color: #0c3b6b; margin: 0 0 10px; padding-bottom: 8px; border-bottom: 2px solid #b0c4de; }
.doc-summary { font-size: 13px; color: #444; line-height: 1.7; padding: 10px 14px; background: #f8fafc; border-left: 3px solid #3c7fb1; margin: 8px 0; border-radius: 0 4px 4px 0; }
.doc-keywords { font-size: 12px; color: #1f4a7a; margin: 6px 0; }
.doc-meta { display: flex; gap: 14px; font-size: 11px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #d0d0d0; }
.page-divider { border: none; border-top: 3px double #c0c0c0; margin: 0 0 18px; position: relative; }
.page-divider::after { content: '▼ 正文 ▼'; position: absolute; top: -8px; left: 50%; transform: translateX(-50%); background: #fff; padding: 0 14px; font-size: 10px; color: #aaa; letter-spacing: 1px; }
.page-body { line-height: 1.6; font-size: 13px; color: #334155; }

@media (min-width: 768px) {
  .detail-page { max-width: 50%; margin: 0 auto; padding: 32px 0; }
}
@media (max-width: 767px) {
  .detail-page { padding: 16px; }
}
</style>

<style>
.page-body h1 { font-size: 1.6em; margin: .5em 0 .3em; color: #111827; border-bottom: 2px solid #e2e8f0; padding-bottom: .25em; font-weight: 700; }
.page-body h2 { font-size: 1.35em; margin: .5em 0 .25em; color: #111827; border-bottom: 1px solid #e2e8f0; padding-bottom: .15em; font-weight: 700; }
.page-body h3 { font-size: 1.15em; margin: .4em 0 .2em; color: #1e293b; font-weight: 700; }
.page-body h4 { font-size: 1.05em; margin: .4em 0 .15em; color: #334155; font-weight: 700; }
.page-body p { margin: .5em 0; color: #334155; }
.page-body strong { font-weight: 700; color: #0f172a; }
.page-body em { font-style: italic; }
.page-body code { background: #f1f5f9; padding: 1px 5px; border-radius: 3px; font-size: .9em; font-family: Consolas, Monaco, monospace; }
.page-body pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; overflow-x: auto; margin: .6em 0; }
.page-body pre code { background: none; padding: 0; font-size: .88em; color: inherit; }
.page-body table { border-collapse: collapse; width: 100%; margin: .6em 0; font-size: .92em; }
.page-body th, .page-body td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
.page-body th { background: #f1f5f9; font-weight: 600; color: inherit; }
.page-body td { color: #334155; }
.page-body [align=left] { text-align: left; }
.page-body [align=center] { text-align: center; }
.page-body [align=right] { text-align: right; }
.page-body img { max-width: 100%; height: auto; border-radius: 4px; transition: opacity .15s; display: block; margin: 6px 0; }
.page-body img:hover { opacity: .8; }
.page-body blockquote { border-left: 3px solid #2563eb; padding: 6px 14px; margin: .6em 0; background: #f8fafc; color: #475569; border-radius: 0 4px 4px 0; }
.page-body ul, .page-body ol { padding-left: 22px; margin: .5em 0; color: #334155; }
.page-body li { margin: .2em 0; color: #334155; }
.page-body a { color: #2563eb; text-decoration: none; }
.page-body a:hover { text-decoration: underline; }
.page-body hr { border: none; border-top: 2px solid #e2e8f0; margin: .8em 0; }
</style>