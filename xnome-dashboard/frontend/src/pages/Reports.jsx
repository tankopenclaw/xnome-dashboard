import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { MetricCard } from '../components/MetricCard'
import { Panel } from '../components/Panel'
import { fetchViewData } from '../lib/api'
import { useI18N } from '../lib/i18n.jsx'

function fmtUSD(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtNum(n, digits = 0) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(n)
}

export function ReportsPage() {
  const { t } = useI18N()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchViewData('reports')
      .then((d) => {
        setPayload(d)
        setError('')
      })
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const report = payload?.data?.report
  const k = report?.kpis

  return (
    <AppShell
      title={t.reports.title}
      subtitle={t.reports.subtitle}
      right={null}
    >
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

      <div className="grid metrics">
        <MetricCard label={t.reports.kpi.gross7d} value={fmtUSD(k?.grossUsd7d)} tone="hot" />
        <MetricCard label={t.reports.kpi.payers7d} value={fmtNum(k?.payers7d)} tone="mint" />
        <MetricCard label={t.reports.kpi.unlock7d} value={`${fmtNum(k?.unlockU7d)} U`} tone="warn" />
        <MetricCard label={t.reports.kpi.buyback7d} value={fmtUSD(k?.buybackUsd7d)} tone="hot" />
        <MetricCard label={t.reports.kpi.treasury7d} value={fmtUSD(k?.treasuryNetUsd7d)} tone="cool" />
        <MetricCard label={t.reports.kpi.period} value={report?.period || '—'} tone="neutral" />
      </div>

      <div className="grid panels">
        <Panel title={t.reports.panels.weeklyTitle} subtitle={t.reports.panels.weeklySubtitle}>
          <div className="split">
            <div className="splitMain">
              <div className="kv">
                {(report?.highlights || []).map((h, i) => (
                  <div className="kvRow" key={i}>
                    <div className="kvKey">{t.reports.misc.highlight} {i + 1}</div>
                    <div className="kvVal">{h}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="splitSide">
              <div className="caption">
                <div className="captionTitle">{t.reports.panels.story}</div>
                <div className="captionText">{t.reports.story.weekly}</div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title={t.reports.panels.recoTitle} subtitle={t.reports.panels.recoSubtitle}>
          <div className="kv">
            {(report?.recommendations || []).map((r, i) => (
              <div className="kvRow" key={i}>
                <div className="kvKey">{t.reports.misc.action} {i + 1}</div>
                <div className="kvVal">{r}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={t.reports.panels.exportTitle} subtitle={t.reports.panels.exportSubtitle}>
          <div className="caption">
            <div className="captionTitle">{t.common.todo}</div>
            <div className="captionText">{t.reports.misc.exportTodo}</div>
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
