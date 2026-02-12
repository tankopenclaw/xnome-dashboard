import { Hono } from 'hono'
import { getView, listViews } from '../lib/views'

export const apiRoutes = new Hono()

// Require auth for all API endpoints when Google OAuth is configured.
apiRoutes.use('*', async (c, next) => {
  const googleConfigured = !!c.env?.GOOGLE_CLIENT_ID && c.env.GOOGLE_CLIENT_ID !== 'replace-me'
  const isPublic = c.req.path.endsWith('/health') || c.req.path.endsWith('/me')
  if (!isPublic && googleConfigured && !c.get('authUser')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  await next()
})

apiRoutes.get('/health', (c) => {
  // Helpful for early preview: when Google isn't configured, we run in "preview auth" mode.
  const googleConfigured = !!c.env?.GOOGLE_CLIENT_ID && c.env.GOOGLE_CLIENT_ID !== 'replace-me'
  return c.json({ ok: true, service: 'xnome-dashboard-api', auth: { googleConfigured } })
})

apiRoutes.get('/views', (c) => {
  const views = listViews().map((v) => ({
    id: v.id,
    name: v.name,
    description: v.description,
    sources: v.sources
  }))
  return c.json({ views })
})

apiRoutes.get('/me', (c) => {
  const u = c.get('authUser')
  return c.json({ user: u || null })
})

apiRoutes.get('/views/:id/data', async (c) => {
  const id = c.req.param('id')
  const view = getView(id)
  if (!view) return c.json({ error: 'View not found', id }, 404)

  const data = await view.getData({
    userId: c.get('authUser')?.id,
    role: c.get('authUser')?.role,
    filters: {
      from: c.req.query('from'),
      to: c.req.query('to')
    }
  })

  return c.json({
    view: { id: view.id, name: view.name, description: view.description, sources: view.sources },
    data
  })
})
