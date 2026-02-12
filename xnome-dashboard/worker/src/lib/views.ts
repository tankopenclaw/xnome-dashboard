import type { ViewContext, ViewDefinition } from '../types'
import {
  fetchAcquisitionKpis,
  fetchAllowlist,
  fetchChannelAttribution,
  fetchEngagementSummary,
  fetchFunnel,
  fetchGameplayKpis,
  fetchGameplayTrend,
  fetchLoginDistribution,
  fetchMintBehavior,
  fetchMintQueue,
  fetchMonetizationKpis,
  fetchOverviewKpis,
  fetchPackageMix,
  fetchPendingMintConcentration,
  fetchPurchaseWaterfall,
  fetchPurchasesTrend,
  fetchRewardCreation,
  fetchRewardCreationTrend30d,
  fetchPurchasedNotPlayed,
  fetchRewardsKpis,
  fetchRiskKpis,
  fetchRoleDistribution,
  fetchScenarioTable,
  fetchSupplyTrend,
  fetchTaggingCoverage,
  fetchTokenomicsKpis,
  fetchTrafficSources,
  fetchMatchesPerDayDistribution,
  fetchTreasuryAllocation,
  fetchTreasuryCashflow,
  fetchTreasuryKpis,
  fetchUnlockSchedule,
  fetchWalletQuality,
  fetchWeeklyReport
} from './mockData'

