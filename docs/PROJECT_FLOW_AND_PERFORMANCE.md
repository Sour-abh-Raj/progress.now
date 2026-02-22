# Project Flow and Performance Playbook

## 1) System Architecture Flow
- **Client UI (Next.js App Router)**
  - Auth screens: `/auth/login`, `/auth/signup`, `/auth/callback`
  - Product screens: `/dashboard`, `/dashboard/todos`, `/dashboard/projects`, `/dashboard/research`, `/dashboard/settings`
- **Data layer**
  - Client-side state and fetch orchestration uses **TanStack Query** hooks in `lib/hooks/*`.
  - Server data access and writes use **Server Actions** in `lib/actions/*`.
  - Server rendering uses cached query helpers in `lib/data/cached-queries.ts`.
- **Backend**
  - **Supabase Auth** for password and OTP/magic-link.
  - **Supabase Postgres** tables with RLS and DB triggers.
- **Route protection**
  - `middleware.ts` guards dashboard routes and redirects unauthenticated users.

## 2) End-to-End User Flows

### A. Signup Flow
1. User opens `/auth/signup`.
2. Form validates password and confirmation on client.
3. Calls `supabase.auth.signUp` with `emailRedirectTo=/auth/callback`.
4. User confirms via email link.
5. Callback route finalizes session and redirects to `/dashboard`.

### B. Login Flow (Password)
1. User opens `/auth/login`.
2. Calls `supabase.auth.signInWithPassword`.
3. On success, client navigates to `/dashboard`.
4. Middleware + server-side user fetch validate active session.

### C. Login Flow (Magic Link)
1. User requests magic link from `/auth/login`.
2. Supabase sends email link to `/auth/callback`.
3. Callback accepts both:
   - `code` (PKCE/code exchange), and
   - `token_hash` + `type` (OTP verification path).
4. On success, redirects to `/dashboard`.

### D. Dashboard Flow
1. Server component loads user.
2. Parallel server-side dashboard queries fetch:
   - gamification stats,
   - dashboard aggregate counts and weekly score,
   - today todo previews.
3. Render metrics and task cards.

### E. CRUD Flows (Todos / Projects / Research)
1. Page mounts and query hook reads server action data.
2. Mutations use optimistic updates.
3. Server action writes to Supabase.
4. Success path reconciles local cache with returned record.
5. Errors rollback optimistic state and show toast.

## 3) Performance Thresholds (Target SLOs)
- **Auth route interactive time**: < 1.5s on warm local/dev page load.
- **Dashboard server load**: < 800ms for SSR data fetch path in normal DB conditions.
- **CRUD optimistic response**: immediate UI state change (< 100ms perceived).
- **Background refetch noise**: minimized (no constant focus churn).
- **Payload strategy**: use aggregated/count queries where cards need counts only.

## 4) Optimization Strategies Applied
- Replaced full-collection dashboard card queries with aggregated/count-oriented queries.
- Kept dashboard data loading parallelized via `Promise.all`.
- Kept React Query `staleTime` and gc tuning for cache reuse.
- Avoided forced invalidation after todo toggle where direct cache reconciliation is sufficient.
- Hardened auth callback route to support both Supabase callback URL shapes.

## 5) Verification Checklist (Release Gate)
- [ ] Signup works for new account (with and without email confirmation requirement).
- [ ] Password login works.
- [ ] Magic-link login works.
- [ ] Dashboard loads for authenticated users only.
- [ ] Create/update/delete works for todos.
- [ ] Create/update/delete works for projects.
- [ ] Create/delete works for research ideas.
- [ ] No broken redirects in middleware.
- [ ] Unit tests pass.
- [ ] Lint baseline understood (existing unrelated failures tracked).

## 6) Known Gaps to Address Next
- Add automated Playwright flows for auth + CRUD in CI with a seeded test Supabase project.
- Add server timing instrumentation for dashboard query latency and p95 tracking.
- Address repo-wide lint baseline so lint can become a strict merge gate.
