# XNOME Dashboard — Product Spec (v0.2)

> Goal: a production-grade data visualization site for **Anome One** (auto-battle) and platform economics.
> Style: **close to XNOME** (dark, neon accents, game-like panels, bold typography), but information-dense.

---

## 0. Product principles

1) **Tell one coherent story**: user growth → monetization → rewards/liabilities → supply/treasury → risk.
2) **Every chart answers a question**; every page has “What changed?” + “Why?” + “So what?”
3) **Two units everywhere** where needed:
   - **U (USDT) base** (liability / cost / treasury impact)
   - **ANOME base** (token supply impact)
4) **Time travel is first-class**: T+0, T+3, T+7, T+30 projections vs actuals.
5) **Explainability**: show formulas/definitions on hover; log data freshness.
6) **Extensibility**: new “views” are addable without rewiring pages.

---

## 1. Information architecture (all pages)

### 1.1 Global navigation
- Overview
- Acquisition & Identity
- Gameplay (Anome One)
- Monetization
- Rewards & Vesting
- Tokenomics
- Treasury
- Risk & Compliance
- Cohorts & Segments
- Reports
- Admin (role-gated)

### 1.2 Global filters (sticky bar)
- Time range: 24h / 7d / 30d / custom
- Chain / environment (if multi-chain later)
- Segment: All / Invited / Agent / Organic
- Unit toggle: U / ANOME (contextual)
- Data freshness indicator

---

## 2. Data stories (what the product should “say”)

### Story A — Growth quality
**Question:** Are we growing *real players* or just traffic?
- Funnel: Visit → Login (social/wallet) → Enter Anome One → Buy card → One-click play → Mint
- Identity lens: social vs wallet, auto-assigned wallet quality, repeated devices
- Drop-off diagnosis: which step is leaking and for which segment

### Story B — Monetization health
**Question:** Is monetization stable and which channels drive it?
- Purchase volume & frequency
- Purchase attribution:
  - invite link yes/no (5% referral)
  - agent yes/no (1–5% agent)
- Net revenue waterfall: Gross USDT → referral/agent → buyback → treasury

### Story C — Rewards liability & solvency
**Question:** What liabilities did we create and can the system absorb them?
- U-denominated liability schedule (30-day release, front-loaded 7-day 35–40% with different curves for win/lose)
- Projection vs actual daily unlock
- Coverage:
  - Buyback funds vs upcoming unlock value
  - Treasury buffer vs unlock pressure

### Story D — Token issuance impact
**Question:** How much ANOME is effectively entering circulation pressure?
- Unlock U → converted to ANOME at time-of-release price
- “Mint required” queue:
  - unlocked-not-minted ANOME
  - age buckets (0–1d, 2–7d, 8–30d)
- Value delta:
  - U value at unlock time vs current ANOME value in U
  - shows user incentive to delay mint / market risk

### Story E — Market risk (release pressure)
**Question:** When are we vulnerable (next 3/7 days) and who can impact price?
- T+3/T+7 unlock value
- Concentration: top addresses by unlocked-not-minted, by expected unlock
- Scenario: price down 20% → how ANOME emission changes

### Story F — Operational truth
**Question:** Can operators trust the dashboard?
- Data freshness, coverage gaps, error budget
- Auditability: links to source tx/events for sampled points

---

## 3. Page-by-page spec (production)

### 3.1 Overview (home)
**Purpose:** Executive cockpit. In 30 seconds answer: *How are we doing today?*

Sections:
1) **Hero KPIs** (cards, large)
   - Today gross purchase (USDT)
   - Today buyback (USDT)
   - Treasury net inflow (USDT)
   - Today unlock (U)
   - Unlocked-not-minted (ANOME + U@current)
   - Unlock pressure next 7d (U)

2) **Growth quality**
   - Funnel (segmented by login type)
   - Trend line: visits vs logins vs actives vs payers

3) **Economy waterfall**
   - Sankey: Purchase → {referral, agent, buyback, treasury}

4) **Liability schedule**
   - Area chart: daily unlock (win vs lose) + projection bands

