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

export function AcquisitionPage() {
  const { t } = useI18N()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchViewData('acquisition')
      .then((d) => {
        setPayload(d)
        setError('')
      })
      .catch((e) => setError(String(e?.message || e)))
  }, [])

  const data = payload?.data
  const k = data?.kpis

  const sourcesOption = useMemo(() => {
    const rows = data?.sources?.sources || []
    const names = rows.map((r) => r.name)
    const visits = rows.map((r) => r.visits)

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: window.innerWidth <= 900 ? 8 : 54, right: 20, top: 30, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: names,
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
          name: 'Visits',
          type: 'bar',
          data: visits,
          itemStyle: { color: '#ff4500', borderRadius: [8, 8, 0, 0] }
        }
      ]
    }
  }, [data])

  const loginOption = useMemo(() => {
    const login = data?.login
    if (!login) return null
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
          data: [
            { name: t.acquisition.misc.socialLogin, value: login.social, itemStyle: { color: '#33d69f' } },
            { name: t.acquisition.misc.walletLogin, value: login.wallet, itemStyle: { color: '#a8c7ff' } }
          ]
        }
      ]
    }
  }, [data, t])

  const taggingOption = useMemo(() => {
    const tag = data?.tagging
    if (!tag) return null
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
          data: [
            { name: t.acquisition.misc.invite, value: Math.round(tag.inviteTagged * 100), itemStyle: { color: '#ff4500' } },
            { name: t.acquisition.misc.agent, value: Math.round(tag.agentTagged * 100), itemStyle: { color: '#33d69f' } },
            { name: t.acquisition.misc.unknown, value: Math.round(tag.unknown * 100), itemStyle: { color: '#ffd24a' } }
          ]
        }
      ]
    }
  }, [data, t])

  return (
    <AppShell
      title={t.acquisition.title}
      subtitle={t.acquisition.subtitle}
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
        <MetricCard label={t.acquisition.kpi.visits} value={fmtNum(k?.visits24h)} tone="hot" hint={t.acquisition.hints.visits} />
        <MetricCard label={t.acquisition.kpi.signups} value={fmtNum(k?.signups24h)} tone="mint" hint={t.acquisition.hints.signups} />
        <MetricCard label={t.acquisition.kpi.actives} value={fmtNum(k?.actives24h)} tone="cool" hint={t.acquisition.hints.actives} />
        <MetricCard label={t.acquisition.kpi.cvr} value={fmtPct(k?.conversionVisitToLogin)} tone="warn" hint={t.acquisition.hints.cvr} />
        <MetricCard label={t.acquisition.kpi.inviteCoverage} value={fmtPct(k?.inviteCoverage)} tone="hot" hint={t.acquisition.hints.inviteCoverage} />
        <MetricCard label={t.acquisition.kpi.agentCoverage} value={fmtPct(k?.agentCoverage)} tone="mint" hint={t.acquisition.hints.agentCoverage} />
      </div>

      <div className="grid panels">
        <div className="colSpan7">
          <Panel title={t.acquisition.panels.sourcesTitle} subtitle={t.acquisition.panels.sourcesSubtitle}>
            <ReactECharts option={sourcesOption} style={{ height: 320 }} />
          </Panel>
        </div>
        <div className="colSpan5">
          <Panel title={t.acquisition.panels.loginTitle} subtitle={t.acquisition.panels.loginSubtitle}>
            {loginOption ? <ReactECharts option={loginOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
          </Panel>
        </div>

        <div className="colSpan7">
          <Panel title={t.acquisition.panels.walletTitle} subtitle={t.acquisition.panels.walletSubtitle}>
            <div className="split">
              <div className="splitMain">
                <div className="kv">
                  <div className="kvRow">
                    <div className="kvKey">{t.acquisition.misc.dupDevice}</div>
                    <div className="kvVal">{fmtPct(data?.walletQuality?.duplicatedDeviceRate, 2)}</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey">{t.acquisition.misc.dupWallet}</div>
                    <div className="kvVal">{fmtPct(data?.walletQuality?.duplicatedWalletRate, 2)}</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey">{t.acquisition.misc.newWallet}</div>
                    <div className="kvVal">{fmtPct(data?.walletQuality?.newWalletRate, 1)}</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey">{t.acquisition.misc.repeat7d}</div>
                    <div className="kvVal">{fmtPct(data?.walletQuality?.repeatLoginRate7d, 1)}</div>
                  </div>
                </div>
              </div>
              <div className="splitSide">
                <div className="caption">
                  <div className="captionTitle">{t.acquisition.panels.story}</div>
                  <div className="captionText">{t.acquisition.story.walletQuality}</div>
                </div>
                <div className="caption">
                  <div className="captionTitle">{t.acquisition.misc.note}</div>
                  <div className="captionText">{data?.walletQuality?.notes || '—'}</div>
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="colSpan5">
          <Panel title={t.acquisition.panels.taggingTitle} subtitle={t.acquisition.panels.taggingSubtitle}>
            <div className="split">
              <div className="splitMain">
                {taggingOption ? <ReactECharts option={taggingOption} style={{ height: 320 }} /> : <div className="muted">—</div>}
              </div>
              <div className="splitSide">
                <div className="caption">
                  <div className="captionTitle">{t.acquisition.panels.story}</div>
                  <div className="captionText">{t.acquisition.story.tagging}</div>
                </div>
                <div className="kv">
                  <div className="kvRow">
                    <div className="kvKey">{t.acquisition.misc.socialLogin}</div>
                    <div className="kvVal">{fmtNum(data?.login?.social)}</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey">{t.acquisition.misc.walletLogin}</div>
                    <div className="kvVal">{fmtNum(data?.login?.wallet)}</div>
                  </div>
                  <div className="kvRow">
                    <div className="kvKey">{t.acquisition.misc.autoWallet}</div>
                    <div className="kvVal">{fmtNum(data?.login?.walletCreatedAuto)}</div>
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
