import type { Env, Role } from '../types'

export type AllowlistEntry = {
  email: string
  role: Role
  addedAt: string
}

export type StoredUser = {
  email: string
  name?: string
  role: Role
  picture?: string
  createdAt: string
  lastLoginAt?: string
}

const KEY_ALLOWLIST = 'allowlist:entries'
const KEY_USER = (email: string) => `users:${email.toLowerCase()}`

export async function kvGetAllowlist(env: Env): Promise<AllowlistEntry[]> {
  const raw = await env.ANOME_DASH_KV.get(KEY_ALLOWLIST)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

export async function kvSetAllowlist(env: Env, entries: AllowlistEntry[]) {
  await env.ANOME_DASH_KV.put(KEY_ALLOWLIST, JSON.stringify(entries))
}

export async function kvEnsureAllowlistSeeded(env: Env) {
  const entries = await kvGetAllowlist(env)
  if (entries.length) return entries

  const seeded = (env.GOOGLE_ALLOWLIST || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((email) => ({ email, role: email === env.SUPERADMIN_EMAIL.toLowerCase() ? 'superadmin' : 'user', addedAt: new Date().toISOString() }))

  if (seeded.length) {
    await kvSetAllowlist(env, seeded)
    return seeded
  }

  return []
}

export async function kvIsAllowlisted(env: Env, email: string) {
  const entries = await kvEnsureAllowlistSeeded(env)
  if (entries.length === 0) return true
  return entries.some((e) => e.email === email.toLowerCase())
}

export async function kvGetAllowlistRole(env: Env, email: string): Promise<Role | null> {
  const entries = await kvEnsureAllowlistSeeded(env)
  const hit = entries.find((e) => e.email === email.toLowerCase())
  return hit?.role ?? null
}

export async function kvUpsertUserFromLogin(env: Env, user: { email: string; name?: string; picture?: string; role: Role }) {
  const email = user.email.toLowerCase()
  const key = KEY_USER(email)
  const existingRaw = await env.ANOME_DASH_KV.get(key)
  const now = new Date().toISOString()
  let createdAt = now
  if (existingRaw) {
    try {
      const ex = JSON.parse(existingRaw) as StoredUser
      if (ex?.createdAt) createdAt = ex.createdAt
    } catch {
      // ignore
    }
  }

  const stored: StoredUser = {
    email,
    name: user.name,
    role: user.role,
    picture: user.picture,
    createdAt,
    lastLoginAt: now
  }
  await env.ANOME_DASH_KV.put(key, JSON.stringify(stored))
  return stored
}

export async function kvListUsers(env: Env): Promise<StoredUser[]> {
  const list = await env.ANOME_DASH_KV.list({ prefix: 'users:' })
  const users: StoredUser[] = []
  for (const k of list.keys) {
    const raw = await env.ANOME_DASH_KV.get(k.name)
    if (!raw) continue
    try {
      users.push(JSON.parse(raw))
    } catch {
      // ignore
    }
  }
  users.sort((a, b) => a.email.localeCompare(b.email))
  return users
}

export async function kvGetUser(env: Env, email: string): Promise<StoredUser | null> {
  const raw = await env.ANOME_DASH_KV.get(KEY_USER(email))
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function kvSetUserRole(env: Env, email: string, role: Role): Promise<StoredUser | null> {
  const ex = await kvGetUser(env, email)
  if (!ex) return null
  const updated: StoredUser = { ...ex, role }
  await env.ANOME_DASH_KV.put(KEY_USER(email), JSON.stringify(updated))
  return updated
}
