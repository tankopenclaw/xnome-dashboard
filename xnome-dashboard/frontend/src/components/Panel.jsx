export function Panel({ title, subtitle, right, children }) {
  return (
    <section className="card panel">
      <div className="panelHeader">
        <div>
          <div className="panelTitle">{title}</div>
          {subtitle ? <div className="panelSubtitle">{subtitle}</div> : null}
        </div>
        <div className="panelRight">{right}</div>
      </div>
      <div className="panelBody">{children}</div>
    </section>
  )
}
