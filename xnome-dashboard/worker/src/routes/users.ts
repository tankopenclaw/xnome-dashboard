import { Hono } from 'hono'
import { requireRole } from '../middleware/auth'
import type { Role } from '../types'
import {
  kvEnsureAllowlistSeeded,
  kvGetAllowlist,
  kvSetAllowlist,
  kvListUsers,
  kvSetUserRole
} from '../lib/kvStore'

export const userRoutes = new Hono()

userRoutes.get('/me', (c) => {
  const authUser = c.get('authUser')
  if (!authUser) return c.json({ error: 'Unauthorized' }, 401)
  return c.json({ user: authUser })
})

userRoutes.get('/', requireRole(['admin', 'superadmin']), async (c) => {
  const users = await kvListUsers(c.env)
  return c.json({ users })
})

userRoutes.patch('/:email/role', requireRole(['superadmin']), async (c) => {
  const email = c.req.param('email')
  const body = await c.req.json<{ role?: Role }>()

  if (!body.role || !['user', 'admin', 'superadmin'].includes(body.role)) {
    return c.json({ error: 'Invalid role' }, 400)
  }

  if (body.role === 'superadmin') {
    return c.json({ error: 'superadmin assignment is bootstrap/env-managed via env' }, 403)
  }

  const updated = await kvSetUserRole(c.env, email, body.role)
  if (!updated) return c.json({ error: 'User not found' }, 404)

  // Keep allowlist role in sync if present.
  const entries = await kvEnsureAllowlistSeeded(c.env)
  const idx = entries.findIndex((e) => e.email === email.toLowerCase())
  if (idx >= 0) {
    entries[idx] = { ...entries[idx], role: body.role }
    await kvSetAllowlist(c.env, entries)
  }

  return c.json({ user: updated })
})

// Allowlist management (KV)
userRoutes.get('/allowlist', requireRole(['admin', 'superadmin']), async (c) => {
  const entries = await kvEnsureAllowlistSeeded(c.env)
  return c.json({ entries })
})

userRoutes.post('/allowlist', requireRole(['admin', 'superadmin']), async (c) => {
  const actor = c.get('authUser')
  const body = await c.req.json<{ email?: string; role?: Role }>()
  const email = (body.email || '').toLowerCase().trim()
  if (!email || !email.includes('@')) return c.json({ error: 'Invalid email' }, 400)

  const targetRole: Role = body.role || 'user'
  if (!['user', 'admin', 'superadmin'].includes(targetRole)) return c.json({ error: 'Invalid role' }, 400)

  if (targetRole === 'admin' && actor.role !== 'superadmin') {
    return c.json({ error: 'Only superadmin can add admin' }, 403)
  }
  if (targetRole === 'superadmin') {
    return c.json({ error: 'superadmin is env-managed' }, 403)
  }

  const entries = await kvEnsureAllowlistSeeded(c.env)
  const exists = entries.some((e) => e.email === email)
  if (exists) return c.json({ error: 'Already allowlisted' }, 409)

  entries.push({ email, role: targetRole, addedAt: new Date().toISOString() })
  await kvSetAllowlist(c.env, entries)
  return c.json({ ok: true, entries })
})

userRoutes.delete('/allowlist/:email', requireRole(['admin', 'superadmin']), async (c) => {
  const actor = c.get('authUser')
  const email = c.req.param('email').toLowerCase()

  if (email === c.env.SUPERADMIN_EMAIL?.toLowerCase()) {
    return c.json({ error: 'Cannot remove superadmin from allowlist' }, 403)
  }

  const entries = await kvEnsureAllowlistSeeded(c.env)
  const hit = entries.find((e) => e.email === email)
  if (!hit) return c.json({ error: 'Not found' }, 404)
  if (hit.role === 'admin' && actor.role !== 'superadmin') {
    return c.json({ error: 'Only superadmin can remove admin' }, 403)
  }

  const next = entries.filter((e) => e.email !== email)
  await kvSetAllowlist(c.env, next)
  return c.json({ ok: true, entries: next })
})
