import { Hono } from 'hono'
import { signJwt } from '../lib/jwt'
import type { Env, Role } from '../types'
import { kvGetAllowlistRole, kvIsAllowlisted, kvUpsertUserFromLogin } from '../lib/kvStore'

export const authRoutes = new Hono<{ Bindings: Env }>()

function cookieSet(name: string, value: string, attrs: Record<string, string | boolean> = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`]
  const base: Record<string, string | boolean> = {
    Path: '/',
    'Max-Age': '604800', // 7d
    HttpOnly: true,
    SameSite: 'Lax',
    Secure: true,
    ...attrs
  }
  for (const [k, v] of Object.entries(base)) {
    if (v === true) parts.push(k)
    else if (v === false || v == null) continue
    else parts.push(`${k}=${v}`)
  }
  return parts.join('; ')
}

function cookieClear(name: string) {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`
}

authRoutes.get('/google', (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID
  const redirectUri = c.env.GOOGLE_REDIRECT_URI
  if (!clientId || clientId === 'replace-me') return c.json({ error: 'Google OAuth not configured' }, 500)
  if (!redirectUri) return c.json({ error: 'GOOGLE_REDIRECT_URI missing' }, 500)

  const state = crypto.randomUUID()
  const scope = encodeURIComponent('openid email profile')
  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}&state=${encodeURIComponent(state)}&prompt=select_account`

  const returnTo = c.req.query('returnTo')
  if (returnTo) c.header('Set-Cookie', cookieSet('return_to', returnTo, { HttpOnly: true, 'Max-Age': '600' }))
  c.header('Set-Cookie', cookieSet('oauth_state', state, { HttpOnly: true, 'Max-Age': '600' }))
  return c.redirect(url)
})

authRoutes.post('/logout', async (c) => {
  c.header('Set-Cookie', cookieClear('session'))
  c.header('Set-Cookie', cookieClear('oauth_state'))
  return c.json({ ok: true })
})

authRoutes.get('/google/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')

  const cookie = c.req.header('cookie') || ''
  const m = cookie.match(/(?:^|;\s*)oauth_state=([^;]+)/)
  const expectedState = m ? decodeURIComponent(m[1]) : null

  if (!code) return c.json({ error: 'Missing code' }, 400)
  if (!state || !expectedState || state !== expectedState) return c.json({ error: 'Invalid state' }, 400)

  const clientId = c.env.GOOGLE_CLIENT_ID
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET
  const redirectUri = c.env.GOOGLE_REDIRECT_URI
  const jwtSecret = c.env.JWT_SECRET

  if (!clientId || clientId === 'replace-me') return c.json({ error: 'Google OAuth not configured' }, 500)
  if (!clientSecret || clientSecret === 'replace-me') return c.json({ error: 'GOOGLE_CLIENT_SECRET missing' }, 500)
  if (!redirectUri) return c.json({ error: 'GOOGLE_REDIRECT_URI missing' }, 500)
  if (!jwtSecret || jwtSecret === 'replace-me') return c.json({ error: 'JWT_SECRET missing' }, 500)

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    }).toString()
  })

  const tokenJson: any = await tokenRes.json().catch(() => ({}))
  if (!tokenRes.ok) {
    return c.json({ error: 'Token exchange failed', details: tokenJson }, 400)
  }

  const idToken = tokenJson.id_token
  if (!idToken) return c.json({ error: 'Missing id_token' }, 400)

  // Validate + decode via Google's tokeninfo endpoint.
  const infoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
  const info: any = await infoRes.json().catch(() => ({}))
  if (!infoRes.ok) return c.json({ error: 'Invalid id_token', details: info }, 400)
  if (info.aud !== clientId) return c.json({ error: 'Invalid audience', aud: info.aud }, 400)

  const email = String(info.email || '').toLowerCase()
  const name = String(info.name || info.given_name || 'User')
  const picture = String(info.picture || '')

  const allowlisted = await kvIsAllowlisted(c.env, email)
  if (!allowlisted) {
    return c.json({ error: 'Email not allowlisted for Google login', email }, 403)
  }

  const superadminEmail = c.env.SUPERADMIN_EMAIL?.toLowerCase()
  const allowRole = await kvGetAllowlistRole(c.env, email)
  const role: Role = email === superadminEmail ? 'superadmin' : allowRole || 'user'

  const storedUser = await kvUpsertUserFromLogin(c.env, { email, name, picture, role })

  const session = await signJwt(
    { email: storedUser.email, role: storedUser.role, name: storedUser.name, picture: storedUser.picture },
    jwtSecret,
    { expiresInSec: 60 * 60 * 24 * 7 }
  )
  // Cookie session is not reliable on pages.dev (different site). Keep for future custom domain.
  c.header('Set-Cookie', cookieSet('session', session))
  c.header('Set-Cookie', cookieClear('oauth_state'))

  // Redirect back to dashboard with token in fragment (not sent to server by browser).
  const m2 = cookie.match(/(?:^|;\s*)return_to=([^;]+)/)
  const returnToCookie = m2 ? decodeURIComponent(m2[1]) : null
  const returnTo = returnToCookie || 'https://anome-one-dashboard.pages.dev/'

  c.header('Set-Cookie', cookieClear('return_to'))
  return c.redirect(`${returnTo}#session=${encodeURIComponent(session)}`)
})
