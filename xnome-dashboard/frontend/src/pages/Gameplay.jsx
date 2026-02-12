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

export function GameplayPage() {
  const { t } = useI18N()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchViewData('gameplay')
      .then((d) => {
        setPayload(d)
        setError('')
      })
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const data = payload?.data
  const k = data?.kpis

  const trendOption = useMemo(() => {
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
          name: t.gameplay.misc.dau,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#ff4500' },
          data: tr.dau
        },
        {
          name: t.gameplay.misc.sessions,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#a8c7ff' },
          data: tr.sessions
        },
        {
          name: t.gameplay.misc.matches,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#33d69f' },
          data: tr.matches
        }
      ]
    }
  }, [data, t])

  const rewardTrendOption = useMemo(() => {
    const tr = data?.rewardTrend30d
    if (!tr) return null
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: tr.days,
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
          name: t.gameplay.misc.uCreated,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#ffd24a' },
          areaStyle: { color: 'rgba(255,210,74,0.12)' },
          data: tr.totalCreatedU
        }
      ]
    }
  }, [data, t])

  const matchesPerDayOption = useMemo(() => {
    const rows = data?.matchesPerDay?.buckets || []
    if (!rows.length) return null
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: rows.map((r) => r.label),
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
          name: t.gameplay.misc.users,
          type: 'bar',
          data: rows.map((r) => r.users),
          itemStyle: { color: '#a8c7ff', borderRadius: [8, 8, 0, 0] }
        }
      ]
    }
  }, [data, t])

  return (
    <AppShell
      title={t.gameplay.title}
      subtitle={t.gameplay.subtitle}
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
        <MetricCard label={t.gameplay.kpi.dau} value={fmtNum(k?.dau)} tone="hot" hint={t.gameplay.hints.dau} />
        <MetricCard label={t.gameplay.kpi.sessions} value={fmtNum(k?.sessions)} tone="cool" hint={t.gameplay.hints.sessions} />
        <MetricCard label={t.gameplay.kpi.matches} value={fmtNum(k?.matches)} tone="mint" hint={t.gameplay.hints.matches} />
        <MetricCard label={t.gameplay.kpi.winRate} value={fmtPct(k?.winRate)} tone="warn" hint={t.gameplay.hints.winRate} />
        <MetricCard label={t.gameplay.kpi.oneClick} value={fmtPct(k?.oneClickRate)} tone="mint" hint={t.gameplay.hints.oneClick} />
        <MetricCard
          label={t.gameplay.kpi.purchasedNotPlayed}
          value={`${fmtNum(data?.purchasedNotPlayed?.users)} • ${fmtPct(data?.purchasedNotPlayed?.rateAmongBuyers)}`}
          tone="warn"
          hint={t.gameplay.hints.purchasedNotPlayed}
        />
      </div>

      <div className="grid panels">
        <Panel title={t.gameplay.panels.trendTitle} subtitle={t.gameplay.panels.trendSubtitle}>
          {trendOption ? <ReactECharts option={trendOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
        </Panel>

        <div className="colSpan7">
          <Panel title={t.gameplay.panels.rewardsTitle} subtitle={t.gameplay.panels.rewardsSubtitle}>
            <div className="split">
              <div className="splitMain">
                {rewardTrendOption ? <ReactECharts option={rewardTrendOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
              </div>
              <div className="splitSide">
                <div className="caption">
                  <div className="captionTitle">{t.gameplay.panels.story}</div>
                  <div className="captionText">{t.gameplay.story.rewards}</div>
                </div>
                <div className="kv">
                  <div className="kvRow">
                    <div className="kvKey">{t.gameplay.misc.totalCreated}</div>
                    <div className="kvVal">{fmtNum(data?.rewardTrend30d?.totalCreatedU?.slice(-1)?.[0])} U</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey">{t.gameplay.misc.total30d}</div>
                    <div className="kvVal">{fmtNum((data?.rewardTrend30d?.totalCreatedU || []).reduce((a, b) => a + b, 0))} U</div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="colSpan5">
          <Panel title={t.gameplay.panels.matchesDistTitle} subtitle={t.gameplay.panels.matchesDistSubtitle}>
            {matchesPerDayOption ? <ReactECharts option={matchesPerDayOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