const viewRegistry: Record<string, ViewDefinition> = {
  overview: {
    id: 'overview',
    name: 'Overview',
    description: 'Anome One executive cockpit: growth → monetization → liabilities → mint queue.',
    sources: ['overviewKpis', 'funnel', 'purchaseWaterfall', 'unlockSchedule', 'mintQueue'],
    getData: async (ctx: ViewContext) => {
      const [kpis, funnel, waterfall, unlockSchedule, mintQueue] = await Promise.all([
        fetchOverviewKpis(ctx.filters),
        fetchFunnel(ctx.filters),
        fetchPurchaseWaterfall(ctx.filters),
        fetchUnlockSchedule(ctx.filters),
        fetchMintQueue(ctx.filters)
      ])
      return { kpis, funnel, waterfall, unlockSchedule, mintQueue }
    }
  },

  acquisition: {
    id: 'acquisition',
    name: 'Acquisition & Identity',
    description: 'Traffic sources, login distribution, wallet assignment quality, and tagging coverage.',
    sources: ['acquisitionKpis', 'trafficSources', 'loginDistribution', 'walletQuality', 'taggingCoverage'],
    getData: async (ctx: ViewContext) => {
      const [kpis, sources, login, walletQuality, tagging] = await Promise.all([
        fetchAcquisitionKpis(ctx.filters),
        fetchTrafficSources(ctx.filters),
        fetchLoginDistribution(ctx.filters),
        fetchWalletQuality(ctx.filters),
        fetchTaggingCoverage(ctx.filters)
      ])
      return { kpis, sources, login, walletQuality, tagging }
    }
  },

  gameplay: {
    id: 'gameplay',
    name: 'Gameplay — Anome One',
    description: 'DAU, matches, win-rate, sessions, and reward creation diagnostics.',
    sources: ['gameplayKpis', 'gameplayTrend', 'rewardCreationTrend30d', 'purchasedNotPlayed', 'matchesPerDayDistribution'],
    getData: async (ctx: ViewContext) => {
      const [kpis, trend, rewardTrend30d, purchasedNotPlayed, matchesPerDay] = await Promise.all([
        fetchGameplayKpis(ctx.filters),
        fetchGameplayTrend(ctx.filters),
        fetchRewardCreationTrend30d(ctx.filters),
        fetchPurchasedNotPlayed(ctx.filters),
        fetchMatchesPerDayDistribution(ctx.filters)
      ])
      return { kpis, trend, rewardTrend30d, purchasedNotPlayed, matchesPerDay }
    }
  },

  monetization: {
    id: 'monetization',
    name: 'Monetization',
    description: 'Purchases, ARPPU, package mix, attribution, and net waterfall.',
    sources: ['monetizationKpis', 'purchasesTrend', 'packageMix', 'channelAttribution', 'purchaseWaterfall'],
    getData: async (ctx: ViewContext) => {
      const [kpis, trend, mix, attribution, waterfall] = await Promise.all([
        fetchMonetizationKpis(ctx.filters),
        fetchPurchasesTrend(ctx.filters),
        fetchPackageMix(ctx.filters),
        fetchChannelAttribution(ctx.filters),
        fetchPurchaseWaterfall(ctx.filters)
      ])
      return { kpis, trend, mix, attribution, waterfall }
    }
  },

  rewards: {
    id: 'rewards',
    name: 'Rewards & Vesting',
    description: 'Unlock schedule, mint queue, mint rate, and time-to-mint behavior.',
    sources: ['rewardsKpis', 'unlockSchedule', 'mintQueue', 'mintBehavior'],
    getData: async (ctx: ViewContext) => {
      const [kpis, unlockSchedule, mintQueue, mintBehavior] = await Promise.all([
        fetchRewardsKpis(ctx.filters),
        fetchUnlockSchedule(ctx.filters),
        fetchMintQueue(ctx.filters),
        fetchMintBehavior(ctx.filters)
      ])
      return { kpis, unlockSchedule, mintQueue, mintBehavior }
    }
  },

  tokenomics: {
    id: 'tokenomics',
    name: 'Tokenomics',
    description: 'Supply and emissions (burn not applicable).',
    sources: ['tokenomicsKpis', 'supplyTrend'],
    getData: async (ctx: ViewContext) => {
      const [kpis, trend] = await Promise.all([fetchTokenomicsKpis(ctx.filters), fetchSupplyTrend(ctx.filters)])
      return { kpis, trend }
    }
  },

  treasury: {
    id: 'treasury',
    name: 'Treasury',
    description: 'Treasury balance, cashflow, allocation, runway, and coverage.',
    sources: ['treasuryKpis', 'treasuryCashflow', 'treasuryAllocation'],
    getData: async (ctx: ViewContext) => {
      const [kpis, cashflow, allocation] = await Promise.all([
        fetchTreasuryKpis(ctx.filters),
        fetchTreasuryCashflow(ctx.filters),
        fetchTreasuryAllocation(ctx.filters)
      ])
      return { kpis, cashflow, allocation }
    }
  },

  risk: {
    id: 'risk',
    name: 'Risk & Compliance',
    description: 'Unlock pressure windows, concentration, and price scenarios.',
    sources: ['riskKpis', 'pendingMintConcentration', 'scenarioTable'],
    getData: async (ctx: ViewContext) => {
      const [kpis, concentration, scenarios] = await Promise.all([
        fetchRiskKpis(ctx.filters),
        fetchPendingMintConcentration(ctx.filters),
        fetchScenarioTable(ctx.filters)
      ])
      return { kpis, concentration, scenarios }
    }
  },

  reports: {
    id: 'reports',
    name: 'Reports',
    description: 'Auto-generated weekly narrative and executive KPIs.',
    sources: ['weeklyReport'],
    getData: async (ctx: ViewContext) => {
      const report = await fetchWeeklyReport(ctx.filters)
      return { report }
    }
  },

  admin: {
    id: 'admin',
    name: 'Admin',
    description: 'RBAC, allowlist, and operator controls.',
    sources: ['allowlist', 'roleDistribution', 'engagementSummary'],
    getData: async (ctx: ViewContext) => {
      const allowed = ctx.role === 'admin' || ctx.role === 'superadmin'
      if (!allowed) {
        // Keep contract stable for the frontend in preview mode.
        return { allowed: false, reason: 'Insufficient role', role: ctx.role || 'anonymous' }
      }

      const [allowlist, byRole, engagement] = await Promise.all([
        fetchAllowlist(),
        fetchRoleDistribution(),
        fetchEngagementSummary()
      ])

      return { allowed: true, allowlist, byRole, engagement }
    }
  },

  // Existing internal view (not in nav yet)
  users: {
    id: 'users',
    name: 'Users',
    description: 'User growth and role distribution.',
    sources: ['roleDistribution', 'userGrowthTrend'],
    getData: async () => {
      const [byRole, trend, engagement] = await Promise.all([
        fetchRoleDistribution(),
        // kept for legacy
        Promise.resolve([10, 16, 21, 28, 32, 40, 42]),
        fetchEngagementSummary()
      ])
      return { byRole, trend, engagement }
    }
  }
}

export const listViews = () => Object.values(viewRegistry)
export const getView = (id: string) => viewRegistry[id]

export const registerView = (view: ViewDefinition) => {
  viewRegistry[view.id] = view
}
