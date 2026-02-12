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

export function OverviewPage() {
  const { t } = useI18N()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchViewData('overview')
      .then((d) => {
        setPayload(d)
        setError('')
      })
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const data = payload?.data
  const kpis = data?.kpis

  const funnelOption = useMemo(() => {
    const steps = data?.funnel?.steps || []
    const seriesData = steps.map((s) => ({ name: s.name, value: s.total }))
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'funnel',
          left: '4%',
          top: 20,
          bottom: 10,
          width: '92%',
          min: 0,
          max: seriesData[0]?.value || 1,
          sort: 'descending',
          gap: 6,
          label: { color: '#E8ECF8' },
          labelLine: { lineStyle: { color: 'rgba(232,236,248,0.35)' } },
          itemStyle: {
            borderWidth: 0,
            shadowBlur: 12,
            shadowColor: 'rgba(255,69,0,0.10)'
          },
          emphasis: { label: { fontWeight: 700 } },
          data: seriesData
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

    // For a clean stacked-waterfall, use two series: invisible base + delta.
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
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (items) => {
          const it = items?.[1]
          if (!it) return ''
          const name = it.axisValue
          const val = it.data
          const sign = it.dataIndex === 0 ? '' : '-'
          return `${name}<br/>${sign}${fmtUSD(val)}`
        }
      },
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
        {
          type: 'bar',
          stack: 'total',
          itemStyle: { color: 'transparent' },
          emphasis: { itemStyle: { color: 'transparent' } },
          data: base
        },
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
  }, [data])

  const unlockOption = useMemo(() => {
    const u = data?.unlockSchedule
    if (!u) return null
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: { textStyle: { color: 'rgba(232,236,248,0.7)' } },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: u.days.map((d) => `D${d}`),
        axisLabel: { color: 'rgba(232,236,248,0.55)', interval: 4 },
        axisLine: { lineStyle: { color: 'rgba(232,236,248,0.18)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(232,236,248,0.55)' },
        splitLine: { lineStyle: { color: 'rgba(232,236,248,0.10)' } }
      },
      series: [
        {
          name: t.rewards.misc.win,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#ff4500' },
          areaStyle: { color: 'rgba(255,69,0,0.15)' },
          data: u.winU
        },
        {
          name: t.rewards.misc.lose,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#33d69f' },
          areaStyle: { color: 'rgba(51,214,159,0.12)' },
          data: u.loseU
        }
      ]
    }
  }, [data])

  const queueOption = useMemo(() => {
    const q = data?.mintQueue
    if (!q) return null
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['55%', '85%'],
          avoidLabelOverlap: true,
          label: { color: 'rgba(232,236,248,0.8)' },
          labelLine: { lineStyle: { color: 'rgba(232,236,248,0.25)' } },
          itemStyle: { borderColor: 'rgba(16,20,35,0.8)', borderWidth: 2 },
          data: q.buckets.map((b) => ({ name: b.label, value: b.anome }))
        }
      ]
    }
  }, [data])

  return (
    <AppShell
      title={t.overview.title}
      subtitle={t.overview.subtitle}
      right={null}
    >
      {error ? (
        <div className="card panel" style={{ borderColor: 'rgba(255,69,0,0.5)' }}>
          <div className="panelHeader">
            <div>
              <div className="panelTitle">{t.overview.misc.apiError}</div>
              <div className="panelSubtitle">{t.overview.misc.apiErrorSub}</div>
            </div>
          </div>
          <div className="panelBody">
            <pre style={{ margin: 0 }}>{error}</pre>
          </div>
        </div>
      ) : null}

      <div className="grid metrics">
        <MetricCard label={t.overview.kpi.gross} value={fmtUSD(kpis?.purchaseUsdToday)} tone="hot" hint={t.overview.hints.gross} />
        <MetricCard label={t.overview.kpi.buyback} value={fmtUSD(kpis?.buybackUsdToday)} tone="hot" hint={t.overview.hints.buyback} />
        <MetricCard label={t.overview.kpi.treasury} value={fmtUSD(kpis?.treasuryNetUsdToday)} tone="cool" hint={t.overview.hints.treasury} />
        <MetricCard label={t.overview.kpi.unlock} value={`${fmtNum(kpis?.unlockUToday)} U`} tone="mint" hint={t.overview.hints.unlock} />
        <MetricCard
          label={t.overview.kpi.pendingMint}
          value={`${fmtNum(kpis?.pendingMintAnome, 0)} ANOME`}
          subvalue={`${fmtUSD(kpis?.pendingMintUAtCurrent)} @ current`}
          tone="warn"
          hint={t.overview.hints.pending}
        />
        <MetricCard label={t.overview.kpi.unlockPressure} value={`${fmtNum(kpis?.unlockPressureU7d)} U`} tone="warn" hint={t.overview.hints.pressure} />
      </div>

      <div className="grid panels">
        <Panel
          title={t.overview.panels.funnelTitle}
          subtitle={t.overview.panels.funnelSubtitle}
          right={<div className="muted">{t.overview.misc.segmentAll}</div>}
        >
          <div className="split">
            <div className="splitMain">
              <ReactECharts option={funnelOption} style={{ height: 320 }} />
            </div>
            <div className="splitSide">
              <div className="caption">
                <div className="captionTitle">{t.overview.panels.story}</div>
                <div className="captionText">{t.overview.story.funnel}</div>
              </div>
              <div className="kv">
                <div className="kvRow">
                  <div className="kvKey">{t.overview.misc.loginSplit}</div>
                  <div className="kvVal">
                    Social {fmtNum(data?.funnel?.steps?.find((s) => s.id === 'login')?.breakdown?.social)} / Wallet{' '}
                    {fmtNum(data?.funnel?.steps?.find((s) => s.id === 'login')?.breakdown?.wallet)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title={t.overview.panels.waterfallTitle} subtitle={t.overview.panels.waterfallSubtitle}>
          {waterfallOption ? <ReactECharts option={waterfallOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
        </Panel>

        <Panel title={t.overview.panels.unlockTitle} subtitle={t.overview.panels.unlockSubtitle}>
          {unlockOption ? <ReactECharts option={unlockOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
        </Panel>

        <Panel
          title={t.overview.panels.queueTitle}
          subtitle={t.overview.panels.queueSubtitle}
          right={
            <div className="muted">
              {t.overview.misc.price}: {data?.mintQueue?.anomePriceU ? `${data.mintQueue.anomePriceU} U` : '—'}
            </div>
          }
        >
          <div className="split">
            <div className="splitMain">
              {queueOption ? <ReactECharts option={queueOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
            </div>
            <div className="splitSide">
              <div className="caption">
                <div className="captionTitle">{t.overview.panels.story}</div>
                <div className="captionText">{t.overview.story.queue}</div>
              </div>
              <div className="kv">
                <div className="kvRow">
                  <div className="kvKey">{t.overview.misc.uAtUnlock}</div>
                  <div className="kvVal">{fmtUSD(data?.mintQueue?.valueDeltaU?.uAtUnlock)}</div>
                </div>
                <div className="kvRow">
                  <div className="kvKey">{t.overview.misc.uAtCurrent}</div>
                  <div className="kvVal">{fmtUSD(data?.mintQueue?.valueDeltaU?.uAtCurrent)}</div>
                </div>
                <div className="kvRow">
                  <div className="kvKey">{t.overview.misc.delta}</div>
                  <div className={`kvVal ${data?.mintQueue?.valueDeltaU?.delta >= 0 ? 'pos' : 'neg'}`}>
                    {fmtUSD(data?.mintQueue?.valueDeltaU?.delta)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
