import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const DATABASE_URL = process.env.DATABASE_URL
const LARK_WEBHOOK_URL = process.env.LARK_WEBHOOK_URL
const POLL_INTERVAL_MINUTES = Number(process.env.POLL_INTERVAL_MINUTES || 10)
const STATE_FILE = path.resolve(rootDir, process.env.STATE_FILE || './state.json')
const GROUP_IDS = (process.env.GROUP_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => Number(s))
  .filter(Number.isFinite)

if (!DATABASE_URL) {
  console.error('[fatal] DATABASE_URL is required')
  process.exit(1)
}

if (!LARK_WEBHOOK_URL) {
  console.error('[fatal] LARK_WEBHOOK_URL is required')
  process.exit(1)
}

const pool = new Pool({ connectionString: DATABASE_URL })

function nowStr() {
  return new Date().toISOString()
}

async function readState() {
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8')
    const json = JSON.parse(raw)
    if (!json || typeof json !== 'object') throw new Error('invalid state')
    if (!json.groupLastSeen || typeof json.groupLastSeen !== 'object') json.groupLastSeen = {}
    return json
  } catch {
    return {
      initialized: false,
      updatedAt: null,
      groupLastSeen: {},
    }
  }
}

async function writeState(state) {
  state.updatedAt = nowStr()
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
}

async function getTargetGroups(client) {
  if (GROUP_IDS.length > 0) {
    const rs = await client.query(
      `SELECT id, name FROM task_group WHERE id = ANY($1::bigint[]) ORDER BY id ASC`,
      [GROUP_IDS],
    )
    return rs.rows.map((r) => ({ id: Number(r.id), name: r.name }))
  }

  const rs = await client.query(`SELECT id, name FROM task_group ORDER BY id ASC`)
  return rs.rows.map((r) => ({ id: Number(r.id), name: r.name }))
}

async function getMaxPendingClaimIdByGroup(client) {
  const where = GROUP_IDS.length > 0 ? 'AND c.task_group_id = ANY($1::bigint[])' : ''
  const params = GROUP_IDS.length > 0 ? [GROUP_IDS] : []

  const rs = await client.query(
    `
      SELECT c.task_group_id AS group_id, MAX(c.id) AS max_claim_id
      FROM task_group_reward_claim c
      WHERE c.status = 'PENDING'
      ${where}
      GROUP BY c.task_group_id
    `,
    params,
  )

  const map = new Map()
  for (const row of rs.rows) {
    map.set(Number(row.group_id), Number(row.max_claim_id))
  }
  return map
}

async function queryNewPendingClaims(client, groupId, lastSeenClaimId) {
  const rs = await client.query(
    `
      SELECT
        c.id AS claim_id,
        c.task_group_id AS group_id,
        g.name AS group_name,
        c.user_id,
        COALESCE(u.nickname, '') AS nickname,
        COALESCE(u.email, '') AS email,
        c.created_at AS submitted_at
      FROM task_group_reward_claim c
      JOIN task_group g ON g.id = c.task_group_id
      JOIN users u ON u.id = c.user_id
      WHERE c.task_group_id = $1
        AND c.status = 'PENDING'
        AND c.id > $2
      ORDER BY c.id ASC
    `,
    [groupId, lastSeenClaimId],
  )

  return rs.rows.map((r) => ({
    claimId: Number(r.claim_id),
    groupId: Number(r.group_id),
    groupName: r.group_name,
    userId: Number(r.user_id),
    nickname: r.nickname || 'Unknown',
    email: r.email || '-',
    submittedAt: r.submitted_at,
  }))
}

function formatLarkText(items) {
  const lines = []
  lines.push(`🔔 Rewards Pending 新增 ${items.length} 条`)
  lines.push('')

  for (const item of items) {
    lines.push(`- Group: ${item.groupName} (#${item.groupId})`)
    lines.push(`  User: ${item.nickname} (uid=${item.userId})`)
    lines.push(`  Email: ${item.email}`)
    lines.push(`  Claim: #${item.claimId}`)
    lines.push(`  Submitted: ${new Date(item.submittedAt).toISOString()}`)
    lines.push('')
  }

  return lines.join('\n').trim()
}

async function sendLarkNotification(items) {
  const text = formatLarkText(items)
  const body = {
    msg_type: 'text',
    content: {
      text,
    },
  }

  const resp = await fetch(LARK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    const msg = await resp.text().catch(() => '')
    throw new Error(`Lark webhook failed: ${resp.status} ${msg}`)
  }

  const json = await resp.json().catch(() => ({}))
  if (json && Number(json.code) !== 0) {
    throw new Error(`Lark webhook error: ${JSON.stringify(json)}`)
  }
}

async function runOnce() {
  const state = await readState()
  const client = await pool.connect()

  try {
    const groups = await getTargetGroups(client)
    if (groups.length === 0) {
      console.log(`[${nowStr()}] no groups found`) 
      return
    }

    if (!state.initialized) {
      const maxMap = await getMaxPendingClaimIdByGroup(client)
      for (const g of groups) {
        state.groupLastSeen[String(g.id)] = maxMap.get(g.id) || 0
      }
      state.initialized = true
      await writeState(state)
      console.log(`[${nowStr()}] initialized baseline for ${groups.length} groups`) 
      return
    }

    const allNewItems = []

    for (const g of groups) {
      const key = String(g.id)
      const lastSeen = Number(state.groupLastSeen[key] || 0)
      const newItems = await queryNewPendingClaims(client, g.id, lastSeen)

      if (newItems.length > 0) {
        allNewItems.push(...newItems)
        const maxId = Math.max(...newItems.map((x) => x.claimId))
        state.groupLastSeen[key] = Math.max(lastSeen, maxId)
      }
    }

    if (allNewItems.length > 0) {
      await sendLarkNotification(allNewItems)
      console.log(`[${nowStr()}] sent ${allNewItems.length} new pending claim(s) to Lark`) 
      await writeState(state)
    } else {
      console.log(`[${nowStr()}] no new pending claims`) 
    }
  } finally {
    client.release()
  }
}

let running = false
async function safeRun() {
  if (running) {
    console.warn(`[${nowStr()}] previous run still in progress, skip`) 
    return
  }
  running = true
  try {
    await runOnce()
  } catch (err) {
    console.error(`[${nowStr()}] run failed`, err)
  } finally {
    running = false
  }
}

console.log(`[boot] reward-pending-watcher started. interval=${POLL_INTERVAL_MINUTES}m groups=${GROUP_IDS.length > 0 ? GROUP_IDS.join(',') : 'ALL'}`)
await safeRun()
setInterval(safeRun, POLL_INTERVAL_MINUTES * 60 * 1000)
