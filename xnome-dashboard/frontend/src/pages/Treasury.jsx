import { useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
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

function fmtPct(n, digits = 2) {
  if (n == null) return '—'
  return `${(n * 100).toFixed(digits)}%`
}

export function TreasuryPage() {
  const { t } = useI18N()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchViewData('treasury')
      .then((d) => {
        setPayload(d)
        setError('')
      })
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const data = payload?.data
  const k = data?.kpis

  const cashflowOption = useMemo(() => {
    const cf = data?.cashflow
    if (!cf) return null
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: { textStyle: { color: 'rgba(232,236,248,0.7)' } },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: cf.days,
        axisLabel: { color: 'rgba(232,236,248,0.55)' },
        axisLine: { lineStyle: { color: 'rgba(232,236,248,0.18)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(232,236,248,0.55)' },
        splitLine: { lineStyle: { color: 'rgba(232,236,248,0.10)' } }
      },
      series: [
        {
          name: t.treasury.misc.inflow,
          type: 'bar',
          stack: 'cf',
          data: cf.inflow,
          itemStyle: { color: 'rgba(255,69,0,0.75)', borderRadius: [8, 8, 0, 0] }
        },
        {
          name: t.treasury.misc.outflow,
          type: 'bar',
          stack: 'cf',
          data: cf.outflow.map((x) => -x),
          itemStyle: { color: 'rgba(51,214,159,0.70)', borderRadius: [8, 8, 0, 0] }
        }
      ]
    }
  }, [data, t])

  const allocOption = useMemo(() => {
    const al = data?.allocation?.buckets || []
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['55%', '85%'],
          label: { color: 'rgba(232,236,248,0.8)' },
          labelLine: { lineStyle: { color: 'rgba(232,236,248,0.25)' } },
          itemStyle: { borderColor: 'rgba(16,20,35,0.8)', borderWidth: 2 },
          data: al.map((b, i) => ({
            name: b.name,
            value: b.usd,
            itemStyle: { color: ['#a8c7ff', '#ff4500', '#33d69f', '#ffd24a'][i % 4] }
          }))
        }
      ]
    }
  }, [data])

  return (
    <AppShell
      title={t.treasury.title}
      subtitle={t.treasury.subtitle}
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
        <MetricCard label={t.treasury.kpi.balance} value={fmtUSD(k?.treasuryBalanceUsd)} tone="cool" hint={t.treasury.hints.balance} />
        <MetricCard label={t.treasury.kpi.net24h} value={fmtUSD(k?.treasuryNetUsd24h)} tone="hot" hint={t.treasury.hints.net24h} />
        <MetricCard label={t.treasury.kpi.buyback24h} value={fmtUSD(k?.buybackUsd24h)} tone="hot" hint={t.treasury.hints.buyback24h} />
        <MetricCard label={t.treasury.kpi.runway} value={`${fmtNum(k?.runwayDays)} d`} tone="warn" hint={t.treasury.hints.runway} />
        <MetricCard label={t.treasury.kpi.cover7d} value={`${fmtNum(k?.coverageU7d, 2)}x`} tone="mint" hint={t.treasury.hints.cover7d} />
        <MetricCard label={t.treasury.kpi.cover30d} value={`${fmtNum(k?.coverageU30d, 2)}x`} tone="mint" hint={t.treasury.hints.cover30d} />
      </div>

      <div className="grid panels">
        <div className="colSpan7">
          <Panel title={t.treasury.panels.cashflowTitle} subtitle={t.treasury.panels.cashflowSubtitle}>
            {cashflowOption ? <ReactECharts option={cashflowOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
          </Panel>
        </div>
        <div className="colSpan5">
          <Panel title={t.treasury.panels.allocTitle} subtitle={t.treasury.panels.allocSubtitle}>
            <ReactECharts option={allocOption} style={{ height: 320 }} />
          </Panel>
        </div>

        <Panel title={t.treasury.panels.coverageTitle} subtitle={t.treasury.panels.coverageSubtitle}>
          <div className="split">
            <div className="splitMain">
              <div className="kv">
                <div className="kvRow">
                  <div className="kvKey">{t.treasury.misc.cover7d}</div>
                  <div className={`kvVal ${k?.coverageU7d >= 1 ? 'pos' : 'neg'}`}>{fmtNum(k?.coverageU7d, 2)}x</div>
                </div>
                <div className="kvRow">
                  <div className="kvKey">{t.treasury.misc.cover30d}</div>
                  <div className={`kvVal ${k?.coverageU30d >= 1 ? 'pos' : 'neg'}`}>{fmtNum(k?.coverageU30d, 2)}x</div>
                </div>
                <div className="kvRow">
                  <div className="kvKey">{t.treasury.misc.takeaway}</div>
                  <div className="kvVal">{t.treasury.story.takeaway}</div>
                </div>
              </div>
            </div>
            <div className="splitSide">
              <div className="caption">
                <div className="captionTitle">{t.treasury.panels.story}</div>
                <div className="captionText">{t.treasury.story.coverage}</div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
