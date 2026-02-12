export function getApiBase() {
  const envBase = import.meta?.env?.VITE_API_BASE
  if (envBase) return envBase.replace(/\/$/, '')

  // On Cloudflare Pages preview domains, proxy redirects can be flaky depending on project settings.
  // Default to the Worker API origin.
  const host = window.location.hostname
  if (host.endsWith('pages.dev')) return 'https://anome-one-dashboard-api.tankopenclaw.workers.dev'

  return ''
}

export async function apiGet(path) {
  const base = getApiBase()
  const url = base ? `${base}${path}` : path
  const token = window.localStorage.getItem('anome_session')
  const res = await fetch(url, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`)
  }
  return res.json()
}

export async function fetchViewData(viewId, params = {}) {
  const qs = new URLSearchParams()
  if (params.from) qs.set('from', params.from)
  if (params.to) qs.set('to', params.to)
  const q = qs.toString()
  return apiGet(`/api/views/${encodeURIComponent(viewId)}/data${q ? `?${q}` : ''}`)
}
