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

function fmtPct(n, digits = 1) {
  if (n == null) return '—'
  return `${(n * 100).toFixed(digits)}%`
}

export function MonetizationPage() {
  const { t } = useI18N()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchViewData('monetization')
      .then((d) => {
        setPayload(d)
        setError('')
      })
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const data = payload?.data
  const k = data?.kpis

  const purchasesOption = useMemo(() => {
    const tr = data?.trend
    if (!tr) return null
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: { textStyle: { color: 'rgba(232,236,248,0.7)' } },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: tr.days,
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
          name: t.monetization.misc.grossUsd,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#ff4500' },
          data: tr.grossUsd
        },
        {
          name: t.monetization.misc.payers,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#33d69f' },
          data: tr.payers
        }
      ]
    }
  }, [data, t])

  const mixOption = useMemo(() => {
    const pkgs = data?.mix?.packages || []
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
          data: pkgs.map((p, i) => ({
            name: p.name,
            value: p.usd,
            itemStyle: { color: ['#ff4500', '#33d69f', '#a8c7ff', '#ffd24a'][i % 4] }
          }))
        }
      ]
    }
  }, [data])

  const waterfallOption = useMemo(() => {
    const wf = data?.waterfall
    if (!wf) return null

    const parts = [
      { name: t.monetization.misc.referral, value: -wf.referralUsd, color: '#33d69f' },
      { name: t.monetization.misc.agent, value: -wf.agentUsd, color: '#33d69f' },
      { name: t.monetization.misc.buyback, value: -wf.buybackUsd, color: '#ff4500' },
      { name: t.monetization.misc.treasury, value: -wf.treasuryUsd, color: '#a8c7ff' }
    ]

    const x = [t.monetization.misc.gross, ...parts.map((p) => p.name)]
    const gross = wf.grossUsd

    let running = gross
    const base = [0]
    const delta = [gross]
    const colors = ['#ff4500']
    for (const p of parts) {
      base.push(Math.min(running, running + p.value))
      delta.push(Math.abs(p.value))
      colors.push(p.color)
      running += p.value
    }

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: x,
        axisLabel: { color: 'rgba(232,236,248,0.7)' },
        axisLine: { lineStyle: { color: 'rgba(232,236,248,0.18)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(232,236,248,0.55)' },
        splitLine: { lineStyle: { color: 'rgba(232,236,248,0.10)' } }
      },
      series: [
        { type: 'bar', stack: 'total', itemStyle: { color: 'transparent' }, data: base },
        {
          type: 'bar',
          stack: 'total',
          data: delta,
          itemStyle: {
            color: (params) => colors[params.dataIndex] || '#a8c7ff',
            borderRadius: [8, 8, 0, 0]
          }
        }
      ]
    }
  }, [data, t])

  return (
    <AppShell
      title={t.monetization.title}
      subtitle={t.monetization.subtitle}
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
        <MetricCard label={t.monetization.kpi.gross} value={fmtUSD(k?.grossUsd24h)} tone="hot" hint={t.monetization.hints.gross} />
        <MetricCard label={t.monetization.kpi.payers} value={fmtNum(k?.payers24h)} tone="mint" hint={t.monetization.hints.payers} />
        <MetricCard label={t.monetization.kpi.arppu} value={fmtUSD(k?.arppuUsd24h)} tone="cool" hint={t.monetization.hints.arppu} />
        <MetricCard label={t.monetization.kpi.takeRate} value={fmtPct(k?.takeRateNet)} tone="warn" hint={t.monetization.hints.takeRate} />
        <MetricCard label={t.monetization.kpi.newPayerRate} value={fmtPct(k?.newUserPayerRate24h)} tone="cool" hint={t.monetization.hints.newPayerRate} />
        <MetricCard label={t.monetization.kpi.openedPayerRate} value={fmtPct(k?.autoBattleOpenedPayerRate24h)} tone="cool" hint={t.monetization.hints.openedPayerRate} />
        <MetricCard label={t.monetization.kpi.referral} value={fmtUSD(k?.referralPayoutUsd24h)} tone="mint" hint={t.monetization.hints.referral} />
        <MetricCard label={t.monetization.kpi.agent} value={fmtUSD(k?.agentPayoutUsd24h)} tone="mint" hint={t.monetization.hints.agent} />
      </div>

      <div className="grid panels">
        <Panel title={t.monetization.panels.trendTitle} subtitle={t.monetization.panels.trendSubtitle}>
          {purchasesOption ? <ReactECharts option={purchasesOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
        </Panel>

        <div className="colSpan5">
          <Panel title={t.monetization.panels.mixTitle} subtitle={t.monetization.panels.mixSubtitle}>
            <ReactECharts option={mixOption} style={{ height: 320 }} />
          </Panel>
        </div>

        <div className="colSpan7">
          <Panel title={t.monetization.panels.attrTitle} subtitle={t.monetization.panels.attrSubtitle}>
            <div className="split">
              <div className="splitMain">
                <div className="kv">
                  {(data?.attribution?.byChannel || []).map((c) => (
                    <div key={c.name} className="kvRow">
                      <div className="kvKey">{c.name}</div>
                      <div className="kvVal">
                        {fmtUSD(c.grossUsd)} • {fmtNum(c.payers)} {t.monetization.misc.payersLower}
                        {c.payoutUsd ? ` • ${fmtUSD(c.payoutUsd)} payout` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="splitSide">
                <div className="caption">
                  <div className="captionTitle">{t.monetization.panels.story}</div>
                  <div className="captionText">{t.monetization.story.attr}</div>
                </div>
                <div className="kv">
                  <div className="kvRow">
                    <div className="kvKey">{t.monetization.misc.topAgents}</div>
                    <div className="kvVal"> </div>
                  </div>
                  {(data?.attribution?.topAgents || []).map((a) => (
                    <div className="kvRow" key={a.agent}>
                      <div className="kvKey">{a.agent}</div>
                      <div className="kvVal">{fmtUSD(a.grossUsd)} • {fmtUSD(a.payoutUsd)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <Panel title={t.monetization.panels.waterfallTitle} subtitle={t.monetization.panels.waterfallSubtitle}>
          {waterfallOption ? <ReactECharts option={waterfallOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
        </Panel>
      </div>
    </AppShell>
  )
}
