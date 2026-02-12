export type Role = 'user' | 'admin' | 'superadmin'

export interface Env {
  APP_ENV: string
  SUPERADMIN_EMAIL: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_REDIRECT_URI: string
  GOOGLE_ALLOWLIST: string
  JWT_SECRET: string
  ANOME_DASH_KV: KVNamespace
}

export interface User {
  id: string
  email: string
  name: string
  role: Role
  walletAddress: string
  provider: 'google'
  createdAt: string
}

export interface ViewContext {
  userId?: string
  role?: Role
  filters?: {
    from?: string
    to?: string
  }
}

export interface ViewDefinition {
  id: string
  name: string
  description: string
  sources: string[]
  getData: (ctx: ViewContext) => Promise<unknown>
}
