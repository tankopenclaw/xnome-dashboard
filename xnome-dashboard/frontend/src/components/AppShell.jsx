import { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useI18N } from '../lib/i18n.jsx'
import { apiGet } from '../lib/api'

export function AppShell({ title, subtitle, right, children }) {
  const { t, toggleLang, lang } = useI18N()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [me, setMe] = useState(null)

  useEffect(() => {
    apiGet('/api/me')
      .then((r) => setMe(r?.user || null))
      .catch(() => setMe(null))
  }, [])

  const doLogout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // ignore
    }
    window.localStorage.removeItem('anome_session')
    window.location.href = '/login'
  }

  const nav = useMemo(() => {
    const items = [
      { to: '/', label: t.nav.overview },
      { to: '/acquisition', label: t.nav.acquisition },
      { to: '/gameplay', label: t.nav.gameplay },
      { to: '/monetization', label: t.nav.monetization },
      { to: '/rewards', label: t.nav.rewards },
      // tokenomics removed
      { to: '/treasury', label: t.nav.treasury },
      { to: '/risk', label: t.nav.risk },
      { to: '/reports', label: t.nav.reports }
    ]

    if (me?.role === 'admin' || me?.role === 'superadmin') {
      items.push({ to: '/admin', label: t.nav.admin })
    }

    return items
  }, [t, me])

  return (
    <div className={`app ${mobileNavOpen ? 'navOpen' : ''}`}> 
      <div className="mobileTopbar">
        <button className="iconBtn navToggleBtn" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
          <svg className="navToggleIcon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 6.5H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M4 17.5H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <div className="mobileBrand">
          <span className="mobileBrandMark" style={{ padding: 0, overflow: 'hidden', width: 28, height: 28, display: 'grid', placeItems: 'center' }}>
            <img
              src={new URL('../assets/anome-logo.svg', import.meta.url).toString()}
              alt="ANOME"
              style={{ width: 22, height: 22, display: 'block' }}
            />
          </span>
          <span className="mobileBrandText">ANOME</span>
        </div>

        <div className="userMenuWrap">
          <button
            className="avatarBtn"
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-label="User menu"
            title={me?.email || 'User'}
          >
            {me?.picture ? (
              <img className="avatarImg" src={me.picture} alt="avatar" referrerPolicy="no-referrer" />
            ) : (
              <span className="avatarDot" />
            )}
          </button>

          {userMenuOpen ? (
            <div className="userMenu">
              {me ? (
                <button className="userMenuItem" onClick={doLogout}>
                  {lang === 'en' ? 'Logout' : '退出登录'}
                </button>
              ) : (
                <a
                  className="userMenuItem"
                  href={`${getApiBase() || ''}/auth/google?returnTo=${encodeURIComponent(window.location.href)}`}
                >
                  {lang === 'en' ? 'Sign in with Google' : '使用 Google 登录'}
                </a>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="mobileBackdrop"
        onClick={() => {
          setMobileNavOpen(false)
          setUserMenuOpen(false)
        }}
      />

      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark" style={{ padding: 0, overflow: 'hidden', width: 38, height: 38, display: 'grid', placeItems: 'center' }}>
            <img
              src={new URL('../assets/anome-logo.svg', import.meta.url).toString()}
              alt="ANOME"
              style={{ width: 30, height: 30, display: 'block' }}
            />
          </div>
          <div>
            <div className="brandName">ANOME</div>
            <div className="brandSub">{t.shell.dataConsole}</div>
          </div>
        </div>

        <nav className="nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) => `navItem ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebarFooter">
          <button className="langBtn" onClick={toggleLang} title="Toggle language">
            {lang === 'en' ? '中文' : 'EN'}
          </button>

          {me ? (
            <div className="sidebarAccount">
              <div className="sidebarAccountMeta">
                <div className="sidebarAccountEmail">{me.email}</div>
                <div className="sidebarAccountRole">{me.role}</div>
              </div>
              <button className="sidebarLogout" onClick={doLogout}>
                {lang === 'en' ? 'Logout' : '退出'}
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div className="pageTitle">{title}</div>
            {subtitle ? <div className="pageSubtitle">{subtitle}</div> : null}
          </div>

          <div className="topbarRight">{right}</div>
        </header>

        <div className="content">{children}</div>
      </div>
    </div>
  )
}
