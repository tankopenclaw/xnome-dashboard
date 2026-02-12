import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const I18NContext = createContext(null)

const dict = {
  en: {
    nav: {
      overview: 'Overview',
      acquisition: 'Acquisition',
      gameplay: 'Activation & Retention',
      monetization: 'Revenue',
      rewards: 'Rewards & Settlement',
      // tokenomics removed
      treasury: 'Treasury',
      risk: 'Risk',
      reports: 'Reports',
      admin: 'Admin'
    },
    shell: {
      dataConsole: 'DATA CONSOLE',
      live: 'Anome One • Live',
      build: 'Build: preview'
    },
    common: {
      language: 'EN',
      todo: 'TODO',
      apiError: 'API Error',
      segmentAll: 'Segment: All',
      filters24h: '24h',
      filters7d: '7d',
      filters30d: '30d',
      unitUsd: 'USD',
      unitU: 'U',
      unitAnome: 'ANOME'
    },
    overview: {
      title: 'Overview',
      subtitle: 'Anome One executive cockpit — growth, revenue, liabilities, and mint queue.',
      filters24h: '24h',
      unitToggle: 'U ↔ ANOME',
      previewAuth: 'Preview auth',
      kpi: {
        gross: 'Gross Purchase (Today)',
        buyback: 'Buyback (Today)',
        treasury: 'Treasury Net (Today)',
        unlock: 'Unlock (Today)',
        pendingMint: 'Pending Mint',
        unlockPressure: 'Unlock Pressure (7d)'
      },
      hints: {
        gross: 'USDT spent on cards',
        buyback: 'Purchase split into buyback',
        treasury: 'Net to treasury after splits',
        unlock: 'U-denominated liability unlocked',
        pending: 'Unlocked-not-minted queue',
        pressure: 'Projected unlock value'
      },
      panels: {
        funnelTitle: 'Growth quality funnel',
        funnelSubtitle: 'Visit → Login (social/wallet) → Enter → Buy → One-click → Mint',
        waterfallTitle: 'USDT purchase waterfall',
        waterfallSubtitle: 'Gross → referral/agent → buyback → treasury',
        unlockTitle: 'Unlock schedule (30d)',
        unlockSubtitle: 'Front-loaded first 7d (35–40%); different curves for win vs lose',
        queueTitle: 'Mint queue',
        queueSubtitle: 'Unlocked-not-minted ANOME by age bucket + value delta',
        story: 'Story'
      },
      story: {
        funnel:
          'Growth quality is measured by how efficiently traffic turns into payers and how payers complete the mint loop.',
        queue:
          'Pending mint is latent emission pressure. When ANOME price rises, users may delay mint; when it falls, mint can accelerate.'
      },
      misc: {
        segmentAll: 'Segment: All',
        loginSplit: 'Login split',
        price: 'Price',
        uAtUnlock: 'U @ unlock',
        uAtCurrent: 'U @ current',
        delta: 'Delta',
        apiError: 'API Error',
        apiErrorSub: 'Unable to load overview data.'
      }
    },

    acquisition: {
      title: 'Acquisition & Identity',
      subtitle: 'Traffic sources → identity mapping → wallet quality → attribution coverage.',
      kpi: {
        visits: 'Visits (24h)',
        signups: 'Signups (24h)',
        actives: 'Actives (24h)',
        cvr: 'Visit → Login',
        inviteCoverage: 'Invite coverage',
        agentCoverage: 'Agent coverage'
      },
      hints: {
        visits: 'Landing traffic',
        signups: 'New accounts created',
        actives: 'Entered Anome One',
        cvr: 'Login / visit',
        inviteCoverage: 'Share of sessions tagged invite',
        agentCoverage: 'Share of sessions tagged agent'
      },
      panels: {
        sourcesTitle: 'Traffic sources',
        sourcesSubtitle: 'Where visits come from (24h)',
        loginTitle: 'Login distribution',
        loginSubtitle: 'Social vs wallet login',
        walletTitle: 'Wallet assignment quality',
        walletSubtitle: 'Duplication + new-wallet rate + repeat login',
        taggingTitle: 'Invite/agent tagging',
        taggingSubtitle: 'Coverage (tagged vs unknown)',
        story: 'Story'
      },
      story: {
        walletQuality:
          'Identity quality protects growth quality. Duplication spikes are often farming; new-wallet rate drives on-chain footprint.',
        tagging:
          'Attribution coverage should be high enough to trust referral/agent ROI. “Unknown” is hidden leakage.'
      },
      misc: {
        socialLogin: 'Social',
        walletLogin: 'Wallet',
        autoWallet: 'Auto-created wallets',
        invite: 'Invite',
        agent: 'Agent',
        unknown: 'Unknown',
        dupDevice: 'Duplicated device rate',
        dupWallet: 'Duplicated wallet rate',
        newWallet: 'New wallet rate',
        repeat7d: 'Repeat login (7d)',
        note: 'Notes'
      }
    },

    gameplay: {
      title: 'Gameplay — Anome One',
      subtitle: 'Activity, match flow, win-rate, and reward creation trend.',
      kpi: {
        dau: 'DAU',
        sessions: 'Sessions',
        matches: 'Matches',
        winRate: 'Win rate',
        oneClick: 'One-click play rate',
        purchasedNotPlayed: 'Bought cards, not started'
      },
      hints: {
        dau: 'Daily active players',
        sessions: 'Sessions started',
        matches: 'Matches resolved',
        winRate: 'Wins / matches',
        oneClick: 'One-click plays / matches',
        purchasedNotPlayed: 'Users who bought a card but have not entered/started Auto Battle yet (count + % among buyers)'
      },
      panels: {
        trendTitle: 'Activity trend',
        trendSubtitle: 'DAU, sessions, matches (7d)',
        rewardsTitle: 'Reward creation trend (30d)',
        rewardsSubtitle: 'Daily reward creation (U) for the last 30 days',
        matchesDistTitle: 'Matches per user (daily)',
        matchesDistSubtitle: 'Distribution of matches played per user per day',
        story: 'Story'
      },
      story: {
        rewards:
          'Gameplay volume creates U liabilities. If matches spike, unlock pressure rises even if revenue is flat.'
      },
      misc: {
        dau: 'DAU',
        sessions: 'Sessions',
        matches: 'Matches',
        users: 'Users',
        uCreated: 'U created',
        totalCreated: 'Today (U)',
        total30d: 'Last 30d total (U)',
        matchesLower: 'matches'
      }
    },

    monetization: {
      title: 'Revenue',
      subtitle: 'Purchases, channel attribution, and net waterfall economics.',
      kpi: {
        gross: 'Gross (24h)',
        payers: 'Payers (24h)',
        arppu: 'ARPPU (24h)',
        takeRate: 'Net take-rate',
        newPayerRate: 'New user payer rate (D0)',
        openedPayerRate: 'Auto Battle opened payer rate',
        referral: 'Referral payout (24h)',
        agent: 'Agent payout (24h)'
      },
      hints: {
        gross: 'USDT spent on cards',
        payers: 'Unique purchasers',
        arppu: 'Gross / payers',
        takeRate: 'Treasury / gross (approx)',
        newPayerRate: 'Among today\'s new users: payers / new users',
        openedPayerRate: 'Among users who opened Auto Battle: payers / opened',
        referral: 'Invite payout (5%)',
        agent: 'Agent payout (1–5%)'
      },
      panels: {
        trendTitle: 'Purchases trend',
        trendSubtitle: 'Gross USDT vs payers',
        mixTitle: 'Package mix',
        mixSubtitle: 'Revenue by package/price point',
        attrTitle: 'Attribution',
        attrSubtitle: 'Invite vs agent vs organic (gross, payers, payout)',
        waterfallTitle: 'Net waterfall',
        waterfallSubtitle: 'Gross → referral/agent → buyback → treasury',
        story: 'Story'
      },
      story: {
        attr:
          'Channel economics are only as good as tagging coverage. Track payout as a percentage of gross per channel.'
      },
      misc: {
        gross: 'Gross',
        referral: 'Referral (5%)',
        agent: 'Agent (1–5%)',
        buyback: 'Buyback',
        treasury: 'Treasury',
        grossUsd: 'Gross (USD)',
        payers: 'Payers',
        payersLower: 'payers',
        topAgents: 'Top agents'
      }
    },

    rewards: {
      title: 'Rewards & Vesting',
      subtitle: 'Unlock schedule, pending-mint queue, and mint behavior.',
      kpi: {
        unlock24h: 'Unlock (24h)',
        unlock7d: 'Unlock pressure (7d)',
        pending: 'Pending mint',
        mintRate: 'Mint rate (24h)',
        ttm: 'Median time-to-mint',
        delta: 'Value delta (U)'
      },
      hints: {
        unlock24h: 'U unlocked today',
        unlock7d: 'Projected U unlock',
        pending: 'Unlocked-not-minted queue',
        mintRate: 'Minted / unlocked',
        ttm: 'Median time from unlock → mint',
        delta: 'U@unlock vs U@current for pending queue'
      },
      panels: {
        unlockTitle: 'Unlock schedule (30d)',
        unlockSubtitle: 'Front-loaded first 7d; win vs lose curves',
        queueTitle: 'Pending mint queue',
        queueSubtitle: 'Age buckets + value delta',
        mintTitle: 'Mint behavior',
        mintSubtitle: 'Time-to-mint distribution + minted volume',
        story: 'Story'
      },
      story: {
        queue:
          'Pending mint is latent emission pressure. The bigger and older the queue, the more unstable unlock-to-mint becomes.',
        mint:
          'Shorter time-to-mint increases immediate emission; longer time-to-mint increases price sensitivity and coordination risk.'
      },
      misc: {
        win: 'Win (U)',
        lose: 'Lose (U)',
        share: 'Share',
        price: 'ANOME price',
        pendingAvg: 'Pending mint avg',
        uAtUnlock: 'U @ unlock',
        uAtCurrent: 'U @ current',
        delta: 'Delta',
        mintedAnome24h: 'Minted (24h)',
        mintedU24h: 'Minted value (24h)'
      }
    },

    tokenomics: {
      title: 'Tokenomics',
      subtitle: 'Supply, circulation and emissions (no burn).',
      kpi: {
        price: 'ANOME price',
        total: 'Total supply',
        circ: 'Circulating',
        pendingMint: 'Unlocked-not-minted',
        emission: 'Emission (24h)',
        netEmission: 'Net emission (24h)'
      },
      hints: {
        price: 'Mock price feed',
        total: 'Total minted supply',
        circ: 'Estimated circulating supply',
        pendingMint: 'Unlocked-not-minted ANOME',
        emission: 'Minted/issued today',
        netEmission: 'Net emission'
      },
      panels: {
        supplyTitle: 'Supply trend',
        supplySubtitle: 'Circulating supply (7d)',
        noteTitle: 'Notes',
        noteSubtitle: 'What this page does (and does not) show',
        story: 'Story'
      },
      story: {
        note:
          'Burn is not part of Anome One today. This page focuses on circulating supply, emission, and unlocked-not-minted pressure. Burn metrics are intentionally omitted to avoid misleading operators.'
      },
      misc: {
        circulating: 'Circulating',
        burned: 'Burned'
      }
    },

    treasury: {
      title: 'Treasury',
      subtitle: 'Net inflow, allocation, runway, and liability coverage.',
      kpi: {
        balance: 'Treasury balance',
        net24h: 'Net inflow (24h)',
        buyback24h: 'Buyback (24h)',
        runway: 'Runway',
        cover7d: 'Coverage (7d)',
        cover30d: 'Coverage (30d)'
      },
      hints: {
        balance: 'Estimated treasury value',
        net24h: 'Net to treasury after splits',
        buyback24h: 'USDT allocated to buyback',
        runway: 'Days at current burn-rate (mock)',
        cover7d: 'Treasury / unlock pressure (7d)',
        cover30d: 'Treasury / unlock pressure (30d)'
      },
      panels: {
        cashflowTitle: 'Cashflow',
        cashflowSubtitle: 'Inflow vs outflow (7d)',
        allocTitle: 'Allocation',
        allocSubtitle: 'Treasury composition (marked-to-USD)',
        coverageTitle: 'Coverage',
        coverageSubtitle: 'Can treasury absorb near-term unlock pressure?',
        story: 'Story'
      },
      story: {
        coverage:
          'Coverage compares buffer vs near-term obligations. Below 1.0x indicates fragile solvency during adverse price moves.',
        takeaway: 'Prioritize buffer on T+3 high-pressure windows.'
      },
      misc: {
        inflow: 'Inflow',
        outflow: 'Outflow',
        cover7d: 'Coverage 7d',
        cover30d: 'Coverage 30d',
        takeaway: 'Takeaway'
      }
    },

    risk: {
      title: 'Risk & Compliance',
      subtitle: 'Unlock windows, concentration and scenario stress tests.',
      kpi: {
        unlock24h: 'Unlock (24h)',
        unlock3d: 'Unlock (T+3)',
        unlock7d: 'Unlock (T+7)',
        top10: 'Top-10 concentration',
        scenario: 'Price -20% emission (7d)',
        score: 'Risk score'
      },
      hints: {
        unlock24h: 'Upcoming unlock value',
        unlock3d: '3-day unlock window',
        unlock7d: '7-day unlock window',
        top10: 'Share held by top pending-mint',
        scenario: 'Mint required vs base (multiplier)',
        score: 'Composite indicator (mock)'
      },
      panels: {
        concentrationTitle: 'Pending mint concentration',
        concentrationSubtitle: 'Top pending-mint addresses (ANOME)',
        scenarioTitle: 'Scenario: mint required (7d)',
        scenarioSubtitle: 'Price sensitivity of unlock→ANOME conversion',
        tableTitle: 'Scenario table',
        tableSubtitle: 'Price + unlock + required mint',
        story: 'Story'
      },
      story: {
        concentration:
          'High concentration increases coordinated sell pressure risk. Monitor top holders and age of their pending mint.'
      },
      misc: {
        pending: 'Pending (ANOME)',
        mintRequired: 'Mint required (ANOME)',
        price: 'Price',
        unlock7d: 'Unlock 7d'
      }
    },

    reports: {
      title: 'Reports',
      subtitle: 'Auto-generated weekly narrative — growth, revenue, liabilities, treasury.',
      kpi: {
        gross7d: 'Gross (7d)',
        payers7d: 'Payers (7d)',
        unlock7d: 'Unlock (7d)',
        buyback7d: 'Buyback (7d)',
        treasury7d: 'Treasury net (7d)',
        period: 'Period'
      },
      panels: {
        weeklyTitle: 'This week in Anome One',
        weeklySubtitle: 'Key highlights (auto)',
        recoTitle: 'Recommendations',
        recoSubtitle: 'Operator actions for next week',
        exportTitle: 'Export',
        exportSubtitle: 'PDF/CSV export hooks (later)',
        story: 'Story'
      },
      story: {
        weekly:
          'Reports are meant to be pasted into ops channels: short, KPI-linked, and action-oriented.'
      },
      misc: {
        autoNarrative: 'Auto',
        highlight: 'Highlight',
        action: 'Action',
        exportTodo: 'Add PDF/CSV export endpoints and a report composer.'
      }
    },

    admin: {
      title: 'Admin',
      subtitle: 'Allowlist, roles and auditability (preview mocks).',
      kpi: {
        users: 'Users',
        admins: 'Admins',
        superadmins: 'Superadmins',
        dau: 'DAU',
        wau: 'WAU',
        session: 'Avg session'
      },
      panels: {
        allowlistTitle: 'Allowlist',
        allowlistSubtitle: 'Emails allowed to sign in (mock)',
        rbacTitle: 'RBAC',
        rbacSubtitle: 'Role distribution + rules (mock)'
      },
      misc: {
        roleGated: 'Role-gated',
        deniedTitle: 'Access denied',
        deniedSubtitle: 'This page requires admin or superadmin.',
        deniedText: 'You are not authorized to view admin controls.',
        access: 'Access',
        currentRole: 'Current role',
        allowlistTodo: 'Wire allowlist editing + write-back to storage.',
        roles: 'Roles',
        audit: 'Audit log',
        auditTodo: 'Add audit log (auth + changes) and export.'
      }
    }
  },

  zh: {
    nav: {
      overview: '总览',
      acquisition: '获客',
      gameplay: '激活与留存',
      monetization: '收入',
      rewards: '奖励与结算',
      // tokenomics removed
      treasury: '国库',
      risk: '风险',
      reports: '报告',
      admin: '管理'
    },
    shell: {
      dataConsole: '数据控制台',
      live: 'Anome One • 实时',
      build: '版本：预览'
    },
    common: {
      language: '中文',
      todo: '待办',
      apiError: '接口错误',
      segmentAll: '分群：全部',
      filters24h: '24小时',
      filters7d: '7天',
      filters30d: '30天',
      unitUsd: 'USD',
      unitU: 'U',
      unitAnome: 'ANOME'
    },
    overview: {
      title: '总览',
      subtitle: 'Anome One 总控台：增长、收入、负债与待 Mint 队列。',
      filters24h: '24小时',
      unitToggle: 'U ↔ ANOME',
      previewAuth: '预览模式',
      kpi: {
        gross: '今日买卡总额',
        buyback: '今日回购',
        treasury: '今日国库净入',
        unlock: '今日解锁(U)',
        pendingMint: '待 Mint',
        unlockPressure: '未来7天释放压力'
      },
      hints: {
        gross: '买卡 USDT',
        buyback: '买卡分账：回购',
        treasury: '买卡分账：国库',
        unlock: '当日解锁负债（U本位）',
        pending: '已解锁未 Mint',
        pressure: '预估释放（U本位）'
      },
      panels: {
        funnelTitle: '用户漏斗（质量）',
        funnelSubtitle: '访问 → 登录(社交/钱包) → 进入 → 买卡 → 一键玩 → Mint',
        waterfallTitle: '买卡 USDT 分账瀑布',
        waterfallSubtitle: '总额 → 邀请/代理 → 回购 → 国库',
        unlockTitle: '30天解锁曲线',
        unlockSubtitle: '前7天前置释放（35–40%）；输赢曲线不同',
        queueTitle: '待 Mint 队列',
        queueSubtitle: '按时间桶统计 + 解锁价值对比当前价值',
        story: '数据故事'
      },
      story: {
        funnel: '漏斗用于衡量流量到付费再到完成 Mint 闭环的效率，决定增长质量。',
        queue: '待 Mint 是潜在释放压力：价格上涨时更可能延后 Mint，价格下跌时 Mint 可能加速。'
      },
      misc: {
        segmentAll: '分群：全部',
        loginSplit: '登录结构',
        price: '价格',
        uAtUnlock: '解锁时U',
        uAtCurrent: '当前U',
        delta: '差值',
        apiError: '接口错误',
        apiErrorSub: '无法加载总览数据。'
      }
    },

    acquisition: {
      title: '获客与身份',
      subtitle: '来源 → 身份映射 → 钱包质量 → 归因覆盖。',
      kpi: {
        visits: '访问(24h)',
        signups: '注册(24h)',
        actives: '进入游戏(24h)',
        cvr: '访问→登录',
        inviteCoverage: '邀请覆盖',
        agentCoverage: '代理覆盖'
      },
      hints: {
        visits: '落地页流量',
        signups: '新账号',
        actives: '进入 Anome One',
        cvr: '登录/访问',
        inviteCoverage: '带邀请标签比例',
        agentCoverage: '带代理标签比例'
      },
      panels: {
        sourcesTitle: '流量来源',
        sourcesSubtitle: '访问来自哪里(24h)',
        loginTitle: '登录结构',
        loginSubtitle: '社交 vs 钱包',
        walletTitle: '钱包分配质量',
        walletSubtitle: '重复率 + 新钱包比例 + 回访',
        taggingTitle: '邀请/代理标签',
        taggingSubtitle: '覆盖率（已标记 vs 未知）',
        story: '数据故事'
      },
      story: {
        walletQuality: '身份质量决定增长质量。重复率上升往往意味着刷量/套利；新钱包比例影响链上足迹。',
        tagging: '归因覆盖要足够高，才有资格评估邀请/代理 ROI；Unknown 代表隐性漏损。'
      },
      misc: {
        socialLogin: '社交',
        walletLogin: '钱包',
        autoWallet: '自动创建钱包',
        invite: '邀请',
        agent: '代理',
        unknown: '未知',
        dupDevice: '设备重复率',
        dupWallet: '钱包重复率',
        newWallet: '新钱包比例',
        repeat7d: '7天回访',
        note: '备注'
      }
    },

    gameplay: {
      title: '玩法 — Anome One',
      subtitle: '活跃、对局、胜率与负债产生驱动。',
      kpi: {
        dau: 'DAU',
        sessions: '会话',
        matches: '对局',
        winRate: '胜率',
        oneClick: '一键玩比例',
        purchasedNotPlayed: '已买卡未投入游戏'
      },
      hints: {
        dau: '日活玩家',
        sessions: '启动会话',
        matches: '结算对局',
        winRate: '胜场/总场',
        oneClick: '一键玩/对局',
        purchasedNotPlayed: '已完成买卡但还未进入/开始 Auto Battle 的用户：数量与占比（占买卡用户）'
      },
      panels: {
        trendTitle: '活跃趋势',
        trendSubtitle: 'DAU、会话、对局(7天)',
        rewardsTitle: '奖励产生趋势（30天）',
        rewardsSubtitle: '近一个月每日奖励产生（U）',
        matchesDistTitle: '人均对局分布（每日）',
        matchesDistSubtitle: '每天每个用户玩多少局的分布',
        story: '数据故事'
      },
      story: {
        rewards: '对局量会直接产生 U 负债；若对局激增，即使收入不变，释放压力也会上升。'
      },
      misc: {
        dau: 'DAU',
        sessions: '会话',
        matches: '对局',
        users: '用户',
        uCreated: '产生U',
        winReward: '胜利奖励(U)',
        loseSubsidy: '失败补贴(U)',
        totalCreated: '当日产生(U)',
        total30d: '近30天合计(U)',
        matchesLower: '场'
      }
    },

    monetization: {
      title: '收入',
      subtitle: '买卡、渠道归因与净分账。',
      kpi: {
        gross: '买卡总额(24h)',
        payers: '付费人数(24h)',
        arppu: 'ARPPU(24h)',
        takeRate: '净留存率',
        newPayerRate: '当日新用户付费率(D0)',
        openedPayerRate: '打开过 Auto Battle 付费率',
        referral: '邀请返佣(24h)',
        agent: '代理返佣(24h)'
      },
      hints: {
        gross: '买卡 USDT',
        payers: '唯一付费人数',
        arppu: '总额/人数',
        takeRate: '国库/总额(近似)',
        newPayerRate: '当日新用户中：付费人数/新用户数',
        openedPayerRate: '打开过 Auto Battle 的用户中：付费人数/打开人数',
        referral: '邀请分成(5%)',
        agent: '代理分成(1–5%)'
      },
      panels: {
        trendTitle: '买卡趋势',
        trendSubtitle: '总额 vs 付费人数',
        mixTitle: '档位结构',
        mixSubtitle: '按档位的收入构成',
        attrTitle: '渠道归因',
        attrSubtitle: '邀请/代理/自然（总额、人数、返佣）',
        waterfallTitle: '净分账瀑布',
        waterfallSubtitle: '总额 → 邀请/代理 → 回购 → 国库',
        story: '数据故事'
      },
      story: {
        attr: '渠道经济好坏取决于归因覆盖。需要持续关注各渠道返佣占比与净留存。'
      },
      misc: {
        gross: '总额',
        referral: '邀请(5%)',
        agent: '代理(1–5%)',
        buyback: '回购',
        treasury: '国库',
        grossUsd: '总额(USD)',
        payers: '付费人数',
        payersLower: '人',
        topAgents: '头部代理'
      }
    },

    rewards: {
      title: '奖励与释放',
      subtitle: '释放曲线、待 Mint 队列与 Mint 行为。',
      kpi: {
        unlock24h: '解锁(24h)',
        unlock7d: '未来7天释放',
        pending: '待 Mint',
        mintRate: 'Mint 率(24h)',
        ttm: 'Mint 中位耗时',
        delta: '价值差(U)'
      },
      hints: {
        unlock24h: '今日解锁 U',
        unlock7d: '预估解锁 U',
        pending: '已解锁未 Mint',
        mintRate: 'Mint/解锁',
        ttm: '解锁→Mint 中位数',
        delta: '待 Mint 的解锁价值 vs 当前价值'
      },
      panels: {
        unlockTitle: '30天释放曲线',
        unlockSubtitle: '前7天前置释放；输赢曲线不同',
        queueTitle: '待 Mint 队列',
        queueSubtitle: '时间桶 + 价值差',
        mintTitle: 'Mint 行为',
        mintSubtitle: 'Mint 时间分布 + Mint 量',
        story: '数据故事'
      },
      story: {
        queue: '待 Mint 是潜在释放压力；队列越大、越老，系统越容易在价格波动时失稳。',
        mint: 'Mint 越快，短期释放越强；Mint 越慢，价格敏感性与协同行为风险越高。'
      },
      misc: {
        win: '胜(U)',
        lose: '负(U)',
        share: '占比',
        price: 'ANOME 价格',
        pendingAvg: '待Mint均价',
        uAtUnlock: '解锁时U',
        uAtCurrent: '当前U',
        delta: '差值',
        mintedAnome24h: '24h Mint',
        mintedU24h: '24h 价值'
      }
    },

    tokenomics: {
      title: '代币模型',
      subtitle: '供应、流通与发行（不含销毁）。',
      kpi: {
        price: 'ANOME 价格',
        total: '总供应',
        circ: '流通量',
        pendingMint: '未Mint（解锁后）',
        emission: '24h 发行',
        netEmission: '24h 净发行'
      },
      hints: {
        price: '模拟价格',
        total: '已铸总量',
        circ: '估算流通量',
        pendingMint: '解锁未Mint的 ANOME',
        emission: '今日发行',
        netEmission: '净发行'
      },
      panels: {
        supplyTitle: '供应趋势',
        supplySubtitle: '流通供给(7天)',
        noteTitle: '说明',
        noteSubtitle: '本页展示范围说明',
        story: '数据故事'
      },
      story: {
        note: '目前 Anome One 不存在“销毁”机制。本页只关注流通供给、发行与“解锁未Mint”压力；销毁相关指标故意不展示，避免误导。'
      },
      misc: {
        circulating: '流通',
        burned: '销毁'
      }
    },

    treasury: {
      title: '国库',
      subtitle: '净流入、资产结构、跑道与覆盖率。',
      kpi: {
        balance: '国库余额',
        net24h: '净流入(24h)',
        buyback24h: '回购(24h)',
        runway: '跑道',
        cover7d: '覆盖率(7天)',
        cover30d: '覆盖率(30天)'
      },
      hints: {
        balance: '国库估值',
        net24h: '分账后净入',
        buyback24h: '回购投入',
        runway: '按当前支出估算(模拟)',
        cover7d: '国库/7天释放压力',
        cover30d: '国库/30天释放压力'
      },
      panels: {
        cashflowTitle: '现金流',
        cashflowSubtitle: '流入 vs 流出(7天)',
        allocTitle: '资产结构',
        allocSubtitle: '按 USD 估值',
        coverageTitle: '覆盖率',
        coverageSubtitle: '国库能否承受近期释放压力？',
        story: '数据故事'
      },
      story: {
        coverage: '覆盖率用于衡量缓冲与近期义务。低于 1.0x 意味着在不利价格下更脆弱。',
        takeaway: '优先覆盖 T+3 高压力窗口。'
      },
      misc: {
        inflow: '流入',
        outflow: '流出',
        cover7d: '7天覆盖',
        cover30d: '30天覆盖',
        takeaway: '结论'
      }
    },

    risk: {
      title: '风险与合规',
      subtitle: '释放窗口、集中度与压力测试。',
      kpi: {
        unlock24h: '解锁(24h)',
        unlock3d: '解锁(T+3)',
        unlock7d: '解锁(T+7)',
        top10: 'Top10 集中度',
        scenario: '价格-20% 发射(7天)',
        score: '风险分'
      },
      hints: {
        unlock24h: '近期解锁价值',
        unlock3d: '三天窗口',
        unlock7d: '七天窗口',
        top10: '待 Mint 头部占比',
        scenario: '需要 Mint 的放大倍数',
        score: '综合指标(模拟)'
      },
      panels: {
        concentrationTitle: '待 Mint 集中度',
        concentrationSubtitle: '头部地址待 Mint(ANOME)',
        scenarioTitle: '情景：7天所需 Mint',
        scenarioSubtitle: '价格敏感性',
        tableTitle: '情景表',
        tableSubtitle: '价格 + 解锁 + 所需 Mint',
        story: '数据故事'
      },
      story: {
        concentration: '集中度越高，越容易出现协同卖压风险；需关注头部地址与队列老化。'
      },
      misc: {
        pending: '待 Mint(ANOME)',
        mintRequired: '所需 Mint',
        price: '价格',
        unlock7d: '7天解锁'
      }
    },

    reports: {
      title: '报告',
      subtitle: '自动生成周报：增长、收入、负债、国库。',
      kpi: {
        gross7d: '总额(7天)',
        payers7d: '付费人数(7天)',
        unlock7d: '解锁(7天)',
        buyback7d: '回购(7天)',
        treasury7d: '国库净入(7天)',
        period: '周期'
      },
      panels: {
        weeklyTitle: '本周 Anome One',
        weeklySubtitle: '自动摘要',
        recoTitle: '建议',
        recoSubtitle: '下周操作建议',
        exportTitle: '导出',
        exportSubtitle: 'PDF/CSV（后续）',
        story: '数据故事'
      },
      story: {
        weekly: '报告用于直接粘贴到运营频道：短、可追溯到 KPI、强调行动。'
      },
      misc: {
        autoNarrative: '自动',
        highlight: '亮点',
        action: '行动',
        exportTodo: '补齐 PDF/CSV 导出接口与报告编排器。'
      }
    },

    admin: {
      title: '管理',
      subtitle: '白名单、角色与审计（预览模拟）。',
      kpi: {
        users: '用户数',
        admins: '管理员',
        superadmins: '超级管理员',
        dau: 'DAU',
        wau: 'WAU',
        session: '平均时长'
      },
      panels: {
        allowlistTitle: '白名单',
        allowlistSubtitle: '允许登录的邮箱（模拟）',
        rbacTitle: '权限系统',
        rbacSubtitle: '角色分布与规则（模拟）'
      },
      misc: {
        roleGated: '需要权限',
        deniedTitle: '无权限',
        deniedSubtitle: '该页面需要 admin 或 superadmin。',
        deniedText: '你无权查看管理功能。',
        access: '访问控制',
        currentRole: '当前角色',
        allowlistTodo: '接入白名单编辑与持久化存储。',
        roles: '角色',
        audit: '审计日志',
        auditTodo: '增加审计日志（登录/变更）与导出。'
      }
    }
  }
}

function getInitialLang() {
  const saved = localStorage.getItem('xnome.lang')
  if (saved === 'zh' || saved === 'en') return saved
  const l = (navigator.language || '').toLowerCase()
  return l.startsWith('zh') ? 'zh' : 'en'
}

export function I18NProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)

  useEffect(() => {
    localStorage.setItem('xnome.lang', lang)
  }, [lang])

  const value = useMemo(() => {
    const t = dict[lang]
    return {
      lang,
      setLang,
      t,
      toggleLang: () => setLang((x) => (x === 'en' ? 'zh' : 'en'))
    }
  }, [lang])

  return <I18NContext.Provider value={value}>{children}</I18NContext.Provider>
}

export function useI18N() {
  const ctx = useContext(I18NContext)
  if (!ctx) throw new Error('useI18N must be used inside I18NProvider')
  return ctx
}
