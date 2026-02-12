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

export function RewardsPage() {
  const { t } = useI18N()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchViewData('rewards')
      .then((d) => {
        setPayload(d)
        setError('')
      })
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const data = payload?.data
  const k = data?.kpis

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
  }, [data, t])

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
          label: { color: 'rgba(232,236,248,0.8)' },
          labelLine: { lineStyle: { color: 'rgba(232,236,248,0.25)' } },
          itemStyle: { borderColor: 'rgba(16,20,35,0.8)', borderWidth: 2 },
          data: q.buckets.map((b, i) => ({
            name: b.label,
            value: b.anome,
            itemStyle: { color: ['#ff4500', '#33d69f', '#a8c7ff'][i % 3] }
          }))
        }
      ]
    }
  }, [data])

  const timeToMintOption = useMemo(() => {
    const mb = data?.mintBehavior
    if (!mb) return null
    const labels = mb.timeToMintBucketsH.map((h, idx) => (idx === mb.timeToMintBucketsH.length - 1 ? `${h}h+` : `${h}-${mb.timeToMintBucketsH[idx + 1]}h`))
    labels.pop()

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { color: 'rgba(232,236,248,0.7)', interval: 0, rotate: 20 },
        axisLine: { lineStyle: { color: 'rgba(232,236,248,0.18)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: 'rgba(232,236,248,0.55)', formatter: (v) => `${Math.round(v * 100)}%` },
        splitLine: { lineStyle: { color: 'rgba(232,236,248,0.10)' } }
      },
      series: [
        {
          name: t.rewards.misc.share,
          type: 'bar',
          data: (mb.share || []).slice(0, labels.length),
          itemStyle: { color: '#ffd24a', borderRadius: [8, 8, 0, 0] }
        }
      ]
    }
  }, [data, t])

  return (
    <AppShell
      title={t.rewards.title}
      subtitle={t.rewards.subtitle}
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
        <MetricCard label={t.rewards.kpi.unlock24h} value={`${fmtNum(k?.unlockU24h)} U`} tone="hot" hint={t.rewards.hints.unlock24h} />
        <MetricCard label={t.rewards.kpi.unlock7d} value={`${fmtNum(k?.unlockU7d)} U`} tone="warn" hint={t.rewards.hints.unlock7d} />
        <MetricCard label={t.rewards.kpi.pending} value={`${fmtNum(k?.pendingMintAnome)} ANOME`} tone="warn" hint={t.rewards.hints.pending} />
        <MetricCard label={t.rewards.kpi.mintRate} value={fmtPct(k?.mintRate24h)} tone="mint" hint={t.rewards.hints.mintRate} />
        <MetricCard label={t.rewards.kpi.ttm} value={`${fmtNum(k?.medianTimeToMintH, 1)} h`} tone="cool" hint={t.rewards.hints.ttm} />
        <MetricCard label={t.rewards.kpi.delta} value={fmtUSD(k?.valueDeltaU)} tone="mint" hint={t.rewards.hints.delta} />
      </div>

      <div className="grid panels">
        <Panel title={t.rewards.panels.unlockTitle} subtitle={t.rewards.panels.unlockSubtitle}>
          {unlockOption ? <ReactECharts option={unlockOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
        </Panel>

        <div className="colSpan6">
          <Panel
            title={t.rewards.panels.queueTitle}
            subtitle={t.rewards.panels.queueSubtitle}
            right={
              <div className="panelMeta muted">
                <div className="panelMetaLine">
                  {t.rewards.misc.price}: {data?.mintQueue?.anomePriceU ? `${data.mintQueue.anomePriceU} U` : '—'}
                </div>
                <div className="panelMetaDot">•</div>
                <div className="panelMetaLine">
                  {t.rewards.misc.pendingAvg}: {data?.mintQueue?.pendingMintAvgPriceU ? `${data.mintQueue.pendingMintAvgPriceU} U` : '—'}
                </div>
              </div>
            }
          >
            <div className="split">
              <div className="splitMain">{queueOption ? <ReactECharts option={queueOption} style={{ height: 320 }} /> : <div className="muted">—</div>}</div>
              <div className="splitSide">
                <div className="caption">
                  <div className="captionTitle">{t.rewards.panels.story}</div>
                  <div className="captionText">{t.rewards.story.queue}</div>
                </div>
                <div className="kv">
                  <div className="kvRow">
                    <div className="kvKey">{t.rewards.misc.uAtUnlock}</div>
                    <div className="kvVal">{fmtUSD(data?.mintQueue?.valueDeltaU?.uAtUnlock)}</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey">{t.rewards.misc.uAtCurrent}</div>
                    <div className="kvVal">{fmtUSD(data?.mintQueue?.valueDeltaU?.uAtCurrent)}</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey">{t.rewards.misc.delta}</div>
                    <div className={`kvVal ${data?.mintQueue?.valueDeltaU?.delta >= 0 ? 'pos' : 'neg'}`}>{fmtUSD(data?.mintQueue?.valueDeltaU?.delta)}</div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="colSpan6">
          <Panel title={t.rewards.panels.mintTitle} subtitle={t.rewards.panels.mintSubtitle}>
            <div className="split">
              <div className="splitMain">
                {timeToMintOption ? <ReactECharts option={timeToMintOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
              </div>
              <div className="splitSide">
                <div className="caption">
                  <div className="captionTitle">{t.rewards.panels.story}</div>
                  <div className="captionText">{t.rewards.story.mint}</div>
                </div>
                <div className="kv">
                  <div className="kvRow">
                    <div className="kvKey">{t.rewards.misc.mintedAnome24h}</div>
                    <div className="kvVal">{fmtNum(data?.mintBehavior?.mintedAnome24h)} ANOME</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey">{t.rewards.misc.mintedU24h}</div>
                    <div className="kvVal">{fmtNum(data?.mintBehavior?.mintedU24hAtCurrent, 1)} U</div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
