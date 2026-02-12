export interface MockDataContext {
  from?: string
  to?: string
}

// --- Anome One (auto-battle) mock dataset ---

export const fetchOverviewKpis = async (_ctx?: MockDataContext) => ({
  purchaseUsdToday: 128430.55,
  buybackUsdToday: 25686.11,
  treasuryNetUsdToday: 82440.22,
  unlockUToday: 19320.0,
  pendingMintAnome: 18400231.12,
  pendingMintUAtCurrent: 22150.76,
  unlockPressureU7d: 141200.0
})

export const fetchFunnel = async (_ctx?: MockDataContext) => ({
  steps: [
    { id: 'visit', name: 'Visit', total: 182340 },
    {
      id: 'login',
      name: 'Login',
      total: 26840,
      breakdown: {
        social: 21460,
        wallet: 5380
      }
    },
    { id: 'enter_game', name: 'Enter Anome One', total: 16210 },
    { id: 'buy_card', name: 'Buy Card (USDT)', total: 4620 },
    { id: 'one_click_play', name: 'One-click Play', total: 3580 },
    { id: 'mint', name: 'Mint ANOME', total: 1240 }
  ]
})

export const fetchPurchaseWaterfall = async (_ctx?: MockDataContext) => ({
  grossUsd: 128430.55,
  referralUsd: 3210.76,
  agentUsd: 1890.23,
  buybackUsd: 25686.11,
  treasuryUsd: 82440.22
})

export const fetchUnlockSchedule = async (_ctx?: MockDataContext) => {
  // 30-day schedule; first 7 days front-loaded (35-40%), winner/loser curves differ.
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const win = days.map((d) => {
    if (d <= 7) return 520 + (7 - d) * 18
    return 260
  })
  const lose = days.map((d) => {
    if (d <= 7) return 880 + (7 - d) * 22
    return 420
  })
  return { days, winU: win, loseU: lose }
}

export const fetchMintQueue = async (_ctx?: MockDataContext) => ({
  anomePriceU: 0.001204,
  pendingMintAvgPriceU: 0.001183,
  buckets: [
    { label: '0–1d', anome: 3200123.1 },
    { label: '2–7d', anome: 5401222.6 },
    { label: '8–30d', anome: 9808885.4 }
  ],
  valueDeltaU: {
    uAtUnlock: 19720.88,
    uAtCurrent: 22150.76,
    delta: 2429.88
  }
})

// -----------------------------
// Acquisition & Identity
// -----------------------------

export const fetchAcquisitionKpis = async (_ctx?: MockDataContext) => ({
  visits24h: 182340,
  signups24h: 12980,
  actives24h: 16210,
  conversionVisitToLogin: 0.147,
  inviteCoverage: 0.62,
  agentCoverage: 0.18
})

export const fetchTrafficSources = async (_ctx?: MockDataContext) => ({
  sources: [
    { name: 'Organic', visits: 82440, cvrLogin: 0.13 },
    { name: 'Invite link', visits: 45600, cvrLogin: 0.18 },
    { name: 'Agent', visits: 29800, cvrLogin: 0.16 },
    { name: 'Paid', visits: 24500, cvrLogin: 0.11 }
  ]
})

export const fetchLoginDistribution = async (_ctx?: MockDataContext) => ({
  social: 21460,
  wallet: 5380,
  walletCreatedAuto: 3920,
  walletExisting: 1460
})

export const fetchWalletQuality = async (_ctx?: MockDataContext) => ({
  duplicatedDeviceRate: 0.021,
  duplicatedWalletRate: 0.013,
  newWalletRate: 0.73,
  repeatLoginRate7d: 0.41,
  notes: 'Higher duplication often correlates with incentive farming; monitor invite-heavy traffic.'
})

export const fetchTaggingCoverage = async (_ctx?: MockDataContext) => ({
  inviteTagged: 0.62,
  agentTagged: 0.18,
  unknown: 0.20
})

// -----------------------------
// Gameplay (Anome One)
// -----------------------------

export const fetchGameplayKpis = async (_ctx?: MockDataContext) => ({
  dau: 16210,
  sessions: 48260,
  matches: 37220,
  winRate: 0.513,
  oneClickRate: 0.62
})

// Distribution: how many matches a user plays per day (one-click players)
export const fetchMatchesPerDayDistribution = async (_ctx?: MockDataContext) => ({
  buckets: [
    { label: '1', users: 4120 },
    { label: '2', users: 3160 },
    { label: '3–5', users: 5040 },
    { label: '6–10', users: 2720 },
    { label: '11–20', users: 920 },
    { label: '21+', users: 250 }
  ]
})

