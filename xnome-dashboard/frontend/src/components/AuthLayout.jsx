import { useI18N } from '../lib/i18n.jsx'

export function AuthLayout({ title, subtitle, children }) {
  const { toggleLang, lang } = useI18N()

  return (
    <div className="authRoot">
      <div className="authTop">
        <div className="authBrand">
          <div className="authMark">
            <img
              src={new URL('../assets/anome-logo.svg', import.meta.url).toString()}
              alt="ANOME"
              className="authMarkImg"
            />
          </div>
          <div>
            <div className="authName">ANOME</div>
            <div className="authSub">Data Console</div>
          </div>
        </div>

        <button className="authLang" onClick={toggleLang} title="Toggle language">
          {lang === 'en' ? '中文' : 'EN'}
        </button>
      </div>

      <div className="authCenter">
        <div className="authCard">
          <div className="authTitle">{title}</div>
          {subtitle ? <div className="authSubtitle">{subtitle}</div> : null}
          <div className="authBody">{children}</div>
        </div>

        <div className="authFoot">
          <span>© {new Date().getFullYear()} ANOME</span>
          <span className="dot">•</span>
          <a href="https://xnome.xyz" target="_blank" rel="noreferrer">
            xnome.xyz
          </a>
        </div>
      </div>
    </div>
  )
}
