import { createMiddleware } from 'hono/factory'
import type { Role } from '../types'
import { verifyJwt } from '../lib/jwt'
import { kvGetAllowlistRole, kvGetUser, kvUpsertUserFromLogin } from '../lib/kvStore'

type AppVars = {
  authUser: { email: string; role: Role; id: string; picture?: string; name?: string } | null
}

export const authContext = createMiddleware<{ Variables: AppVars }>(async (c, next) => {
  const emailHeader = c.req.header('x-dev-user-email')
  const roleHeader = c.req.header('x-dev-user-role') as Role | undefined

  // Preview mode when Google isn't configured.
  const googleNotConfigured = !c.env?.GOOGLE_CLIENT_ID || c.env.GOOGLE_CLIENT_ID === 'replace-me'

  // 1) Prefer Authorization: Bearer <jwt> (works across pages.dev + workers.dev)
  const auth = c.req.header('authorization') || ''
  const bearer = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : null
  if (bearer && c.env?.JWT_SECRET && c.env.JWT_SECRET !== 'replace-me') {
    const payload = await verifyJwt(bearer, c.env.JWT_SECRET)
    if (payload?.email) {
      const email = String(payload.email).toLowerCase()
      const superadminEmail = c.env?.SUPERADMIN_EMAIL?.toLowerCase()
      const stored = await kvGetUser(c.env, email)
      const allowRole = await kvGetAllowlistRole(c.env, email)
      const role: Role = email === superadminEmail ? 'superadmin' : (stored?.role ?? (payload.role as Role) ?? allowRole ?? 'user')

      // refresh lastLoginAt opportunistically
      await kvUpsertUserFromLogin(c.env, { email, name: payload.name, picture: payload.picture, role })

      c.set('authUser', {
        id: `u_${email}`,
        email,
        role,
        picture: payload.picture,
        name: payload.name
      })
      return next()
    }
  }

  // 2) Cookie session (works only when Pages and API share cookie domain)
  const cookie = c.req.header('cookie') || ''
  const m = cookie.match(/(?:^|;\s*)session=([^;]+)/)
  const sessionToken = m ? decodeURIComponent(m[1]) : null
  if (sessionToken && c.env?.JWT_SECRET && c.env.JWT_SECRET !== 'replace-me') {
    const payload = await verifyJwt(sessionToken, c.env.JWT_SECRET)
    if (payload?.email) {
      const email = String(payload.email).toLowerCase()
      const superadminEmail = c.env?.SUPERADMIN_EMAIL?.toLowerCase()
      const stored = await kvGetUser(c.env, email)
      const allowRole = await kvGetAllowlistRole(c.env, email)
      const role: Role = email === superadminEmail ? 'superadmin' : (stored?.role ?? (payload.role as Role) ?? allowRole ?? 'user')

      await kvUpsertUserFromLogin(c.env, { email, name: payload.name, picture: payload.picture, role })

      c.set('authUser', {
        id: `u_${email}`,
        email,
        role,
        picture: payload.picture,
        name: payload.name
      })
      return next()
    }
  }

  // 2) Dev headers fallback.
  if (!emailHeader) {
    if (googleNotConfigured && c.env?.SUPERADMIN_EMAIL) {
      const sa = c.env.SUPERADMIN_EMAIL.toLowerCase()
      c.set('authUser', { id: `u_preview_${sa}`, email: sa, role: 'superadmin' })
      return next()
    }

    c.set('authUser', null)
    return next()
  }

  const email = emailHeader.toLowerCase()
  const superadminEmail = c.env?.SUPERADMIN_EMAIL?.toLowerCase()
  const stored = await kvGetUser(c.env, email)
  const allowRole = await kvGetAllowlistRole(c.env, email)
  const role: Role = email === superadminEmail ? 'superadmin' : (stored?.role ?? roleHeader ?? allowRole ?? 'user')

  c.set('authUser', {
    id: `u_dev_${email}`,
    email,
    role
  })

  await next()
})

export const requireRole = (allowed: Role[]) =>
  createMiddleware<{ Variables: AppVars }>(async (c, next) => {
    const current = c.get('authUser')
    if (!current) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    if (!allowed.includes(current.role)) {
      return c.json({ error: 'Forbidden', required: allowed, current: current.role }, 403)
    }

    await next()
  })
