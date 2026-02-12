# Product Spec Review (v0.2 → v0.3 adjustments)

This is a self-review pass to verify the spec communicates the intended data stories.

## 1) Can the product communicate the stories?

### Story A (Growth quality)
- ✅ Funnel + segmented login type is explicit.
- ⚠️ Need explicit definition that social login auto-assigns wallet (no bind), and show any identity collision metric.

### Story B (Monetization health)
- ✅ Waterfall + attribution (invite/agent) included.
- ⚠️ Need “net take rate” definition and a default view that highlights referral/agent leakage.

### Story C (Liability & solvency)
- ✅ Unlock schedule + coverage is included.
- ⚠️ Need a clear chart that compares “upcoming unlock value” vs “buyback capacity + treasury buffer”.

### Story D (Token issuance impact)
- ✅ Unlocked-not-minted queue and value delta are included.
- ⚠️ Need a narrative card: “Users are incentivized to delay mint when price rises; queue is latent sell pressure.”

### Story E (Market risk)
- ✅ T+3/T+7 pressure + concentration addressed.
- ⚠️ Add a simple, deterministic risk score formula in glossary.

### Story F (Operational truth)
- ✅ Data freshness is included.
- ⚠️ Add a “Data sources” page + build number for transparency.

---

## 2) Spec optimizations (v0.3)

### 2.1 Add a "Narrative strip" to Overview
Under hero KPIs, add a 1–2 sentence auto-generated narrative:
- Example: "Purchases up 12% WoW; unlock pressure next 7d is rising; mint queue expanded due to ANOME price appreciation." (mock for now)

### 2.2 Add "Unit switch" standardization
All pages must support:
- U-only mode
- ANOME-only mode
- Dual mode (show both with conversion rate)

### 2.3 Standardize drilldowns
- Every major chart must have at least one drilldown path.
- Breadcrumb carries global filters.

### 2.4 Production readiness checklist
- Responsive layout for desktop + mobile (read-only on mobile; admin only desktop)
- Loading states, empty states
- Error boundaries and retry
- Caching strategy (etag/stale-while-revalidate)

---

## 3) Implementation plan (no MVP shortcuts)

### Phase 1 — Design lock (1 page)
- Build **Overview** as production-grade (XNOME style).
- Implement: Metric cards, chart panels, global filter bar, glossary popovers.

### Phase 2 — Page framework
- Add routing, nav, page templates.
- Add chart components library.

### Phase 3 — All pages with mock data
- Implement all pages with mock-backed endpoints.
- Ensure consistent filters and drilldowns.

### Phase 4 — Replace mocks with real API
- Keep view IDs stable.
- Implement data adapters per view.

