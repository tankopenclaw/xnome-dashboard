import { useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { AppShell } from '../components/AppShell'
import { MetricCard } from '../components/MetricCard'
import { Panel } from '../components/Panel'
import { fetchViewData } from '../lib/api'
import { useI18N } from '../lib/i18n.jsx'

function fmtNum(n, digits = 0) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(n)
}

function fmtPct(n, digits = 1) {
  if (n == null) return '—'
  return `${(n * 100).toFixed(digits)}%`
}

export function RiskPage() {
  const { t } = useI18N()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchViewData('risk')
      .then((d) => {
        setPayload(d)
        setError('')
      })
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const data = payload?.data
  const k = data?.kpis

  const concentrationOption = useMemo(() => {
    const top = data?.concentration?.top || []
    const names = top.map((x) => x.address)
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: { color: 'rgba(232,236,248,0.7)', interval: 0, rotate: 20 },
        axisLine: { lineStyle: { color: 'rgba(232,236,248,0.18)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(232,236,248,0.55)' },
        splitLine: { lineStyle: { color: 'rgba(232,236,248,0.10)' } }
      },
      series: [
        {
          name: t.risk.misc.pending,
          type: 'bar',
          data: top.map((x) => x.pendingAnome),
          itemStyle: { color: '#ff4500', borderRadius: [8, 8, 0, 0] }
        }
      ]
    }
  }, [data, t])

  const scenarioOption = useMemo(() => {
    const sc = data?.scenarios?.scenarios || []
    if (!sc.length) return null
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: sc.map((s) => s.name),
        axisLabel: { color: 'rgba(232,236,248,0.7)' },
        axisLine: { lineStyle: { color: 'rgba(232,236,248,0.18)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(232,236,248,0.55)' },
        splitLine: { lineStyle: { color: 'rgba(232,236,248,0.10)' } }
      },
      series: [
        {
          name: t.risk.misc.mintRequired,
          type: 'bar',
          data: sc.map((s) => s.mintRequiredAnome7d),
          itemStyle: { color: '#ffd24a', borderRadius: [8, 8, 0, 0] }
        }
      ]
    }
  }, [data, t])

  return (
    <AppShell
      title={t.risk.title}
      subtitle={t.risk.subtitle}
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
        <MetricCard label={t.risk.kpi.unlock24h} value={`${fmtNum(k?.unlockU24h)} U`} tone="hot" hint={t.risk.hints.unlock24h} />
        <MetricCard label={t.risk.kpi.unlock3d} value={`${fmtNum(k?.unlockU3d)} U`} tone="warn" hint={t.risk.hints.unlock3d} />
        <MetricCard label={t.risk.kpi.unlock7d} value={`${fmtNum(k?.unlockU7d)} U`} tone="warn" hint={t.risk.hints.unlock7d} />
        <MetricCard label={t.risk.kpi.top10} value={fmtPct(k?.concentrationTop10)} tone="cool" hint={t.risk.hints.top10} />
        <MetricCard label={t.risk.kpi.scenario} value={`${fmtNum(k?.priceDown20NetEmissionAnome7d, 2)}x`} tone="mint" hint={t.risk.hints.scenario} />
        <MetricCard label={t.risk.kpi.score} value={fmtNum(k?.riskScore)} tone="hot" hint={t.risk.hints.score} />
      </div>

      <div className="grid panels">
        <div className="colSpan7">
          <Panel title={t.risk.panels.concentrationTitle} subtitle={t.risk.panels.concentrationSubtitle}>
            <div className="split">
              <div className="splitMain">
                {concentrationOption ? <ReactECharts option={concentrationOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
              </div>
              <div className="splitSide">
                <div className="caption">
                  <div className="captionTitle">{t.risk.panels.story}</div>
                  <div className="captionText">{t.risk.story.concentration}</div>
                </div>
                <div className="kv">
                  {(data?.concentration?.top || []).slice(0, 5).map((x) => (
                    <div className="kvRow" key={x.address}>
                      <div className="kvKey">{x.address}</div>
                      <div className="kvVal">{fmtNum(x.pendingAnome)} ANOME</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="colSpan5">
          <Panel title={t.risk.panels.scenarioTitle} subtitle={t.risk.panels.scenarioSubtitle}>
            {scenarioOption ? <ReactECharts option={scenarioOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
          </Panel>
        </div>

        <Panel title={t.risk.panels.tableTitle} subtitle={t.risk.panels.tableSubtitle}>
          <div className="kv">
            {(data?.scenarios?.scenarios || []).map((s) => (
              <div className="kvRow" key={s.name}>
                <div className="kvKey">{s.name}</div>
                <div className="kvVal">
                  {t.risk.misc.price}: {s.anomePriceU} U • {t.risk.misc.unlock7d}: {fmtNum(s.unlockU7d)} U • {t.risk.misc.mintRequired}:{' '}
                  {fmtNum(s.mintRequiredAnome7d)} ANOME
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
