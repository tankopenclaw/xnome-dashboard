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

function fmtUSD(n, digits = 6) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
}

export function TokenomicsPage() {
  const { t } = useI18N()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchViewData('tokenomics')
      .then((d) => {
        setPayload(d)
        setError('')
      })
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const data = payload?.data
  const k = data?.kpis

  const supplyOption = useMemo(() => {
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
          name: t.tokenomics.misc.circulating,
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#ff4500' },
          data: tr.circulating
        }
      ]
    }
  }, [data, t])

  // burn not applicable

  return (
    <AppShell
      title={t.tokenomics.title}
      subtitle={t.tokenomics.subtitle}
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
        <MetricCard label={t.tokenomics.kpi.price} value={`${fmtUSD(k?.priceU, 6)} U`} tone="warn" hint={t.tokenomics.hints.price} />
        <MetricCard label={t.tokenomics.kpi.total} value={`${fmtNum(k?.totalSupplyAnome)} ANOME`} tone="cool" hint={t.tokenomics.hints.total} />
        <MetricCard label={t.tokenomics.kpi.circ} value={`${fmtNum(k?.circulatingAnome)} ANOME`} tone="hot" hint={t.tokenomics.hints.circ} />
        <MetricCard label={t.tokenomics.kpi.pendingMint} value={`${fmtNum(k?.pendingMintAnome)} ANOME`} tone="mint" hint={t.tokenomics.hints.pendingMint} />
        <MetricCard label={t.tokenomics.kpi.emission} value={`${fmtNum(k?.emissionAnome24h)} ANOME`} tone="warn" hint={t.tokenomics.hints.emission} />
        <MetricCard label={t.tokenomics.kpi.netEmission} value={`${fmtNum(k?.netEmissionAnome24h)} ANOME`} tone="hot" hint={t.tokenomics.hints.netEmission} />
      </div>

      <div className="grid panels">
        <Panel title={t.tokenomics.panels.supplyTitle} subtitle={t.tokenomics.panels.supplySubtitle}>
          {supplyOption ? <ReactECharts option={supplyOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
        </Panel>

        <Panel title={t.tokenomics.panels.noteTitle} subtitle={t.tokenomics.panels.noteSubtitle}>
          <div className="caption">
            <div className="captionTitle">{t.tokenomics.panels.story}</div>
            <div className="captionText">{t.tokenomics.story.note}</div>
          </div>
        </Panel>
      </div>
    </AppShell>
  )
}