export const fetchGameplayTrend = async (_ctx?: MockDataContext) => ({
  days: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'D0'],
  dau: [13200, 14040, 14610, 15180, 15820, 16010, 16210],
  matches: [30120, 31600, 32220, 33880, 35100, 36210, 37220],
  sessions: [40200, 41880, 43220, 44810, 46330, 47210, 48260]
})

export const fetchRewardCreation = async (_ctx?: MockDataContext) => ({
  // Legacy shape (kept for compatibility; gameplay UI no longer uses rank buckets)
  winRewardU: 6420.5,
  loseSubsidyU: 12900.0,
  totalCreatedU: 19320.5,
  byRank: []
})

export const fetchRewardCreationTrend30d = async (_ctx?: MockDataContext) => {
  // 30-day daily reward creation (U) trend
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${mm}-${dd}`
  })

  // Deterministic-ish curve: weekday effects + slight growth
  const base = 15200
  const values = days.map((_, i) => {
    const wobble = Math.sin(i / 3) * 1100 + Math.cos(i / 5) * 700
    const growth = i * 35
    const v = base + wobble + growth
    return Math.max(8200, Math.round(v))
  })

  return { days, totalCreatedU: values }
}

export const fetchPurchasedNotPlayed = async (_ctx?: MockDataContext) => ({
  users: 1280,
  rateAmongBuyers: 0.277
})

// -----------------------------
// Monetization
// -----------------------------

export const fetchMonetizationKpis = async (_ctx?: MockDataContext) => ({
  grossUsd24h: 128430.55,
  payers24h: 4620,
  arppuUsd24h: 27.8,
  takeRateNet: 0.642,
  // ratios requested
  newUserPayerRate24h: 0.084,
  autoBattleOpenedPayerRate24h: 0.285,
  referralPayoutUsd24h: 3210.76,
  agentPayoutUsd24h: 1890.23
})

export const fetchPurchasesTrend = async (_ctx?: MockDataContext) => ({
  days: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'D0'],
  grossUsd: [90210, 99640, 110230, 104880, 118760, 122410, 128430],
  payers: [3410, 3620, 3980, 3720, 4210, 4480, 4620]
})

export const fetchPackageMix = async (_ctx?: MockDataContext) => ({
  packages: [
    { name: 'Starter', usd: 18920 },
    { name: 'Standard', usd: 41220 },
    { name: 'Pro', usd: 50310 },
    { name: 'Whale', usd: 17980 }
  ]
})

export const fetchChannelAttribution = async (_ctx?: MockDataContext) => ({
  byChannel: [
    { name: 'Invite', grossUsd: 48720, payers: 1710, payoutUsd: 2436 },
    { name: 'Agent', grossUsd: 30910, payers: 1120, payoutUsd: 1545 },
    { name: 'Organic', grossUsd: 41180, payers: 1610, payoutUsd: 0 },
    { name: 'Paid', grossUsd: 7610, payers: 180, payoutUsd: 0 }
  ],
  topAgents: [
    { agent: 'agent_0xA3…19F', grossUsd: 8820, payoutUsd: 352 },
    { agent: 'agent_0xBC…120', grossUsd: 7410, payoutUsd: 296 },
    { agent: 'agent_0x91…7E1', grossUsd: 6030, payoutUsd: 241 }
  ]
})

// -----------------------------
// Rewards & Vesting
// -----------------------------

export const fetchRewardsKpis = async (_ctx?: MockDataContext) => ({
  unlockU24h: 19320.0,
  unlockU7d: 141200.0,
  pendingMintAnome: 18400231.12,
  mintRate24h: 0.37,
  medianTimeToMintH: 19.4,
  valueDeltaU: 2429.88
})

export const fetchMintBehavior = async (_ctx?: MockDataContext) => ({
  timeToMintBucketsH: [0, 6, 12, 24, 48, 72, 168],
  share: [0.08, 0.12, 0.17, 0.22, 0.18, 0.12, 0.11],
  mintedAnome24h: 6812000,
  mintedU24hAtCurrent: 8201.5
})

// -----------------------------
// Tokenomics
// -----------------------------

export const fetchTokenomicsKpis = async (_ctx?: MockDataContext) => ({
  priceU: 0.001204,
  totalSupplyAnome: 1000000000,
  circulatingAnome: 214500000,
  pendingMintAnome: 18400231.12,
  emissionAnome24h: 1602000,
  netEmissionAnome24h: 1294000
})

export const fetchSupplyTrend = async (_ctx?: MockDataContext) => ({
  days: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'D0'],
  circulating: [208.1, 209.0, 210.4, 211.5, 212.2, 213.4, 214.5].map((m) => Math.round(m * 1e6))
})

// -----------------------------
// Treasury
// -----------------------------

export const fetchTreasuryKpis = async (_ctx?: MockDataContext) => ({
  treasuryBalanceUsd: 842003.22,
  treasuryNetUsd24h: 82440.22,
  buybackUsd24h: 25686.11,
  runwayDays: 76,
  coverageU7d: 1.42,
  coverageU30d: 1.08
})

export const fetchTreasuryCashflow = async (_ctx?: MockDataContext) => ({
  days: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'D0'],
  inflow: [52210, 60420, 71880, 66620, 74420, 80110, 82440],
  outflow: [12020, 14110, 15220, 13200, 16510, 17220, 18460]
})

export const fetchTreasuryAllocation = async (_ctx?: MockDataContext) => ({
  buckets: [
    { name: 'USDT', usd: 612000 },
    { name: 'ANOME (marked)', usd: 154000 },
    { name: 'LP / Other', usd: 76000 }
  ]
})

// -----------------------------
// Risk & Compliance
// -----------------------------

export const fetchRiskKpis = async (_ctx?: MockDataContext) => ({
  unlockU24h: 19320.0,
  unlockU3d: 60200.0,
  unlockU7d: 141200.0,
  concentrationTop10: 0.47,
  priceDown20NetEmissionAnome7d: 1.28,
  riskScore: 71
})

export const fetchPendingMintConcentration = async (_ctx?: MockDataContext) => ({
  top: [
    { address: '0x9c…12a', pendingAnome: 1820000, estUAtCurrent: 2191.3 },
    { address: '0xb1…e07', pendingAnome: 1460000, estUAtCurrent: 1758.0 },
    { address: '0x44…6d9', pendingAnome: 1210000, estUAtCurrent: 1457.4 },
    { address: '0x2f…0aa', pendingAnome: 980000, estUAtCurrent: 1179.9 },
    { address: '0x70…a18', pendingAnome: 860000, estUAtCurrent: 1035.4 }
  ]
})

export const fetchScenarioTable = async (_ctx?: MockDataContext) => ({
  scenarios: [
    { name: 'Price -20%', anomePriceU: 0.000963, unlockU7d: 141200, mintRequiredAnome7d: 146.6e6 },
    { name: 'Base', anomePriceU: 0.001204, unlockU7d: 141200, mintRequiredAnome7d: 117.3e6 },
    { name: 'Price +20%', anomePriceU: 0.001445, unlockU7d: 141200, mintRequiredAnome7d: 97.7e6 }
  ]
})

// -----------------------------
// Reports
// -----------------------------

export const fetchWeeklyReport = async (_ctx?: MockDataContext) => ({
  period: 'Last 7 days',
  highlights: [
    'Gross purchases up +6.4% WoW; payers +3.1% (ARPPU stable).',
    'Unlock pressure +9.8% driven by match volume; mint rate softened to 37%.',
    'Treasury coverage remains >1.0x for 30d, but top-10 concentration at 47%.'
  ],
  kpis: {
    grossUsd7d: 812430,
    payers7d: 31240,
    unlockU7d: 141200,
    buybackUsd7d: 171260,
    treasuryNetUsd7d: 521880
  },
  recommendations: [
    'Tighten invite/agent tagging coverage (unknown at 20%).',
    'Increase buyback intensity on high-pressure days (T+3 window).',
    'Monitor top pending-mint addresses for coordinated behavior.'
  ]
})

// -----------------------------
// Admin
// -----------------------------

export const fetchAllowlist = async () => ({
  entries: [
    { email: 'ops@anome.example', role: 'admin', addedAt: '2026-02-01' },
    { email: 'finance@anome.example', role: 'admin', addedAt: '2026-02-03' },
    { email: 'ceo@anome.example', role: 'superadmin', addedAt: '2026-02-01' }
  ]
})

// Legacy mocks (kept for future pages)
export const fetchRoleDistribution = async () => ({
  user: 36,
  admin: 5,
  superadmin: 1
})

export const fetchUserGrowthTrend = async () => [10, 16, 21, 28, 32, 40, 42]

export const fetchEngagementSummary = async () => ({
  dau: 31,
  wau: 132,
  avgSessionMin: 18
})
