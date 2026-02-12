import type { Role, User } from '../types'

const now = new Date().toISOString()

const users: User[] = [
  {
    id: 'u_superadmin',
    email: 'tank@anome.xyz',
    name: 'Tank',
    role: 'superadmin',
    walletAddress: '0xAUTO_SUPERADMIN',
    provider: 'google',
    createdAt: now
  },
  {
    id: 'u_admin',
    email: 'admin@xnome.dev',
    name: 'Admin User',
    role: 'admin',
    walletAddress: '0xAUTO_ADMIN',
    provider: 'google',
    createdAt: now
  },
  {
    id: 'u_user',
    email: 'user@xnome.dev',
    name: 'Normal User',
    role: 'user',
    walletAddress: '0xAUTO_USER',
    provider: 'google',
    createdAt: now
  }
]

const randomWallet = (email: string) => {
  const base = [...email].reduce((sum, c) => sum + c.charCodeAt(0), 0)
  return `0xAUTO_${base.toString(16).toUpperCase()}`
}

export const parseAllowlist = (raw: string) =>
  raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)

export const isAllowlistedEmail = (email: string, allowlist: string[]) =>
  allowlist.length === 0 || allowlist.includes(email.toLowerCase())

export const listUsers = () => users

export const getUserByEmail = (email: string) => users.find((u) => u.email.toLowerCase() === email.toLowerCase())

export const upsertSocialUser = (email: string, name: string, superadminEmail: string) => {
  const existing = getUserByEmail(email)
  if (existing) return existing

  const role: Role = email.toLowerCase() === superadminEmail.toLowerCase() ? 'superadmin' : 'user'
  const newUser: User = {
    id: `u_${crypto.randomUUID()}`,
    email,
    name,
    role,
    walletAddress: randomWallet(email),
    provider: 'google',
    createdAt: new Date().toISOString()
  }
  users.push(newUser)
  return newUser
}

export const canCreateRole = (actorRole: Role, targetRole: Role) => {
  if (actorRole === 'superadmin') return ['user', 'admin'].includes(targetRole)
  if (actorRole === 'admin') return targetRole === 'user'
  return false
}

export const createUser = (email: string, name: string, role: Role = 'user') => {
  if (getUserByEmail(email)) {
    return { error: 'User already exists' as const }
  }

  const newUser: User = {
    id: `u_${crypto.randomUUID()}`,
    email,
    name,
    role,
    walletAddress: randomWallet(email),
    provider: 'google',
    createdAt: new Date().toISOString()
  }
  users.push(newUser)
  return { user: newUser }
}

export const setUserRole = (email: string, role: Role) => {
  const user = getUserByEmail(email)
  if (!user) return null
  user.role = role
  return user
}
