import { AppShell } from '../components/AppShell'
import { Panel } from '../components/Panel'
import { useI18N } from '../lib/i18n.jsx'

export function PlaceholderPage({ title }) {
  const { t } = useI18N()
  return (
    <AppShell title={title} subtitle={t.common.planned}>
      <Panel title={t.common.comingSoon} subtitle="">
        <div className="muted">
          We’re building this page next. The architecture is ready: views API + chart components + XNOME-style design system.
        </div>
      </Panel>
    </AppShell>
  )
}
