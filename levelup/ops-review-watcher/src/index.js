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

const REVIEW_SOURCES = (process.env.REVIEW_SOURCES || 'reward_claims')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const TASK_REVIEW_ENABLED = String(process.env.TASK_REVIEW_ENABLED || 'false').toLowerCase() === 'true'
const TASK_PENDING_SQL = (process.env.TASK_PENDING_SQL || '').trim()

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

function sourceName(source) {
  if (source === 'reward_claims') return 'Reward Claim'
  if (source === 'task_reviews') return 'Task Review'
  return source
}

async function readState() {
  try {
    const raw = await fs.readFile(STATE_FILE, 'utf8')
    const json = JSON.parse(raw)
    if (!json || typeof json !== 'object') throw new Error('invalid state')
    if (!json.lastSeen || typeof json.lastSeen !== 'object') json.lastSeen = {}
    return json
  } catch {
    return { initialized: false, updatedAt: null, lastSeen: {} }
  }
}

async function writeState(state) {
  state.updatedAt = nowStr()
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
}

function getLastSeen(state, source, groupId) {
  const s = state.lastSeen[source] || {}
  return Number(s[String(groupId)] || 0)
}

function setLastSeen(state, source, groupId, value) {
  if (!state.lastSeen[source]) state.lastSeen[source] = {}
  state.lastSeen[source][String(groupId)] = Number(value)
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

async function getRewardBaseline(client) {
  const where = GROUP_IDS.length > 0 ? 'AND c.task_group_id = ANY($1::bigint[])' : ''
  const params = GROUP_IDS.length > 0 ? [GROUP_IDS] : []
  const rs = await client.query(
    `
      SELECT c.task_group_id AS group_id, MAX(c.id) AS max_id
      FROM task_group_reward_claim c
      WHERE c.status = 'PENDING'
      ${where}
      GROUP BY c.task_group_id
    `,
    params,
  )
  return rs.rows.map((r) => ({ groupId: Number(r.group_id), maxId: Number(r.max_id) }))
}

async function fetchRewardPending(client, groupId, lastSeenId) {
  const rs = await client.query(
    `
      SELECT
        c.id AS review_id,
        c.task_group_id AS group_id,
        g.name AS group_name,
        c.user_id,
        COALESCE(u.nickname, '') AS nickname,
        COALESCE(u.email, '') AS email,
        c.created_at AS submitted_at,
        NULL::text AS task_name
      FROM task_group_reward_claim c
      JOIN task_group g ON g.id = c.task_group_id
      JOIN users u ON u.id = c.user_id
      WHERE c.task_group_id = $1
        AND c.status = 'PENDING'
        AND c.id > $2
      ORDER BY c.id ASC
    `,
    [groupId, lastSeenId],
  )

  return rs.rows.map((r) => ({
    source: 'reward_claims',
    reviewId: Number(r.review_id),
    groupId: Number(r.group_id),
    groupName: r.group_name,
    userId: Number(r.user_id),
    nickname: r.nickname || 'Unknown',
    email: r.email || '-',
    submittedAt: r.submitted_at,
    taskName: r.task_name || null,
  }))
}

async function getTaskReviewBaseline(client) {
  if (!TASK_REVIEW_ENABLED || !TASK_PENDING_SQL) return []
  const wrapped = `SELECT group_id, MAX(review_id) AS max_id FROM (${TASK_PENDING_SQL}) t GROUP BY group_id`
  const rs = await client.query(wrapped)
  return rs.rows.map((r) => ({ groupId: Number(r.group_id), maxId: Number(r.max_id) }))
}

async function fetchTaskPending(client, groupId, lastSeenId) {
  if (!TASK_REVIEW_ENABLED || !TASK_PENDING_SQL) return []
  const wrapped = `
    SELECT * FROM (${TASK_PENDING_SQL}) t
    WHERE t.group_id = $1 AND t.review_id > $2
    ORDER BY t.review_id ASC
  `
  const rs = await client.query(wrapped, [groupId, lastSeenId])
  return rs.rows.map((r) => ({
    source: 'task_reviews',
    reviewId: Number(r.review_id),
    groupId: Number(r.group_id),
    groupName: r.group_name,
    userId: Number(r.user_id),
    nickname: r.nickname || 'Unknown',
    email: r.email || '-',
    submittedAt: r.submitted_at,
    taskName: r.task_name || null,
  }))
}

function formatLarkText(items) {
  const lines = []
  lines.push(`🔔 Ops Review 新增待审核 ${items.length} 条`)
  lines.push('')
  for (const item of items) {
    lines.push(`- Type: ${sourceName(item.source)}`)
    lines.push(`  Group: ${item.groupName} (#${item.groupId})`)
    if (item.taskName) lines.push(`  Task: ${item.taskName}`)
    lines.push(`  User: ${item.nickname} (uid=${item.userId})`)
    lines.push(`  Email: ${item.email}`)
    lines.push(`  ReviewId: #${item.reviewId}`)
    lines.push(`  Submitted: ${new Date(item.submittedAt).toISOString()}`)
    lines.push('')
  }
  return lines.join('\n').trim()
}

async function sendLark(items) {
  const payload = { msg_type: 'text', content: { text: formatLarkText(items) } }
  const resp = await fetch(LARK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!resp.ok) throw new Error(`Lark webhook failed: ${resp.status} ${await resp.text()}`)
  const json = await resp.json().catch(() => ({}))
  if (json && Number(json.code) !== 0) throw new Error(`Lark webhook error: ${JSON.stringify(json)}`)
}

async function initializeBaseline(client, state, groups) {
  for (const source of REVIEW_SOURCES) {
    if (source === 'reward_claims') {
      const baseline = await getRewardBaseline(client)
      const map = new Map(baseline.map((x) => [x.groupId, x.maxId]))
      for (const g of groups) setLastSeen(state, source, g.id, map.get(g.id) || 0)
    }

    if (source === 'task_reviews') {
      const baseline = await getTaskReviewBaseline(client)
      const map = new Map(baseline.map((x) => [x.groupId, x.maxId]))
      for (const g of groups) setLastSeen(state, source, g.id, map.get(g.id) || 0)
    }
  }

  state.initialized = true
  await writeState(state)
}

async function runOnce() {
  const client = await pool.connect()
  const state = await readState()
  try {
    const groups = await getTargetGroups(client)
    if (groups.length === 0) {
      console.log(`[${nowStr()}] no groups found`)
      return
    }

    if (!state.initialized) {
      await initializeBaseline(client, state, groups)
      console.log(`[${nowStr()}] baseline initialized for ${groups.length} groups`)
      return
    }

    const allNew = []

    for (const source of REVIEW_SOURCES) {
      for (const g of groups) {
        const lastSeen = getLastSeen(state, source, g.id)
        let rows = []

        if (source === 'reward_claims') rows = await fetchRewardPending(client, g.id, lastSeen)
        else if (source === 'task_reviews') rows = await fetchTaskPending(client, g.id, lastSeen)
        else continue

        if (rows.length > 0) {
          allNew.push(...rows)
          const maxId = Math.max(...rows.map((x) => x.reviewId))
          setLastSeen(state, source, g.id, Math.max(lastSeen, maxId))
        }
      }
    }

    if (allNew.length > 0) {
      await sendLark(allNew)
      await writeState(state)
      console.log(`[${nowStr()}] sent ${allNew.length} item(s)`)
    } else {
      console.log(`[${nowStr()}] no new review items`)
    }
  } finally {
    client.release()
  }
}

let running = false
async function safeRun() {
  if (running) return
  running = true
  try {
    await runOnce()
  } catch (err) {
    console.error(`[${nowStr()}] run failed`, err)
  } finally {
    running = false
  }
}

console.log(`[boot] ops-review-watcher interval=${POLL_INTERVAL_MINUTES}m groups=${GROUP_IDS.length ? GROUP_IDS.join(',') : 'ALL'} sources=${REVIEW_SOURCES.join(',')}`)
await safeRun()
setInterval(safeRun, POLL_INTERVAL_MINUTES * 60 * 1000)
