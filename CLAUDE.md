# CLAUDE.md

## Commands

- `npm run dev` — Start dev server (Next.js 16 + Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm test` — Run all tests (vitest)
- `npm run test:watch` — Watch mode
- `npm run db:generate` — Generate Drizzle migrations
- `npm run db:push` — Push schema to database (uses direct DB URL, not pooler)
- `npm run db:seed` — Seed taxonomy + readiness rules

## Architecture

**Event Proposal Readiness Engine** — a guided form + AI assessment tool for marketing event proposals.

- **Next.js 16** App Router with Turbopack, `proxy.ts` (not middleware.ts)
- **Supabase** for Postgres database + Auth (email/password, cookie-based SSR)
- **Drizzle ORM** with `postgres` driver (`prepare: false` for Supabase compatibility)
- **AI SDK v6** with AI Gateway — `anthropic/claude-sonnet-4.6` for assessment, `anthropic/claude-haiku-4.5` for field assist
- **shadcn/ui v4** with base-ui primitives (uses `render` prop, NOT `asChild`)

## Key Patterns

- **base-ui**: Use `render` prop instead of `asChild` for composition (e.g., `<DialogTrigger render={<Button />}>`)
- **Select component**: base-ui Select doesn't reliably render labels from value matching. Use native `<select>` for simple cases.
- **Database URLs**: Use direct connection (`db.*.supabase.co:5432`) for both runtime and migrations. Pooler URL (port 6543) causes "Tenant not found" errors.
- **AI model strings**: Use dots for versions — `anthropic/claude-sonnet-4.6` not `claude-sonnet-4-6`
- **Async params**: All Next.js 16 request APIs are async — `await params`, `await searchParams`

## Data Flow

1. User fills proposal form (guided sections with taxonomy comboboxes)
2. AI field assist fires on blur for strategic text fields (rationale, objective, metrics)
3. On submit: save proposal + version, then POST to `/api/ai/assess`
4. Assessment runs: deterministic rule checks + LLM semantic assessment
5. Results stored as assessment record, displayed on proposal view page

## Project Structure

- `src/lib/db/schema.ts` — Drizzle schema (proposals, versions, assessments, taxonomy, rules)
- `src/lib/readiness/` — Rules engine + LLM assessor
- `src/lib/ai/prompts.ts` — System prompts for assessment and field assist
- `src/lib/actions/` — Server actions for proposals, taxonomy, rules
- `src/components/proposals/` — Form, view, list, filters, readiness components
- `src/components/admin/` — Taxonomy and rules management
- `tests/readiness/` — Rules engine unit tests