5) **Risk panel**
   - Risk score + top drivers (T+3, T+7, concentration, depth proxy)

Interactions:
- Clicking any KPI jumps to the relevant detail page with filters pre-set.

---

### 3.2 Acquisition & Identity
**Purpose:** Where players come from and how identities map.

Modules:
- Traffic sources, campaigns
- Login distribution: social vs wallet
- Wallet assignment quality metrics (duplication, newly created wallets)
- Invite/agent tagging coverage

---

### 3.3 Gameplay — Anome One
**Purpose:** Game performance and player activity.

Modules:
- Daily active players, sessions
- One-click play: matches, win-rate, average match duration
- Reward creation: win reward (15%), lose subsidy (100%) volumes
- Skill/rank segmentation (if exists)

---

### 3.4 Monetization
**Purpose:** Purchases, ARPPU, channel economics.

Modules:
- Purchases over time
- Package/price point mix (if exists)
- Referral: volume, payout (5%), ROI
- Agent: volume, payout (1–5%), top agents
- Net waterfall + effective take-rate

---

### 3.5 Rewards & Vesting (Unlock/Mint)
**Purpose:** Liability schedule and mint behavior.

Modules:
- Unlock timeline (30d schedule with front-loaded first 7d)
- Unlocked-not-minted queue
- Mint rate, time-to-mint distribution
- Value delta: U@unlock vs U@current

---

### 3.6 Tokenomics
**Purpose:** Supply, emissions, burn, circulation.

Modules:
- Circulating vs total
- Emission from game (converted) vs other
- Burn events
- Market proxy panel (price/volume/depth later)

---

### 3.7 Treasury
**Purpose:** Treasury inflow/outflow and runway.

Modules:
- Treasury inflow from purchases
- Spending buckets (later)
- Runway estimate

---

### 3.8 Risk & Compliance
**Purpose:** Detect anomalies and concentration risks.

Modules:
- Unlock pressure next 24h/3d/7d
- Top addresses by pending mint
- Suspicious patterns (later)

---

### 3.9 Cohorts & Segments
**Purpose:** Retention + behavior across segments.

Modules:
- Cohort retention by acquisition channel
- Payer conversion cohorts
- Invite vs agent vs organic comparisons

---

### 3.10 Reports
**Purpose:** Auto-generated weekly/monthly narrative.

Modules:
- “This week in Anome One”: growth, monetization, liabilities
- Export PDF/CSV (later)

---

### 3.11 Admin (RBAC)
**Purpose:** Manage allowlist and roles.

Modules:
- Allowlist editor (emails)
- Role management (user/admin/superadmin rules)
- Audit log (later)

---

## 4. Content design & UI style (XNOME-like)

### Visual language
- Dark base, high-contrast neon accent (XNOME orange/red + green highlights)
- Panel cards with subtle glow
- Big section titles, short punchy subtitles
- “System” feel: tags, chips, counters

### Components (design system)
- MetricCard (primary/secondary states)
- TrendSparkline
- SegmentedFunnel
- SankeyFlow
- ProjectionAreaChart
- RiskScoreBadge
- DataFreshnessPill
- GlossaryPopover (definition & formula)

### Chart library
- Recharts or ECharts.
  - Recommend **ECharts** for Sankey + projection bands + richer interactions.

---

## 5. Self-review (can the stories be read from the product?)

Checklist:
- Can a first-time viewer answer “Where did money come from today?” in 10s?
- Can they answer “What liabilities did we create and when do they hit?” in 20s?
- Can they answer “Is mint queue growing, and why?” in 20s?
- Can they answer “Invite/agent leakage and net revenue?” in 20s?

Gaps to fix in next iteration:
- Add explicit “Narrative captions” under key charts (1–2 lines each)
- Add glossary tooltips for U/ANOME conversions, unlock schedules
- Add drilldown from overview to detail pages with pre-set filters

---

## 6. Next implementation step

1) Implement **one full production-grade page** to lock style: **Overview**.
2) Once style approved, replicate layout system across other pages.
3) Keep API contracts stable: `/api/views` and `/api/views/:id/data`.

