import { AuthLayout } from '../components/AuthLayout'
import { useAuth } from '../lib/auth'
import { useI18N } from '../lib/i18n.jsx'

export function LoginPage() {
  const { lang } = useI18N()
  const { loading, user, signInUrl } = useAuth()

  const title = lang === 'en' ? 'Sign in' : '登录'
  const subtitle = lang === 'en' ? 'ANOME ONE dashboard' : 'ANOME ONE 数据看板'

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {loading ? <div className="authMuted">Loading…</div> : null}

      {!loading && user ? (
        <div className="authRow">
          <div className="authMuted">{lang === 'en' ? 'Signed in as' : '当前登录'}:</div>
          <div className="authStrong">{user.email}</div>
        </div>
      ) : null}


      {/* status row removed */}

      <a className="authPrimary" href={signInUrl(window.location.origin + '/')}>
        {lang === 'en' ? 'Sign in with Google' : '使用 Google 登录'}
      </a>

      <div className="authHint">
        {lang === 'en'
          ? 'Access is restricted by allowlisted emails. If you cannot sign in, ask an admin to add your email.'
          : '访问受邮箱白名单限制；如无法登录，请联系管理员添加邮箱。'}
      </div>
    </AuthLayout>
  )
}
