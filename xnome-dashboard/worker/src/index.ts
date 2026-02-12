import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { apiRoutes } from './routes/api'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { authContext } from './middleware/auth'
import type { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

// CORS: Pages runs on *.pages.dev while API is on *.workers.dev.
// For Google login session cookies we must allow credentials + reflect Origin.
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return null
      try {
        const u = new URL(origin)
        if (u.hostname.endsWith('pages.dev')) return origin // includes anome-one-dashboard.pages.dev
        if (u.hostname === 'xnome.xyz' || u.hostname.endsWith('.xnome.xyz')) return origin
      } catch {
        return null
      }
      return null
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization']
  })
)

app.use('*', authContext)

app.get('/', (c) =>
  c.json({
    service: 'xnome-dashboard-api',
    message: 'Ready',
    docs: ['/api/health', '/api/views', '/api/views/:id/data', '/auth/google', '/users/me']
  })
)

app.route('/api', apiRoutes)
app.route('/auth', authRoutes)
app.route('/users', userRoutes)

export default app
