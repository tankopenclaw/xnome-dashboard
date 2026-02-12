export function MetricCard({ label, value, subvalue, trend, tone = 'neutral', hint }) {
  return (
    <div className={`card metric tone-${tone}`}> 
      <div className="metricTop">
        <div className="metricLabel">{label}</div>
        {trend ? <div className={`trend ${trend.startsWith('-') ? 'down' : 'up'}`}>{trend}</div> : null}
      </div>
      <div className="metricValue">{value}</div>
      {subvalue ? <div className="metricSub">{subvalue}</div> : null}
      {hint ? <div className="metricHint">{hint}</div> : null}
    </div>
  )
}
