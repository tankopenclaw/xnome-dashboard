# xnome-dashboard (Cloudflare Stack Scaffold)

Initial scaffold built on Cloudflare stack:
- **Frontend:** React + Vite (Cloudflare Pages)
- **API:** Cloudflare Worker using Hono
- **Auth model:** Google OAuth placeholders + email allowlist + RBAC (`user`, `admin`, `superadmin`)
- **User management APIs:** role-guarded endpoints
- **Views architecture:** extensible registry that composes mock data fetch functions

> Superadmin bootstrap email is env-configured and defaults to: `tank@anome.xyz`

## Structure

```txt
xnome-dashboard/
  frontend/            # React + Vite app (Pages)
  worker/              # Hono API (Workers)
  README.md
```

## Quickstart (local)

```bash
cd xnome-dashboard
npm install
npm run dev
```

Runs:
- Frontend: `http://127.0.0.1:5173`
- Worker API: `http://127.0.0.1:8787`

Vite proxies `/api` and `/auth` to the Worker.

## Auth & RBAC constraints

### Google login allowlist
Google callback placeholder enforces allowlist via env `GOOGLE_ALLOWLIST` (comma-separated emails).

### Roles
- `user`
- `admin`
- `superadmin`

### Delegation rules (as requested)
- **admin can add users** (`role=user`)
- **superadmin can add admins** (`role=admin`) and users
- superadmin assignment is bootstrap/env-managed in this scaffold

### Wallet behavior
- **No wallet-binding flow**
- Social login auto-assigns wallet address during user creation

## API highlights

### General
- `GET /api/health`
- `GET /api/views`
- `GET /api/views/:id/data`

### OAuth placeholders
- `GET /auth/google` → placeholder config response
- `GET /auth/google/callback?mock_email=...&mock_name=...`
  - checks Google allowlist
  - creates/upserts user
  - assigns role (`superadmin` if email == `SUPERADMIN_EMAIL`, else `user`)
  - auto-assigns wallet

### User management (role-guarded)
Header-based mock auth for local testing:
- `x-dev-user-email`
- `x-dev-user-role` (optional fallback)

Endpoints:
- `GET /users/me` → authenticated user info
- `GET /users` → `admin` or `superadmin`
- `POST /users` body `{ "email": "...", "name": "...", "role": "user|admin" }`
  - admin may create only `user`
  - superadmin may create `user` or `admin`
- `PATCH /users/:email/role` body `{ "role": "user|admin" }` → superadmin only

## Extensible views + mock data architecture

Files:
- `worker/src/lib/mockData.ts` → standalone mock fetch functions
- `worker/src/lib/views.ts` → registry + composition logic

Pattern:
1. add/reuse mock fetchers in `mockData.ts`
2. compose them inside a view in `views.ts`
3. register via `registerView(view)` or static registry object

This enables future combined views from multiple data sources without changing route contracts.

## Environment variables (Worker)

Set in Worker vars/secrets:
- `APP_ENV`
- `SUPERADMIN_EMAIL` (set to `tank@anome.xyz`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` (secret)
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_ALLOWLIST` (comma-separated emails)
- `JWT_SECRET` (secret)

Local dev:

```bash
cp worker/.dev.vars.example worker/.dev.vars
```

## Cloudflare deploy steps

## 1) Deploy Worker API

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put JWT_SECRET
npx wrangler deploy src/index.ts
```

Set non-secrets in `wrangler.toml` and/or Cloudflare dashboard env vars.

## 2) Deploy Frontend to Cloudflare Pages

Build command:
- `npm --workspace frontend run build`

Output directory:
- `frontend/dist`

Deploy example:

```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name xnome-dashboard
```

## 3) Optional D1

Current scaffold uses in-memory stores. For persistence:
- create D1 DB (`wrangler d1 create ...`)
- add binding in `wrangler.toml`
- replace in-memory logic in `worker/src/lib/users.ts`

## GitHub push setup (eventual)

From workspace repo root:

```bash
cd /home/tank/.openclaw/workspace
git remote -v
# if no origin yet:
git remote add origin <your-github-repo-url>

git push -u origin master
# or main, depending on your branch naming
```

If this project should live in its own repo, split with subtree/filter-repo later. For now it is committed inside the current workspace git repo.

## Notes

- OAuth flow is placeholder-only in this scaffold.
- Replace mock header auth with real session/JWT and Google token verification for production.
