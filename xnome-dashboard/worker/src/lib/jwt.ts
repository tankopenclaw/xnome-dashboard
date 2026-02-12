// Minimal JWT HS256 (Workers compatible)
// NOTE: this is for session cookies, not for inter-service auth.

function b64url(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  let s = btoa(String.fromCharCode(...bytes))
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function b64urlJson(obj) {
  return b64url(JSON.stringify(obj))
}

async function hmacSha256(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return new Uint8Array(sig)
}

export async function signJwt(payload, secret, opts = {}) {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + (opts.expiresInSec ?? 60 * 60 * 24 * 7) // 7d
  const header = { alg: 'HS256', typ: 'JWT' }
  const body = { ...payload, iat: now, exp }
  const base = `${b64urlJson(header)}.${b64urlJson(body)}`
  const sig = await hmacSha256(secret, base)
  return `${base}.${b64url(sig)}`
}

export async function verifyJwt(token, secret) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [h, p, s] = parts
    const base = `${h}.${p}`
    const sig = await hmacSha256(secret, base)
    const expected = b64url(sig)
    if (expected !== s) return null

    const payloadJson = atob(p.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson)
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && now > payload.exp) return null
    return payload
  } catch {
    return null
  }
}
