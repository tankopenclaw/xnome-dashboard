import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { Panel } from '../components/Panel'
import { apiGet, getApiBase } from '../lib/api'
import { useI18N } from '../lib/i18n.jsx'

function isEmail(s) {
  return typeof s === 'string' && /.+@.+\..+/.test(s.trim())
}

export function AdminPage() {
  const { t, lang } = useI18N()
  const [me, setMe] = useState(null)

  const [users, setUsers] = useState([])
  const [allowlist, setAllowlist] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('user')

  const canManageAdmins = me?.role === 'superadmin'

  useEffect(() => {
    if (!canManageAdmins) setNewRole('user')
  }, [canManageAdmins])

  const apiBase = useMemo(() => getApiBase(), [])
  const authHeaders = useMemo(() => {
    const token = window.localStorage.getItem('anome_session')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  const refresh = async () => {
    const rMe = await apiGet('/api/me')
    setMe(rMe?.user || null)

    const [rUsers, rAllow] = await Promise.all([
      fetch(`${apiBase}/users`, { credentials: 'include', headers: authHeaders }).then((r) => r.json()),
      fetch(`${apiBase}/users/allowlist`, { credentials: 'include', headers: authHeaders }).then((r) => r.json())
    ])

    if (rUsers?.error) throw new Error(rUsers.error)
    if (rAllow?.error) throw new Error(rAllow.error)

    setUsers(rUsers?.users || [])
    setAllowlist(rAllow?.entries || [])
  }

  useEffect(() => {
    refresh().catch((e) => setError(String(e?.message || e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addAllowlist = async () => {
    const email = newEmail.trim().toLowerCase()
    if (!isEmail(email)) {
      setError(lang === 'en' ? 'Invalid email' : '邮箱格式不正确')
      return
    }

    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/users/allowlist`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', ...authHeaders },
        body: JSON.stringify({ email, role: newRole })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setAllowlist(json.entries || [])
      setNewEmail('')
    } catch (e) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  const removeAllowlist = async (email) => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/users/allowlist/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      setAllowlist(json.entries || [])
    } catch (e) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  const setRole = async (email, role) => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${apiBase}/users/${encodeURIComponent(email)}/role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json', ...authHeaders },
        body: JSON.stringify({ role })
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`)
      await refresh()
    } catch (e) {
      setError(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AppShell title={t.admin.title} subtitle={t.admin.subtitle} right={null}>
      {error ? (
        <div className="card panel" style={{ borderColor: 'rgba(255,69,0,0.5)' }}>
          <div className="panelHeader">
            <div>
              <div className="panelTitle">{t.common.apiError}</div>
              <div className="panelSubtitle">{error}</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid panels">
        <Panel title={lang === 'en' ? 'Allowlist' : '白名单'} subtitle={lang === 'en' ? 'Emails allowed to sign in' : '允许登录的邮箱列表'}>
          <div className="kv">
            <div className="adminAddStack">
              <div className="adminAddLabel">{lang === 'en' ? 'Add email' : '添加邮箱'}</div>

              <div className="adminAddRow">
                <input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="adminInput"
                />

                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="adminSelect"
                  title={canManageAdmins ? '' : lang === 'en' ? 'Admin can only add user' : 'admin 只能添加 user'}
                >
                  <option value="user">user</option>
                  <option value="admin" disabled={!canManageAdmins}>
                    admin
                  </option>
                </select>
              </div>

              <button className="adminAddBtn" disabled={busy} onClick={addAllowlist}>
                {lang === 'en' ? 'Add' : '添加'}
              </button>
            </div>
          </div>

          <div style={{ height: 12 }} />

          <div className="kv">
            {(allowlist || []).map((e) => (
              <div className="kvRow" key={e.email} style={{ alignItems: 'center' }}>
                <div className="kvKey">{e.email}</div>
                <div className="kvVal" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ opacity: 0.85 }}>{e.role}</span>
                  <button className="iconBtn" onClick={() => removeAllowlist(e.email)} aria-label="Remove">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {me?.role === 'superadmin' ? (
          <Panel title={lang === 'en' ? 'Users' : '用户'} subtitle={lang === 'en' ? 'Signed-in users' : '已登录用户'}>
            <div className="kv">
              {(users || []).map((u) => (
                <div className="kvRow" key={u.email} style={{ alignItems: 'center' }}>
                  <div className="kvKey">{u.email}</div>
                  <div className="kvVal" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ opacity: 0.85 }}>{u.role}</span>
                    {u.role !== 'superadmin' ? (
                      <>
                        <button className="langBtn" disabled={busy} onClick={() => setRole(u.email, 'user')}>
                          user
                        </button>
                        <button className="langBtn" disabled={busy} onClick={() => setRole(u.email, 'admin')}>
                          admin
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ) : null}
      </div>
    </AppShell>
  )
}
