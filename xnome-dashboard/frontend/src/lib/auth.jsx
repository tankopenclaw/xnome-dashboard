import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiGet, getApiBase } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [googleConfigured, setGoogleConfigured] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let alive = true

    // If we just came back from OAuth, the Worker redirects with #session=<jwt>
    const hash = window.location.hash || ''
    const m = hash.match(/session=([^&]+)/)
    if (m?.[1]) {
      try {
        const token = decodeURIComponent(m[1])
        window.localStorage.setItem('anome_session', token)
      } catch {
        // ignore
      }
      // remove fragment
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }

    ;(async () => {
      try {
        const [health, me] = await Promise.all([apiGet('/api/health'), apiGet('/api/me')])
        if (!alive) return
        setGoogleConfigured(!!health?.auth?.googleConfigured)
        setUser(me?.user || null)
      } catch {
        if (!alive) return
        setGoogleConfigured(false)
        setUser(null)
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(
    () => ({
      loading,
      googleConfigured,
      user,
      signInUrl: (returnTo) => `${getApiBase() || ''}/auth/google?returnTo=${encodeURIComponent(returnTo)}`
    }),
    [loading, googleConfigured, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
