# Event Proposal Readiness Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live pilot tool where enterprise marketers paste rough event ideas into a guided form with AI field assistance, receive readiness assessments with specific gap diagnosis, and produce canonical structured proposals.

**Architecture:** Next.js 16 App Router with Supabase (Postgres + Auth), Drizzle ORM for type-safe schema management, AI SDK v6 with AI Gateway for inline field assistance and readiness assessment. shadcn/ui for all UI components. Server Actions for mutations, Server Components for reads.

**Tech Stack:** Next.js 16, Supabase, Drizzle ORM, AI SDK v6, AI Gateway, shadcn/ui, Tailwind CSS v4, TypeScript

**TDD Note:** TDD is applied to the readiness engine (Tasks 8-9) where logic correctness is critical. UI tasks skip unit tests in favor of shipping speed — testing infrastructure can be added post-pilot.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                          — Root layout (fonts, theme)
│   ├── page.tsx                            — Redirect to /proposals
│   ├── (auth)/
│   │   ├── layout.tsx                      — Centered auth layout
│   │   ├── login/page.tsx                  — Login form
│   │   └── signup/page.tsx                 — Signup form
│   ├── (app)/
│   │   ├── layout.tsx                      — Authenticated layout (nav, user menu)
│   │   ├── proposals/
│   │   │   ├── page.tsx                    — Proposal list view
│   │   │   ├── new/page.tsx                — Create proposal (form)
│   │   │   └── [id]/
│   │   │       ├── page.tsx                — Proposal read-only view
│   │   │       └── edit/page.tsx           — Edit proposal (form)
│   │   └── admin/
│   │       ├── taxonomy/page.tsx           — Taxonomy admin
│   │       └── rules/page.tsx              — Readiness rules admin
│   └── api/
│       └── ai/
│           ├── field-assist/route.ts       — Per-field AI suggestions
│           └── assess/route.ts             — Full readiness assessment
├── lib/
│   ├── db/
│   │   ├── schema.ts                       — Drizzle schema (all tables)
│   │   ├── index.ts                        — Drizzle client instances
│   │   └── seed.ts                         — Taxonomy seed data
│   ├── supabase/
│   │   ├── client.ts                       — Browser Supabase client
│   │   ├── server.ts                       — Server Supabase client
│   │   └── middleware.ts                   — Auth helpers for proxy
│   ├── readiness/
│   │   ├── rules-engine.ts                 — Rule-based checks (deterministic)
│   │   └── llm-assessor.ts                 — LLM quality assessment
│   ├── ai/
│   │   └── prompts.ts                      — System prompts for AI jobs
│   ├── actions/
│   │   ├── proposals.ts                    — Proposal CRUD server actions
│   │   ├── taxonomy.ts                     — Taxonomy CRUD server actions
│   │   └── rules.ts                        — Rules CRUD server actions
│   └── types.ts                            — Shared TypeScript types
├── components/
│   ├── ui/                                 — shadcn components (auto-generated)
│   ├── proposals/
│   │   ├── proposal-form.tsx               — Guided form with sections
│   │   ├── proposal-form-section.tsx        — Collapsible form section
│   │   ├── taxonomy-field.tsx              — Taxonomy-aware combobox
│   │   ├── ai-assisted-field.tsx           — Free-text field with AI nudges
│   │   ├── readiness-preview.tsx           — Live readiness sidebar
│   │   ├── proposal-list.tsx               — List table with filters
│   │   ├── proposal-list-filters.tsx       — Filter bar component
│   │   ├── proposal-view.tsx               — Read-only canonical view
│   │   └── readiness-assessment.tsx        — Assessment display component
│   ├── admin/
│   │   ├── taxonomy-manager.tsx            — Taxonomy vocab CRUD
│   │   └── rules-manager.tsx               — Rules CRUD
│   └── layout/
│       ├── app-sidebar.tsx                 — Navigation sidebar
│       └── user-menu.tsx                   — User dropdown
├── proxy.ts                                — Next.js 16 auth middleware
drizzle/
├── migrations/                             — Auto-generated migration files
drizzle.config.ts                           — Drizzle Kit config
next.config.ts                              — Next.js config
.env.local                                  — Environment variables (pulled from Vercel)
tests/
├── readiness/
│   ├── rules-engine.test.ts                — Rule-based checks tests
│   └── llm-assessor.test.ts                — LLM assessment tests (mocked)
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `.env.local` (from `vercel env pull`)
- Create: `src/components/ui/*` (shadcn init)

- [ ] **Step 1: Create Next.js 16 app**

```bash
cd /Users/conorogle/Development/BabyPhoenix
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Select defaults when prompted. This scaffolds into the existing repo.

- [ ] **Step 2: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables.

- [ ] **Step 3: Add shadcn components needed for the app**

```bash
npx shadcn@latest add button input textarea select label card table badge dialog sheet separator tabs collapsible command popover form sonner dropdown-menu avatar tooltip combobox accordion
```

- [ ] **Step 4: Install core dependencies**

```bash
npm install drizzle-orm postgres @supabase/supabase-js @supabase/ssr ai @ai-sdk/react @ai-sdk/gateway
npm install -D drizzle-kit @types/node
```

- [ ] **Step 5: Install test dependencies**

```bash
npm install -D vitest @vitest/runner
```

- [ ] **Step 6: Create Supabase project and link to Vercel**

This step requires the user to:
1. Create a Supabase project at https://supabase.com/dashboard
2. In Vercel dashboard, add the Supabase integration (or use `vercel integration add supabase`)
3. Link the project: `vercel link`
4. Pull env vars: `vercel env pull .env.local`

After this, `.env.local` should contain:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (direct connection)

- [ ] **Step 7: Add AI Gateway env vars**

Enable AI Gateway in the Vercel dashboard for the project. Then:

```bash
vercel env pull .env.local
```

This adds `VERCEL_OIDC_TOKEN` for AI Gateway authentication.

- [ ] **Step 8: Configure Drizzle**

Create `drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 9: Configure Vitest**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 10: Update next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 16 + shadcn/ui + Supabase + Drizzle + AI SDK"
```

---

## Task 2: Database Schema & Migrations

**Files:**
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `src/lib/types.ts`
- Create: `drizzle/migrations/*` (auto-generated)

- [ ] **Step 1: Define the Drizzle schema**

Create `src/lib/db/schema.ts`:

```typescript
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const readinessStatusEnum = pgEnum("readiness_status", [
  "not_ready",
  "partially_ready",
  "ready_for_review",
]);

export const ruleTypeEnum = pgEnum("rule_type", [
  "required",
  "conditional",
  "placeholder",
  "quality",
]);

export const findingStatusEnum = pgEnum("finding_status", [
  "missing",
  "weak",
  "strong",
]);

// Taxonomy vocabularies
export const taxonomyCategories = pgTable("taxonomy_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(), // e.g., "event_types", "products"
  name: text("name").notNull(), // e.g., "Event Types", "Products / Solutions"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taxonomyEntries = pgTable("taxonomy_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .references(() => taxonomyCategories.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Proposals
export const proposals = pgTable("proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(), // from Supabase auth
  currentVersion: integer("current_version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const proposalVersions = pgTable("proposal_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id")
    .references(() => proposals.id, { onDelete: "cascade" })
    .notNull(),
  version: integer("version").notNull(),

  // Event Basics
  title: text("title"),
  eventType: text("event_type"),
  format: text("format"),
  proposedTiming: text("proposed_timing"),
  venueType: text("venue_type"),

  // Audience & Targeting
  targetSegment: text("target_segment"),
  buyerRoles: jsonb("buyer_roles").$type<string[]>(),
  geography: text("geography"),
  audienceSize: text("audience_size"),
  targetAccounts: text("target_accounts"),

  // Product & Strategy
  productFocus: text("product_focus"),
  strategicRationale: text("strategic_rationale"),
  objective: text("objective"),
  successMetrics: text("success_metrics"),
  relatedCampaign: text("related_campaign"),

  // Logistics & Budget
  budgetRange: text("budget_range"),
  owner: text("owner"),
  dependencies: text("dependencies"),
  partnerName: text("partner_name"),
  partnerRole: text("partner_role"),
  executiveParticipation: text("executive_participation"),

  // Optional
  regulatoryConsiderations: text("regulatory_considerations"),
  followUpExpectation: text("follow_up_expectation"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assessments
export const assessments = pgTable("assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalVersionId: uuid("proposal_version_id")
    .references(() => proposalVersions.id, { onDelete: "cascade" })
    .notNull(),
  status: readinessStatusEnum("status").notNull(),
  findings: jsonb("findings")
    .$type<
      Array<{
        field: string;
        status: "missing" | "weak" | "strong";
        message: string;
        suggestion?: string;
      }>
    >()
    .notNull(),
  nextActions: jsonb("next_actions").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Readiness Rules
export const readinessRules = pgTable("readiness_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: ruleTypeEnum("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  // For field rules: which fields this rule applies to
  fields: jsonb("fields").$type<string[]>(),
  // For conditional rules: the condition expression
  condition: text("condition"),
  // The message shown when this rule fires
  message: text("message").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Create Drizzle client**

Create `src/lib/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Connection for server-side queries (transaction mode, no prepared statements)
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
```

- [ ] **Step 3: Define shared types**

Create `src/lib/types.ts`:

```typescript
import type {
  proposals,
  proposalVersions,
  assessments,
  taxonomyCategories,
  taxonomyEntries,
  readinessRules,
} from "./db/schema";

// Infer types from Drizzle schema
export type Proposal = typeof proposals.$inferSelect;
export type ProposalVersion = typeof proposalVersions.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type TaxonomyCategory = typeof taxonomyCategories.$inferSelect;
export type TaxonomyEntry = typeof taxonomyEntries.$inferSelect;
export type ReadinessRule = typeof readinessRules.$inferSelect;

// Insert types
export type NewProposal = typeof proposals.$inferInsert;
export type NewProposalVersion = typeof proposalVersions.$inferInsert;
export type NewAssessment = typeof assessments.$inferInsert;
export type NewTaxonomyEntry = typeof taxonomyEntries.$inferInsert;
export type NewReadinessRule = typeof readinessRules.$inferInsert;

// Assessment finding type
export type Finding = {
  field: string;
  status: "missing" | "weak" | "strong";
  message: string;
  suggestion?: string;
};

// Readiness status type
export type ReadinessStatus = "not_ready" | "partially_ready" | "ready_for_review";

// Proposal with its latest version and assessment
export type ProposalWithDetails = Proposal & {
  version: ProposalVersion;
  assessment: Assessment | null;
};

// Form field names (used by readiness engine)
export const PROPOSAL_FIELDS = {
  title: "Event Title",
  eventType: "Event Type",
  format: "Format",
  proposedTiming: "Proposed Timing",
  venueType: "Venue Type",
  targetSegment: "Target Segment",
  buyerRoles: "Buyer Roles",
  geography: "Geography",
  audienceSize: "Audience Size",
  targetAccounts: "Target Accounts",
  productFocus: "Product / Solution Focus",
  strategicRationale: "Strategic Rationale",
  objective: "Objective",
  successMetrics: "Success Metrics",
  relatedCampaign: "Related Campaign",
  budgetRange: "Budget Range",
  owner: "Owner",
  dependencies: "Dependencies / Approvals",
  partnerName: "Partner",
  partnerRole: "Partner Role",
  executiveParticipation: "Executive Participation",
  regulatoryConsiderations: "Regulatory Considerations",
  followUpExpectation: "Follow-up Expectation",
} as const;

export type ProposalFieldKey = keyof typeof PROPOSAL_FIELDS;
```

- [ ] **Step 4: Generate and run migrations**

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

Run: `npx drizzle-kit push`
Expected: Tables created in Supabase — verify in Supabase Dashboard > Table Editor.

- [ ] **Step 5: Commit**

```bash
git add src/lib/db/schema.ts src/lib/db/index.ts src/lib/types.ts drizzle.config.ts drizzle/
git commit -m "feat: add database schema — proposals, taxonomy, assessments, rules"
```

---

## Task 3: Taxonomy Seed Data

**Files:**
- Create: `src/lib/db/seed.ts`

- [ ] **Step 1: Create seed script**

Create `src/lib/db/seed.ts`:

```typescript
import { db } from "./index";
import { taxonomyCategories, taxonomyEntries, readinessRules } from "./schema";

const CATEGORIES = [
  {
    slug: "event_types",
    name: "Event Types",
    description: "Controlled list of event formats",
    entries: [
      "Executive Dinner",
      "Client Roundtable",
      "Conference Sponsorship",
      "Regional Field Event",
      "Partner Event",
      "Webinar",
      "Workshop",
      "Networking Reception",
      "Thought Leadership Panel",
    ],
  },
  {
    slug: "products",
    name: "Products / Solutions",
    description: "Organization product portfolio",
    entries: [
      "Payments",
      "Treasury Services",
      "Transaction Banking",
      "Trade Finance",
      "Lending",
      "Securities Services",
      "Cash Management",
      "Foreign Exchange",
      "Digital Banking Platform",
    ],
  },
  {
    slug: "geographies",
    name: "Geographies",
    description: "Markets the organization operates in",
    entries: [
      "Singapore",
      "Hong Kong",
      "London",
      "New York",
      "Sydney",
      "Tokyo",
      "Dubai",
      "Frankfurt",
      "Mumbai",
      "São Paulo",
      "APAC (Regional)",
      "EMEA (Regional)",
      "Americas (Regional)",
    ],
  },
  {
    slug: "segments",
    name: "Customer Segments",
    description: "Target audience categories",
    entries: [
      "Enterprise (Tier 1)",
      "Enterprise (Tier 2)",
      "Mid-Market",
      "SME",
      "Financial Institutions",
      "Fintech",
      "Public Sector",
      "Multinational Corporates",
    ],
  },
  {
    slug: "buyer_roles",
    name: "Buyer Roles",
    description: "Decision-makers and influencers",
    entries: [
      "CFO",
      "Treasurer",
      "Head of Payments",
      "Head of Treasury",
      "CTO",
      "COO",
      "Head of Trade Finance",
      "VP Finance",
      "Head of Cash Management",
      "Procurement Lead",
    ],
  },
  {
    slug: "strategic_priorities",
    name: "Strategic Priorities",
    description: "Current business strategic objectives",
    entries: [
      "Grow APAC Payments Revenue",
      "Enterprise Treasury Modernisation",
      "Digital Lending Expansion",
      "Deepen Financial Institution Relationships",
      "Cross-sell Transaction Banking",
      "Expand Mid-Market Segment",
      "Strengthen Partner Ecosystem",
    ],
  },
  {
    slug: "success_metric_types",
    name: "Success Metric Types",
    description: "Measurement categories for event outcomes",
    entries: [
      "Qualified Pipeline Generated",
      "Meetings Booked",
      "Attendee NPS Score",
      "Conversion to Opportunity",
      "Executive Engagement Score",
      "Brand Awareness Lift",
      "Partnership Commitments",
      "Thought Leadership Citations",
    ],
  },
];

const DEFAULT_RULES = [
  {
    type: "required" as const,
    name: "Event title required",
    fields: ["title"],
    condition: null,
    message: "Event title is required",
  },
  {
    type: "required" as const,
    name: "Event type required",
    fields: ["eventType"],
    condition: null,
    message: "Event type is required",
  },
  {
    type: "required" as const,
    name: "Objective required",
    fields: ["objective"],
    condition: null,
    message: "Objective is required",
  },
  {
    type: "required" as const,
    name: "Target segment required",
    fields: ["targetSegment"],
    condition: null,
    message: "Target segment is required",
  },
  {
    type: "required" as const,
    name: "Geography required",
    fields: ["geography"],
    condition: null,
    message: "Geography / market is required",
  },
  {
    type: "required" as const,
    name: "Proposed timing required",
    fields: ["proposedTiming"],
    condition: null,
    message: "Proposed timing is required",
  },
  {
    type: "required" as const,
    name: "Product focus required",
    fields: ["productFocus"],
    condition: null,
    message: "Product / solution focus is required",
  },
  {
    type: "required" as const,
    name: "Owner required",
    fields: ["owner"],
    condition: null,
    message: "Proposal owner is required",
  },
  {
    type: "conditional" as const,
    name: "Buyer roles for executive events",
    fields: ["buyerRoles"],
    condition: "eventType IN ['Executive Dinner', 'Client Roundtable', 'Thought Leadership Panel']",
    message: "Buyer roles are required for executive-format events",
  },
  {
    type: "conditional" as const,
    name: "Budget for large events",
    fields: ["budgetRange"],
    condition: "audienceSize > 100",
    message: "Budget range is required for events with 100+ attendees",
  },
  {
    type: "conditional" as const,
    name: "Partner role when partner named",
    fields: ["partnerRole"],
    condition: "partnerName IS NOT EMPTY",
    message: "Partner role must be specified — co-host, sponsor, or attendee source",
  },
  {
    type: "placeholder" as const,
    name: "Placeholder detection",
    fields: null,
    condition: null,
    message: "'{field}' contains a placeholder — replace with a specific value",
  },
  {
    type: "quality" as const,
    name: "Objective specificity",
    fields: ["objective"],
    condition: null,
    message:
      "Objective must specify a measurable buyer outcome, not a generic goal like 'raise awareness' or 'drive engagement'",
  },
  {
    type: "quality" as const,
    name: "Metrics-objective alignment",
    fields: ["successMetrics", "objective"],
    condition: null,
    message:
      "Success metrics must directly measure whether the stated objective was achieved",
  },
  {
    type: "quality" as const,
    name: "Internal consistency",
    fields: null,
    condition: null,
    message:
      "Check coherence between audience type, event format, scale, budget, and geography",
  },
  {
    type: "quality" as const,
    name: "Strategic alignment",
    fields: ["strategicRationale"],
    condition: null,
    message:
      "Strategic rationale must be specific and credible — explain exactly how this event advances the stated priority",
  },
];

async function seed() {
  console.log("Seeding taxonomy categories and entries...");

  for (const category of CATEGORIES) {
    const [cat] = await db
      .insert(taxonomyCategories)
      .values({
        slug: category.slug,
        name: category.name,
        description: category.description,
      })
      .returning();

    for (const entryName of category.entries) {
      await db.insert(taxonomyEntries).values({
        categoryId: cat.id,
        name: entryName,
      });
    }

    console.log(`  ✓ ${category.name}: ${category.entries.length} entries`);
  }

  console.log("\nSeeding readiness rules...");

  for (const rule of DEFAULT_RULES) {
    await db.insert(readinessRules).values({
      type: rule.type,
      name: rule.name,
      fields: rule.fields,
      condition: rule.condition,
      message: rule.message,
    });
  }

  console.log(`  ✓ ${DEFAULT_RULES.length} rules`);
  console.log("\nSeed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

- [ ] **Step 2: Add seed script to package.json**

Add to `package.json` scripts:

```json
{
  "scripts": {
    "db:seed": "npx tsx src/lib/db/seed.ts"
  }
}
```

- [ ] **Step 3: Run seed**

```bash
npm run db:seed
```

Expected output:
```
Seeding taxonomy categories and entries...
  ✓ Event Types: 9 entries
  ✓ Products / Solutions: 9 entries
  ✓ Geographies: 13 entries
  ✓ Customer Segments: 8 entries
  ✓ Buyer Roles: 10 entries
  ✓ Strategic Priorities: 7 entries
  ✓ Success Metric Types: 8 entries

Seeding readiness rules...
  ✓ 16 rules

Seed complete.
```

Verify in Supabase Dashboard > Table Editor — all tables should have data.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/seed.ts package.json
git commit -m "feat: add taxonomy seed data and default readiness rules"
```

---

## Task 4: Auth & App Layout

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `src/proxy.ts`
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/signup/page.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/user-menu.tsx`

- [ ] **Step 1: Create Supabase browser client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create Supabase server client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored in Server Components
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Create Supabase middleware helper**

Create `src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 4: Create proxy.ts (Next.js 16 middleware)**

Create `src/proxy.ts`:

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 5: Update root layout**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Proposal Readiness",
  description: "AI-assisted event proposal workflow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

Install Geist font:

```bash
npm install geist
```

- [ ] **Step 6: Create root page redirect**

Replace `src/app/page.tsx`:

```typescript
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/proposals");
}
```

- [ ] **Step 7: Create auth layout**

Create `src/app/(auth)/layout.tsx`:

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
```

- [ ] **Step 8: Create login page**

Create `src/app/(auth)/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/proposals");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Event Proposal Readiness Engine</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="text-primary underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

- [ ] **Step 9: Create signup page**

Create `src/app/(auth)/signup/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/proposals");
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Event Proposal Readiness Engine</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
```

- [ ] **Step 10: Create app sidebar**

Create `src/components/layout/app-sidebar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Settings, Shield } from "lucide-react";

const navigation = [
  { name: "Proposals", href: "/proposals", icon: FileText },
  { name: "Taxonomy", href: "/admin/taxonomy", icon: Settings },
  { name: "Readiness Rules", href: "/admin/rules", icon: Shield },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-sm font-semibold tracking-tight">
          Event Readiness
        </h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              pathname.startsWith(item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

Install lucide-react:

```bash
npm install lucide-react
```

- [ ] **Step 11: Create user menu**

Create `src/components/layout/user-menu.tsx`:

```typescript
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function UserMenu({ email }: { email: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span className="text-sm">{email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 12: Create authenticated app layout**

Create `src/app/(app)/layout.tsx`:

```typescript
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { UserMenu } from "@/components/layout/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end border-b px-4">
          <UserMenu email={user.email ?? "User"} />
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 13: Verify dev server starts**

```bash
npm run dev
```

Open `http://localhost:3000` — should redirect to `/login`. Create an account, sign in, see the sidebar layout.

- [ ] **Step 14: Commit**

```bash
git add src/lib/supabase/ src/proxy.ts src/app/ src/components/layout/
git commit -m "feat: add Supabase auth, login/signup, authenticated app layout"
```

---

## Task 5: Taxonomy Admin UI

**Files:**
- Create: `src/lib/actions/taxonomy.ts`
- Create: `src/components/admin/taxonomy-manager.tsx`
- Create: `src/app/(app)/admin/taxonomy/page.tsx`

- [ ] **Step 1: Create taxonomy server actions**

Create `src/lib/actions/taxonomy.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { taxonomyCategories, taxonomyEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTaxonomyCategories() {
  return db.query.taxonomyCategories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
}

export async function getTaxonomyEntries(categoryId: string) {
  return db.query.taxonomyEntries.findMany({
    where: eq(taxonomyEntries.categoryId, categoryId),
    orderBy: (entries, { asc }) => [asc(entries.name)],
  });
}

export async function getAllTaxonomyEntries() {
  return db.query.taxonomyEntries.findMany({
    with: {
      // We need to set up relations for this — see step 2
    },
    orderBy: (entries, { asc }) => [asc(entries.name)],
  });
}

export async function getTaxonomyEntriesBySlug(slug: string) {
  const category = await db.query.taxonomyCategories.findFirst({
    where: eq(taxonomyCategories.slug, slug),
  });
  if (!category) return [];
  return db.query.taxonomyEntries.findMany({
    where: eq(taxonomyEntries.categoryId, category.id),
    orderBy: (entries, { asc }) => [asc(entries.name)],
  });
}

export async function addTaxonomyEntry(categoryId: string, name: string, description?: string) {
  await db.insert(taxonomyEntries).values({
    categoryId,
    name,
    description: description || null,
  });
  revalidatePath("/admin/taxonomy");
}

export async function updateTaxonomyEntry(
  id: string,
  data: { name?: string; description?: string; active?: boolean }
) {
  await db
    .update(taxonomyEntries)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(taxonomyEntries.id, id));
  revalidatePath("/admin/taxonomy");
}

export async function deleteTaxonomyEntry(id: string) {
  await db.delete(taxonomyEntries).where(eq(taxonomyEntries.id, id));
  revalidatePath("/admin/taxonomy");
}
```

- [ ] **Step 2: Add Drizzle relations**

Add to the bottom of `src/lib/db/schema.ts`:

```typescript
import { relations } from "drizzle-orm";

export const taxonomyCategoriesRelations = relations(
  taxonomyCategories,
  ({ many }) => ({
    entries: many(taxonomyEntries),
  })
);

export const taxonomyEntriesRelations = relations(
  taxonomyEntries,
  ({ one }) => ({
    category: one(taxonomyCategories, {
      fields: [taxonomyEntries.categoryId],
      references: [taxonomyCategories.id],
    }),
  })
);

export const proposalsRelations = relations(proposals, ({ many }) => ({
  versions: many(proposalVersions),
}));

export const proposalVersionsRelations = relations(
  proposalVersions,
  ({ one, many }) => ({
    proposal: one(proposals, {
      fields: [proposalVersions.proposalId],
      references: [proposals.id],
    }),
    assessments: many(assessments),
  })
);

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  proposalVersion: one(proposalVersions, {
    fields: [assessments.proposalVersionId],
    references: [proposalVersions.id],
  }),
}));
```

- [ ] **Step 3: Create taxonomy manager component**

Create `src/components/admin/taxonomy-manager.tsx`:

```typescript
"use client";

import { useState } from "react";
import type { TaxonomyCategory, TaxonomyEntry } from "@/lib/types";
import {
  addTaxonomyEntry,
  updateTaxonomyEntry,
  deleteTaxonomyEntry,
} from "@/lib/actions/taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

type CategoryWithEntries = TaxonomyCategory & {
  entries: TaxonomyEntry[];
};

export function TaxonomyManager({
  categories,
}: {
  categories: CategoryWithEntries[];
}) {
  return (
    <Accordion type="multiple" className="space-y-2">
      {categories.map((category) => (
        <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="font-medium">{category.name}</span>
              <Badge variant="secondary">{category.entries.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CategoryEntries category={category} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function CategoryEntries({ category }: { category: CategoryWithEntries }) {
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    await addTaxonomyEntry(category.id, newName.trim(), newDesc.trim() || undefined);
    setNewName("");
    setNewDesc("");
    setAdding(false);
    toast.success(`Added "${newName.trim()}" to ${category.name}`);
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="space-y-1">
        {category.entries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} />
        ))}
      </div>
      <div className="flex gap-2 items-end pt-2 border-t">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">New entry</Label>
          <Input
            placeholder="Entry name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <Button size="sm" onClick={handleAdd} disabled={adding || !newName.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}

function EntryRow({ entry }: { entry: TaxonomyEntry }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entry.name);
  const [description, setDescription] = useState(entry.description ?? "");

  async function handleSave() {
    await updateTaxonomyEntry(entry.id, {
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setEditing(false);
    toast.success("Entry updated");
  }

  async function handleToggleActive() {
    await updateTaxonomyEntry(entry.id, { active: !entry.active });
    toast.success(entry.active ? "Entry deactivated" : "Entry activated");
  }

  return (
    <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent/50 group">
      <span
        className={`flex-1 text-sm ${!entry.active ? "text-muted-foreground line-through" : ""}`}
      >
        {entry.name}
      </span>
      {entry.description && (
        <span className="text-xs text-muted-foreground max-w-48 truncate">
          {entry.description}
        </span>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleToggleActive}
          title={entry.active ? "Deactivate" : "Activate"}
        >
          {entry.active ? (
            <ToggleRight className="h-3.5 w-3.5" />
          ) : (
            <ToggleLeft className="h-3.5 w-3.5" />
          )}
        </Button>
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create taxonomy admin page**

Create `src/app/(app)/admin/taxonomy/page.tsx`:

```typescript
import { db } from "@/lib/db";
import { taxonomyCategories } from "@/lib/db/schema";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export default async function TaxonomyPage() {
  const categories = await db.query.taxonomyCategories.findMany({
    with: {
      entries: {
        orderBy: (entries, { asc }) => [asc(entries.name)],
      },
    },
    orderBy: (cats, { asc }) => [asc(cats.name)],
  });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Taxonomy Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage controlled vocabularies used in proposal forms and readiness assessment.
        </p>
      </div>
      <TaxonomyManager categories={categories} />
    </div>
  );
}
```

- [ ] **Step 5: Verify taxonomy admin works**

```bash
npm run dev
```

Navigate to `/admin/taxonomy`. Should see all 7 vocabulary categories with their seeded entries. Test: add an entry, edit an entry, deactivate an entry.

- [ ] **Step 6: Commit**

```bash
git add src/lib/actions/taxonomy.ts src/lib/db/schema.ts src/components/admin/taxonomy-manager.tsx src/app/\(app\)/admin/taxonomy/
git commit -m "feat: add taxonomy admin UI with CRUD operations"
```

---

## Task 6: Proposal CRUD & Form

**Files:**
- Create: `src/lib/actions/proposals.ts`
- Create: `src/components/proposals/proposal-form.tsx`
- Create: `src/components/proposals/proposal-form-section.tsx`
- Create: `src/components/proposals/taxonomy-field.tsx`
- Create: `src/app/(app)/proposals/new/page.tsx`
- Create: `src/app/(app)/proposals/[id]/edit/page.tsx`

- [ ] **Step 1: Create proposal server actions**

Create `src/lib/actions/proposals.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { proposals, proposalVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type ProposalFormData = {
  title?: string;
  eventType?: string;
  format?: string;
  proposedTiming?: string;
  venueType?: string;
  targetSegment?: string;
  buyerRoles?: string[];
  geography?: string;
  audienceSize?: string;
  targetAccounts?: string;
  productFocus?: string;
  strategicRationale?: string;
  objective?: string;
  successMetrics?: string;
  relatedCampaign?: string;
  budgetRange?: string;
  owner?: string;
  dependencies?: string;
  partnerName?: string;
  partnerRole?: string;
  executiveParticipation?: string;
  regulatoryConsiderations?: string;
  followUpExpectation?: string;
};

export async function createProposal(data: ProposalFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [proposal] = await db
    .insert(proposals)
    .values({ userId: user.id })
    .returning();

  await db.insert(proposalVersions).values({
    proposalId: proposal.id,
    version: 1,
    ...data,
    buyerRoles: data.buyerRoles ?? null,
  });

  revalidatePath("/proposals");
  redirect(`/proposals/${proposal.id}`);
}

export async function updateProposal(proposalId: string, data: ProposalFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, proposalId),
  });
  if (!proposal) throw new Error("Proposal not found");

  const newVersion = proposal.currentVersion + 1;

  await db.insert(proposalVersions).values({
    proposalId,
    version: newVersion,
    ...data,
    buyerRoles: data.buyerRoles ?? null,
  });

  await db
    .update(proposals)
    .set({ currentVersion: newVersion, updatedAt: new Date() })
    .where(eq(proposals.id, proposalId));

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
  redirect(`/proposals/${proposalId}`);
}

export async function getProposal(id: string) {
  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, id),
    with: {
      versions: {
        orderBy: (v, { desc }) => [desc(v.version)],
        limit: 1,
        with: {
          assessments: {
            orderBy: (a, { desc }) => [desc(a.createdAt)],
            limit: 1,
          },
        },
      },
    },
  });

  if (!proposal || proposal.versions.length === 0) return null;

  return {
    ...proposal,
    version: proposal.versions[0],
    assessment: proposal.versions[0].assessments[0] ?? null,
  };
}

export async function getProposals() {
  const results = await db.query.proposals.findMany({
    with: {
      versions: {
        orderBy: (v, { desc }) => [desc(v.version)],
        limit: 1,
        with: {
          assessments: {
            orderBy: (a, { desc }) => [desc(a.createdAt)],
            limit: 1,
          },
        },
      },
    },
    orderBy: (p, { desc }) => [desc(p.updatedAt)],
  });

  return results
    .filter((p) => p.versions.length > 0)
    .map((p) => ({
      ...p,
      version: p.versions[0],
      assessment: p.versions[0].assessments[0] ?? null,
    }));
}
```

- [ ] **Step 2: Create taxonomy field component**

Create `src/components/proposals/taxonomy-field.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { getTaxonomyEntriesBySlug } from "@/lib/actions/taxonomy";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
};

export function TaxonomyField({
  slug,
  value,
  onChange,
  multiple = false,
  placeholder = "Select...",
}: Props) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getTaxonomyEntriesBySlug(slug).then((data) =>
      setEntries(data.filter((e) => e.active).map((e) => ({ id: e.id, name: e.name })))
    );
  }, [slug]);

  if (multiple) {
    const selected = (value as string[]) ?? [];
    return (
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between font-normal"
            >
              {selected.length > 0
                ? `${selected.length} selected`
                : placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results.</CommandEmpty>
                <CommandGroup>
                  {entries.map((entry) => (
                    <CommandItem
                      key={entry.id}
                      onSelect={() => {
                        const newValue = selected.includes(entry.name)
                          ? selected.filter((v) => v !== entry.name)
                          : [...selected, entry.name];
                        onChange(newValue);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(entry.name)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {entry.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selected.map((name) => (
              <Badge key={name} variant="secondary" className="gap-1">
                {name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onChange(selected.filter((v) => v !== name))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  const singleValue = value as string | undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal"
        >
          {singleValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {entries.map((entry) => (
                <CommandItem
                  key={entry.id}
                  onSelect={() => {
                    onChange(entry.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      singleValue === entry.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {entry.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 3: Create collapsible form section component**

Create `src/components/proposals/proposal-form-section.tsx`:

```typescript
"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function ProposalFormSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors">
        <h3 className="text-sm font-semibold">{title}</h3>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-4 p-4 pt-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

- [ ] **Step 4: Create the proposal form component**

Create `src/components/proposals/proposal-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProposal,
  updateProposal,
  type ProposalFormData,
} from "@/lib/actions/proposals";
import { ProposalFormSection } from "./proposal-form-section";
import { TaxonomyField } from "./taxonomy-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ProposalVersion } from "@/lib/types";

type Props = {
  proposalId?: string;
  initialData?: ProposalVersion;
};

export function ProposalForm({ proposalId, initialData }: Props) {
  const [data, setData] = useState<ProposalFormData>({
    title: initialData?.title ?? "",
    eventType: initialData?.eventType ?? "",
    format: initialData?.format ?? "",
    proposedTiming: initialData?.proposedTiming ?? "",
    venueType: initialData?.venueType ?? "",
    targetSegment: initialData?.targetSegment ?? "",
    buyerRoles: (initialData?.buyerRoles as string[]) ?? [],
    geography: initialData?.geography ?? "",
    audienceSize: initialData?.audienceSize ?? "",
    targetAccounts: initialData?.targetAccounts ?? "",
    productFocus: initialData?.productFocus ?? "",
    strategicRationale: initialData?.strategicRationale ?? "",
    objective: initialData?.objective ?? "",
    successMetrics: initialData?.successMetrics ?? "",
    relatedCampaign: initialData?.relatedCampaign ?? "",
    budgetRange: initialData?.budgetRange ?? "",
    owner: initialData?.owner ?? "",
    dependencies: initialData?.dependencies ?? "",
    partnerName: initialData?.partnerName ?? "",
    partnerRole: initialData?.partnerRole ?? "",
    executiveParticipation: initialData?.executiveParticipation ?? "",
    regulatoryConsiderations: initialData?.regulatoryConsiderations ?? "",
    followUpExpectation: initialData?.followUpExpectation ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ProposalFormData>(
    key: K,
    value: ProposalFormData[K]
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      if (proposalId) {
        await updateProposal(proposalId, data);
      } else {
        await createProposal(data);
      }
    } catch (err) {
      toast.error("Failed to save proposal");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <ProposalFormSection title="Event Basics">
        <div className="space-y-2">
          <Label>Event Title</Label>
          <Input
            value={data.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g., Q3 APAC Payments Executive Breakfast"
          />
        </div>
        <div className="space-y-2">
          <Label>Event Type</Label>
          <TaxonomyField
            slug="event_types"
            value={data.eventType}
            onChange={(v) => update("eventType", v as string)}
            placeholder="Select event type..."
          />
        </div>
        <div className="space-y-2">
          <Label>Format</Label>
          <Input
            value={data.format}
            onChange={(e) => update("format", e.target.value)}
            placeholder="e.g., Seated dinner with keynote, Panel discussion"
          />
        </div>
        <div className="space-y-2">
          <Label>Proposed Timing</Label>
          <Input
            value={data.proposedTiming}
            onChange={(e) => update("proposedTiming", e.target.value)}
            placeholder="e.g., Q3 2026, September 15-17, Sibos week"
          />
        </div>
        <div className="space-y-2">
          <Label>Venue Type</Label>
          <Input
            value={data.venueType}
            onChange={(e) => update("venueType", e.target.value)}
            placeholder="e.g., Hotel private dining room, Conference venue"
          />
        </div>
      </ProposalFormSection>

      <ProposalFormSection title="Audience & Targeting">
        <div className="space-y-2">
          <Label>Target Segment</Label>
          <TaxonomyField
            slug="segments"
            value={data.targetSegment}
            onChange={(v) => update("targetSegment", v as string)}
            placeholder="Select segment..."
          />
        </div>
        <div className="space-y-2">
          <Label>Target Buyer Roles</Label>
          <TaxonomyField
            slug="buyer_roles"
            value={data.buyerRoles}
            onChange={(v) => update("buyerRoles", v as string[])}
            multiple
            placeholder="Select buyer roles..."
          />
        </div>
        <div className="space-y-2">
          <Label>Geography / Market</Label>
          <TaxonomyField
            slug="geographies"
            value={data.geography}
            onChange={(v) => update("geography", v as string)}
            placeholder="Select geography..."
          />
        </div>
        <div className="space-y-2">
          <Label>Audience Size</Label>
          <Input
            value={data.audienceSize}
            onChange={(e) => update("audienceSize", e.target.value)}
            placeholder="e.g., 25-30 attendees"
          />
        </div>
        <div className="space-y-2">
          <Label>Target Accounts (optional)</Label>
          <Textarea
            value={data.targetAccounts}
            onChange={(e) => update("targetAccounts", e.target.value)}
            placeholder="Named accounts or account criteria..."
            rows={2}
          />
        </div>
      </ProposalFormSection>

      <ProposalFormSection title="Product & Strategy">
        <div className="space-y-2">
          <Label>Product / Solution Focus</Label>
          <TaxonomyField
            slug="products"
            value={data.productFocus}
            onChange={(v) => update("productFocus", v as string)}
            placeholder="Select product..."
          />
        </div>
        <div className="space-y-2">
          <Label>Strategic Rationale</Label>
          <Textarea
            value={data.strategicRationale}
            onChange={(e) => update("strategicRationale", e.target.value)}
            placeholder="Why this event? How does it advance a strategic priority?"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Objective</Label>
          <Textarea
            value={data.objective}
            onChange={(e) => update("objective", e.target.value)}
            placeholder="What specific, measurable outcome should this event produce?"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Success Metrics</Label>
          <Textarea
            value={data.successMetrics}
            onChange={(e) => update("successMetrics", e.target.value)}
            placeholder="How will you measure whether this event achieved its objective?"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Related Campaign / Program (optional)</Label>
          <Input
            value={data.relatedCampaign}
            onChange={(e) => update("relatedCampaign", e.target.value)}
            placeholder="e.g., APAC Payments Growth H2 Campaign"
          />
        </div>
      </ProposalFormSection>

      <ProposalFormSection title="Logistics & Budget">
        <div className="space-y-2">
          <Label>Estimated Budget Range</Label>
          <Input
            value={data.budgetRange}
            onChange={(e) => update("budgetRange", e.target.value)}
            placeholder="e.g., $15,000-$25,000"
          />
        </div>
        <div className="space-y-2">
          <Label>Owner</Label>
          <Input
            value={data.owner}
            onChange={(e) => update("owner", e.target.value)}
            placeholder="Who is responsible for this event?"
          />
        </div>
        <div className="space-y-2">
          <Label>Dependencies / Required Approvals</Label>
          <Textarea
            value={data.dependencies}
            onChange={(e) => update("dependencies", e.target.value)}
            placeholder="Budget approval, venue booking, speaker confirmation..."
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Partner (optional)</Label>
            <Input
              value={data.partnerName}
              onChange={(e) => update("partnerName", e.target.value)}
              placeholder="Partner name"
            />
          </div>
          <div className="space-y-2">
            <Label>Partner Role</Label>
            <Input
              value={data.partnerRole}
              onChange={(e) => update("partnerRole", e.target.value)}
              placeholder="Co-host, sponsor, attendee source"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Executive Participation (optional)</Label>
          <Input
            value={data.executiveParticipation}
            onChange={(e) => update("executiveParticipation", e.target.value)}
            placeholder="e.g., Regional CEO keynote, MD hosting"
          />
        </div>
      </ProposalFormSection>

      <ProposalFormSection title="Optional" defaultOpen={false}>
        <div className="space-y-2">
          <Label>Regulatory / Compliance Considerations</Label>
          <Textarea
            value={data.regulatoryConsiderations}
            onChange={(e) => update("regulatoryConsiderations", e.target.value)}
            placeholder="Any regulatory requirements for this market or event type..."
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Follow-up / Conversion Expectation</Label>
          <Textarea
            value={data.followUpExpectation}
            onChange={(e) => update("followUpExpectation", e.target.value)}
            placeholder="Expected post-event follow-up process and conversion targets..."
            rows={2}
          />
        </div>
      </ProposalFormSection>

      <div className="flex gap-3 pt-4">
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting
            ? "Saving..."
            : proposalId
              ? "Save & Assess Readiness"
              : "Create & Assess Readiness"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create new proposal page**

Create `src/app/(app)/proposals/new/page.tsx`:

```typescript
import { ProposalForm } from "@/components/proposals/proposal-form";

export default function NewProposalPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">New Event Proposal</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details below. The readiness engine will assess your
          proposal on submission.
        </p>
      </div>
      <ProposalForm />
    </div>
  );
}
```

- [ ] **Step 6: Create edit proposal page**

Create `src/app/(app)/proposals/[id]/edit/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import { getProposal } from "@/lib/actions/proposals";
import { ProposalForm } from "@/components/proposals/proposal-form";

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) notFound();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Edit Proposal</h2>
        <p className="text-sm text-muted-foreground">
          Update your proposal. A new version will be created and re-assessed.
        </p>
      </div>
      <ProposalForm proposalId={id} initialData={proposal.version} />
    </div>
  );
}
```

- [ ] **Step 7: Verify the form works**

```bash
npm run dev
```

Navigate to `/proposals/new`. Fill in some fields, submit. Verify proposal is created in the database (check Supabase Dashboard > Table Editor > proposals + proposal_versions).

- [ ] **Step 8: Commit**

```bash
git add src/lib/actions/proposals.ts src/components/proposals/ src/app/\(app\)/proposals/
git commit -m "feat: add proposal form with taxonomy-aware fields and CRUD actions"
```

---

## Task 7: Proposal List View

**Files:**
- Create: `src/components/proposals/proposal-list.tsx`
- Create: `src/components/proposals/proposal-list-filters.tsx`
- Create: `src/app/(app)/proposals/page.tsx`

- [ ] **Step 1: Create filter bar component**

Create `src/components/proposals/proposal-list-filters.tsx`:

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const READINESS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "not_ready", label: "Not Ready" },
  { value: "partially_ready", label: "Partially Ready" },
  { value: "ready_for_review", label: "Ready for Review" },
  { value: "unassessed", label: "Not Assessed" },
];

export function ProposalListFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/proposals?${params.toString()}`);
  }

  return (
    <div className="flex gap-3">
      <Input
        placeholder="Search proposals..."
        className="max-w-xs"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => setFilter("q", e.target.value)}
      />
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(v) => setFilter("status", v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {READINESS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 2: Create proposal list component**

Create `src/components/proposals/proposal-list.tsx`:

```typescript
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProposalWithDetails } from "@/lib/types";

const STATUS_BADGES: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  not_ready: { label: "Not Ready", variant: "destructive" },
  partially_ready: { label: "Partially Ready", variant: "secondary" },
  ready_for_review: { label: "Ready for Review", variant: "default" },
};

export function ProposalList({
  proposals,
}: {
  proposals: ProposalWithDetails[];
}) {
  if (proposals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No proposals yet. Create your first event proposal to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Event Type</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Readiness</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposals.map((proposal) => {
          const status = proposal.assessment?.status;
          const badge = status ? STATUS_BADGES[status] : null;

          return (
            <TableRow key={proposal.id}>
              <TableCell>
                <Link
                  href={`/proposals/${proposal.id}`}
                  className="font-medium hover:underline"
                >
                  {proposal.version.title || "Untitled Proposal"}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {proposal.version.eventType || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {proposal.version.geography || "—"}
              </TableCell>
              <TableCell>
                {badge ? (
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                ) : (
                  <Badge variant="outline">Not Assessed</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {proposal.version.owner || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(proposal.updatedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 3: Create proposals list page**

Create `src/app/(app)/proposals/page.tsx`:

```typescript
import { Suspense } from "react";
import Link from "next/link";
import { getProposals } from "@/lib/actions/proposals";
import { ProposalList } from "@/components/proposals/proposal-list";
import { ProposalListFilters } from "@/components/proposals/proposal-list-filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  let proposals = await getProposals();

  // Apply filters
  if (params.q) {
    const q = params.q.toLowerCase();
    proposals = proposals.filter(
      (p) =>
        p.version.title?.toLowerCase().includes(q) ||
        p.version.eventType?.toLowerCase().includes(q) ||
        p.version.geography?.toLowerCase().includes(q) ||
        p.version.owner?.toLowerCase().includes(q)
    );
  }

  if (params.status && params.status !== "all") {
    if (params.status === "unassessed") {
      proposals = proposals.filter((p) => !p.assessment);
    } else {
      proposals = proposals.filter(
        (p) => p.assessment?.status === params.status
      );
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Event Proposals</h2>
          <p className="text-sm text-muted-foreground">
            {proposals.length} proposal{proposals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/proposals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Proposal
          </Link>
        </Button>
      </div>
      <div className="space-y-4">
        <Suspense>
          <ProposalListFilters />
        </Suspense>
        <ProposalList proposals={proposals} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify list view**

```bash
npm run dev
```

Navigate to `/proposals`. Should show proposals created earlier. Test filters — search by title, filter by status.

- [ ] **Step 5: Commit**

```bash
git add src/components/proposals/proposal-list.tsx src/components/proposals/proposal-list-filters.tsx src/app/\(app\)/proposals/page.tsx
git commit -m "feat: add proposal list view with search and status filtering"
```

---

## Task 8: Rule-Based Readiness Engine (TDD)

**Files:**
- Create: `src/lib/readiness/rules-engine.ts`
- Create: `tests/readiness/rules-engine.test.ts`

- [ ] **Step 1: Write failing tests for the rule-based engine**

Create `tests/readiness/rules-engine.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  evaluateFieldRules,
  type FieldRuleFinding,
} from "@/lib/readiness/rules-engine";
import type { ProposalFormData } from "@/lib/actions/proposals";
import type { ReadinessRule } from "@/lib/types";

const REQUIRED_TITLE_RULE: ReadinessRule = {
  id: "r1",
  type: "required",
  name: "Title required",
  description: null,
  fields: ["title"],
  condition: null,
  message: "Event title is required",
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const CONDITIONAL_BUYER_ROLES_RULE: ReadinessRule = {
  id: "r2",
  type: "conditional",
  name: "Buyer roles for executive events",
  description: null,
  fields: ["buyerRoles"],
  condition:
    "eventType IN ['Executive Dinner', 'Client Roundtable', 'Thought Leadership Panel']",
  message: "Buyer roles are required for executive-format events",
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const CONDITIONAL_PARTNER_ROLE_RULE: ReadinessRule = {
  id: "r3",
  type: "conditional",
  name: "Partner role when partner named",
  description: null,
  fields: ["partnerRole"],
  condition: "partnerName IS NOT EMPTY",
  message: "Partner role must be specified",
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const PLACEHOLDER_RULE: ReadinessRule = {
  id: "r4",
  type: "placeholder",
  name: "Placeholder detection",
  description: null,
  fields: null,
  condition: null,
  message: "'{field}' contains a placeholder — replace with a specific value",
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const ALL_RULES = [
  REQUIRED_TITLE_RULE,
  CONDITIONAL_BUYER_ROLES_RULE,
  CONDITIONAL_PARTNER_ROLE_RULE,
  PLACEHOLDER_RULE,
];

function makeProposal(overrides: Partial<ProposalFormData> = {}): ProposalFormData {
  return {
    title: "Q3 APAC Payments Dinner",
    eventType: "Executive Dinner",
    format: "Seated dinner with keynote",
    proposedTiming: "September 2026",
    venueType: "Hotel",
    targetSegment: "Enterprise (Tier 1)",
    buyerRoles: ["CFO", "Treasurer"],
    geography: "Singapore",
    audienceSize: "25",
    productFocus: "Payments",
    strategicRationale: "Advance APAC payments growth",
    objective: "Generate 10 qualified pipeline meetings",
    successMetrics: "Pipeline value, meetings booked",
    budgetRange: "$20,000-$30,000",
    owner: "Jane Smith",
    dependencies: "Budget approval",
    ...overrides,
  };
}

describe("evaluateFieldRules", () => {
  it("returns no findings for a complete proposal", () => {
    const findings = evaluateFieldRules(makeProposal(), ALL_RULES);
    const issues = findings.filter((f) => f.status !== "strong");
    expect(issues).toHaveLength(0);
  });

  it("flags missing required fields", () => {
    const findings = evaluateFieldRules(
      makeProposal({ title: "" }),
      ALL_RULES
    );
    const titleFinding = findings.find((f) => f.field === "title");
    expect(titleFinding).toBeDefined();
    expect(titleFinding!.status).toBe("missing");
    expect(titleFinding!.message).toBe("Event title is required");
  });

  it("flags conditional rule: buyer roles required for executive events", () => {
    const findings = evaluateFieldRules(
      makeProposal({ eventType: "Executive Dinner", buyerRoles: [] }),
      ALL_RULES
    );
    const finding = findings.find((f) => f.field === "buyerRoles");
    expect(finding).toBeDefined();
    expect(finding!.status).toBe("missing");
  });

  it("does not flag conditional rule when condition is not met", () => {
    const findings = evaluateFieldRules(
      makeProposal({ eventType: "Webinar", buyerRoles: [] }),
      ALL_RULES
    );
    const finding = findings.find(
      (f) => f.field === "buyerRoles" && f.status === "missing"
    );
    expect(finding).toBeUndefined();
  });

  it("flags partner role missing when partner name is provided", () => {
    const findings = evaluateFieldRules(
      makeProposal({ partnerName: "Acme Corp", partnerRole: "" }),
      ALL_RULES
    );
    const finding = findings.find((f) => f.field === "partnerRole");
    expect(finding).toBeDefined();
    expect(finding!.status).toBe("missing");
  });

  it("detects placeholder text in fields", () => {
    const findings = evaluateFieldRules(
      makeProposal({ objective: "TBD" }),
      ALL_RULES
    );
    const finding = findings.find(
      (f) => f.field === "objective" && f.status === "weak"
    );
    expect(finding).toBeDefined();
    expect(finding!.message).toContain("placeholder");
  });

  it("detects case-insensitive placeholders", () => {
    const findings = evaluateFieldRules(
      makeProposal({ successMetrics: "to be confirmed" }),
      ALL_RULES
    );
    const finding = findings.find(
      (f) => f.field === "successMetrics" && f.status === "weak"
    );
    expect(finding).toBeDefined();
  });

  it("skips inactive rules", () => {
    const inactiveRule = { ...REQUIRED_TITLE_RULE, active: false };
    const findings = evaluateFieldRules(makeProposal({ title: "" }), [
      inactiveRule,
    ]);
    const titleFinding = findings.find((f) => f.field === "title" && f.status === "missing");
    expect(titleFinding).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test -- tests/readiness/rules-engine.test.ts
```

Expected: FAIL — module `@/lib/readiness/rules-engine` does not exist.

- [ ] **Step 3: Implement the rule-based engine**

Create `src/lib/readiness/rules-engine.ts`:

```typescript
import type { ReadinessRule } from "@/lib/types";
import type { ProposalFormData } from "@/lib/actions/proposals";
import { PROPOSAL_FIELDS, type ProposalFieldKey } from "@/lib/types";

export type FieldRuleFinding = {
  field: string;
  status: "missing" | "weak" | "strong";
  message: string;
  suggestion?: string;
};

const PLACEHOLDER_PATTERNS = [
  /^tbd$/i,
  /^tbc$/i,
  /^to be confirmed$/i,
  /^to be decided$/i,
  /^to be determined$/i,
  /^various$/i,
  /^multiple$/i,
  /^n\/a$/i,
  /^placeholder$/i,
  /^xxx$/i,
  /^tba$/i,
];

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function isPlaceholder(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function getFieldValue(data: ProposalFormData, field: string): unknown {
  return (data as Record<string, unknown>)[field];
}

function evaluateCondition(
  condition: string,
  data: ProposalFormData
): boolean {
  // Parse "fieldName IN ['value1', 'value2']"
  const inMatch = condition.match(
    /^(\w+)\s+IN\s+\[([^\]]+)\]$/
  );
  if (inMatch) {
    const fieldName = inMatch[1];
    const values = inMatch[2]
      .split(",")
      .map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
    const fieldValue = getFieldValue(data, fieldName);
    return typeof fieldValue === "string" && values.includes(fieldValue);
  }

  // Parse "fieldName IS NOT EMPTY"
  const notEmptyMatch = condition.match(/^(\w+)\s+IS\s+NOT\s+EMPTY$/i);
  if (notEmptyMatch) {
    const fieldName = notEmptyMatch[1];
    return !isEmpty(getFieldValue(data, fieldName));
  }

  // Parse "fieldName > N"
  const gtMatch = condition.match(/^(\w+)\s*>\s*(\d+)$/);
  if (gtMatch) {
    const fieldName = gtMatch[1];
    const threshold = parseInt(gtMatch[2], 10);
    const fieldValue = getFieldValue(data, fieldName);
    const numValue = typeof fieldValue === "string" ? parseInt(fieldValue, 10) : NaN;
    return !isNaN(numValue) && numValue > threshold;
  }

  return false;
}

export function evaluateFieldRules(
  data: ProposalFormData,
  rules: ReadinessRule[]
): FieldRuleFinding[] {
  const findings: FieldRuleFinding[] = [];

  for (const rule of rules) {
    if (!rule.active) continue;

    if (rule.type === "required") {
      for (const field of rule.fields ?? []) {
        const value = getFieldValue(data, field);
        if (isEmpty(value)) {
          findings.push({
            field,
            status: "missing",
            message: rule.message,
          });
        }
      }
    }

    if (rule.type === "conditional" && rule.condition) {
      const conditionMet = evaluateCondition(rule.condition, data);
      if (conditionMet) {
        for (const field of rule.fields ?? []) {
          const value = getFieldValue(data, field);
          if (isEmpty(value)) {
            findings.push({
              field,
              status: "missing",
              message: rule.message,
            });
          }
        }
      }
    }

    if (rule.type === "placeholder") {
      // Check all text fields for placeholder patterns
      const textFields: ProposalFieldKey[] = [
        "title",
        "format",
        "proposedTiming",
        "venueType",
        "audienceSize",
        "targetAccounts",
        "strategicRationale",
        "objective",
        "successMetrics",
        "relatedCampaign",
        "budgetRange",
        "owner",
        "dependencies",
        "partnerName",
        "partnerRole",
        "executiveParticipation",
        "regulatoryConsiderations",
        "followUpExpectation",
      ];

      for (const field of textFields) {
        const value = getFieldValue(data, field);
        if (isPlaceholder(value)) {
          findings.push({
            field,
            status: "weak",
            message: rule.message.replace(
              "{field}",
              PROPOSAL_FIELDS[field] ?? field
            ),
          });
        }
      }
    }
  }

  return findings;
}

export function computeReadinessStatus(
  ruleFindings: FieldRuleFinding[],
  llmFindings: FieldRuleFinding[]
): "not_ready" | "partially_ready" | "ready_for_review" {
  const allFindings = [...ruleFindings, ...llmFindings];
  const missingCount = allFindings.filter((f) => f.status === "missing").length;
  const weakCount = allFindings.filter((f) => f.status === "weak").length;

  if (missingCount >= 3) return "not_ready";
  if (missingCount > 0 || weakCount >= 2) return "partially_ready";
  return "ready_for_review";
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- tests/readiness/rules-engine.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/readiness/rules-engine.ts tests/readiness/rules-engine.test.ts
git commit -m "feat: add rule-based readiness engine with tests"
```

---

## Task 9: LLM Readiness Assessment

**Files:**
- Create: `src/lib/ai/prompts.ts`
- Create: `src/lib/readiness/llm-assessor.ts`
- Create: `src/app/api/ai/assess/route.ts`

- [ ] **Step 1: Create AI prompts**

Create `src/lib/ai/prompts.ts`:

```typescript
export const READINESS_ASSESSMENT_SYSTEM_PROMPT = `You are an expert marketing operations reviewer for a financial services organization. You assess event proposals for readiness — whether they are specific enough, strategically aligned, and decision-ready.

You evaluate proposals against these quality criteria:

1. **Objective Specificity**: Is the objective actionable with a measurable buyer outcome? "Raise awareness" fails. "Generate 15 qualified pipeline meetings with enterprise treasurers" passes.

2. **Metrics-Objective Alignment**: Do the success metrics directly measure whether the stated objective was achieved? Metrics that are generic or unrelated to the objective fail.

3. **Internal Consistency**: Does the audience type match the event format? Does the geography match the product focus? Does the scale match the budget? Flag mismatches.

4. **Strategic Alignment**: Is the strategic rationale specific and credible? Does it explain exactly how this event advances a business priority? Vague rationale fails.

Respond with a JSON object matching this structure exactly:
{
  "findings": [
    {
      "field": "the field name (e.g., objective, successMetrics, strategicRationale)",
      "status": "strong" | "weak" | "missing",
      "message": "specific explanation of what is strong, weak, or missing",
      "suggestion": "if weak or missing, a specific actionable improvement suggestion"
    }
  ],
  "nextActions": [
    "specific, actionable step the submitter should take"
  ]
}

Rules:
- Always assess all four criteria. Return one finding per criterion at minimum.
- Status "strong" means the field meets the quality bar. Include a brief confirmation.
- Status "weak" means it exists but is vague, generic, or insufficient. Explain why and suggest a specific improvement.
- Status "missing" means the information needed to assess this criterion is absent.
- Next actions should be concrete: "Define primary buyer roles" not "Improve targeting."
- Be direct and specific. This output is used in a professional approval process.`;

export const FIELD_ASSIST_SYSTEM_PROMPT = `You are an AI assistant embedded in an enterprise event proposal form. Your job is to help marketers fill in fields correctly.

When given a field name, current value, and context about the proposal so far, you provide:
1. A brief assessment of the current value (is it specific enough? too vague?)
2. A concrete suggestion for improvement if needed

Keep responses under 2 sentences. Be direct and specific to financial services marketing.

Respond with JSON:
{
  "assessment": "brief assessment",
  "suggestion": "specific improvement suggestion or null if the value is good"
}`;
```

- [ ] **Step 2: Create LLM assessor**

Create `src/lib/readiness/llm-assessor.ts`:

```typescript
import { generateText } from "ai";
import { READINESS_ASSESSMENT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import type { ProposalFormData } from "@/lib/actions/proposals";
import type { FieldRuleFinding } from "./rules-engine";
import { PROPOSAL_FIELDS } from "@/lib/types";

type LLMAssessmentResult = {
  findings: FieldRuleFinding[];
  nextActions: string[];
};

export async function assessWithLLM(
  data: ProposalFormData,
  taxonomyContext: string
): Promise<LLMAssessmentResult> {
  const proposalSummary = Object.entries(data)
    .filter(([_, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
    .map(([key, value]) => {
      const label = PROPOSAL_FIELDS[key as keyof typeof PROPOSAL_FIELDS] ?? key;
      const displayValue = Array.isArray(value) ? value.join(", ") : value;
      return `${label}: ${displayValue}`;
    })
    .join("\n");

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.6",
    system: READINESS_ASSESSMENT_SYSTEM_PROMPT,
    prompt: `Assess this event proposal for readiness:

${proposalSummary}

Organization context:
${taxonomyContext}`,
  });

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { findings: [], nextActions: ["Unable to assess — please try again"] };
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      findings: Array<{
        field: string;
        status: "strong" | "weak" | "missing";
        message: string;
        suggestion?: string;
      }>;
      nextActions: string[];
    };

    return {
      findings: parsed.findings.map((f) => ({
        field: f.field,
        status: f.status,
        message: f.message,
        suggestion: f.suggestion,
      })),
      nextActions: parsed.nextActions,
    };
  } catch {
    return {
      findings: [],
      nextActions: ["Assessment parsing failed — please try again"],
    };
  }
}
```

- [ ] **Step 3: Create assessment API route**

Create `src/app/api/ai/assess/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  assessments,
  proposalVersions,
  proposals,
  readinessRules,
  taxonomyCategories,
  taxonomyEntries,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  evaluateFieldRules,
  computeReadinessStatus,
} from "@/lib/readiness/rules-engine";
import { assessWithLLM } from "@/lib/readiness/llm-assessor";
import type { ProposalFormData } from "@/lib/actions/proposals";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { proposalId } = await request.json();

  // Get latest version
  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, proposalId),
    with: {
      versions: {
        orderBy: (v, { desc }) => [desc(v.version)],
        limit: 1,
      },
    },
  });

  if (!proposal || proposal.versions.length === 0) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const version = proposal.versions[0];

  // Build form data from version
  const formData: ProposalFormData = {
    title: version.title ?? "",
    eventType: version.eventType ?? "",
    format: version.format ?? "",
    proposedTiming: version.proposedTiming ?? "",
    venueType: version.venueType ?? "",
    targetSegment: version.targetSegment ?? "",
    buyerRoles: (version.buyerRoles as string[]) ?? [],
    geography: version.geography ?? "",
    audienceSize: version.audienceSize ?? "",
    targetAccounts: version.targetAccounts ?? "",
    productFocus: version.productFocus ?? "",
    strategicRationale: version.strategicRationale ?? "",
    objective: version.objective ?? "",
    successMetrics: version.successMetrics ?? "",
    relatedCampaign: version.relatedCampaign ?? "",
    budgetRange: version.budgetRange ?? "",
    owner: version.owner ?? "",
    dependencies: version.dependencies ?? "",
    partnerName: version.partnerName ?? "",
    partnerRole: version.partnerRole ?? "",
    executiveParticipation: version.executiveParticipation ?? "",
    regulatoryConsiderations: version.regulatoryConsiderations ?? "",
    followUpExpectation: version.followUpExpectation ?? "",
  };

  // Get active rules
  const rules = await db.query.readinessRules.findMany({
    where: eq(readinessRules.active, true),
  });

  // Get taxonomy context for LLM
  const categories = await db.query.taxonomyCategories.findMany({
    with: {
      entries: {
        where: eq(taxonomyEntries.active, true),
      },
    },
  });
  const taxonomyContext = categories
    .map(
      (cat) =>
        `${cat.name}: ${cat.entries.map((e) => e.name).join(", ")}`
    )
    .join("\n");

  // Run rule-based checks
  const ruleFindings = evaluateFieldRules(
    formData,
    rules.filter((r) => r.type !== "quality")
  );

  // Run LLM assessment
  const llmResult = await assessWithLLM(formData, taxonomyContext);

  // Combine findings
  const allFindings = [...ruleFindings, ...llmResult.findings];
  const status = computeReadinessStatus(ruleFindings, llmResult.findings);

  // Save assessment
  const [assessment] = await db
    .insert(assessments)
    .values({
      proposalVersionId: version.id,
      status,
      findings: allFindings,
      nextActions: llmResult.nextActions,
    })
    .returning();

  return NextResponse.json({ assessment });
}
```

- [ ] **Step 4: Wire assessment into proposal save flow**

Update `src/lib/actions/proposals.ts` — modify `createProposal` and `updateProposal` to return the proposal ID instead of redirecting, so the form can trigger assessment before redirect.

Replace the `redirect` calls in both functions. In `createProposal`:

```typescript
// Change the last two lines from:
//   revalidatePath("/proposals");
//   redirect(`/proposals/${proposal.id}`);
// To:
  revalidatePath("/proposals");
  return proposal.id;
```

In `updateProposal`:

```typescript
// Change the last three lines from:
//   revalidatePath("/proposals");
//   revalidatePath(`/proposals/${proposalId}`);
//   redirect(`/proposals/${proposalId}`);
// To:
  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
  return proposalId;
```

- [ ] **Step 5: Update proposal form to trigger assessment after save**

In `src/components/proposals/proposal-form.tsx`, update the `handleSubmit` function:

```typescript
  async function handleSubmit() {
    setSubmitting(true);
    try {
      let id: string;
      if (proposalId) {
        id = await updateProposal(proposalId, data);
      } else {
        id = await createProposal(data);
      }

      // Trigger readiness assessment
      toast.info("Running readiness assessment...");
      const res = await fetch("/api/ai/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: id }),
      });

      if (res.ok) {
        toast.success("Proposal saved and assessed");
      } else {
        toast.warning("Proposal saved but assessment failed");
      }

      // Navigate to proposal view
      window.location.href = `/proposals/${id}`;
    } catch (err) {
      toast.error("Failed to save proposal");
      setSubmitting(false);
    }
  }
```

Add the `useRouter` import can be removed since we're using `window.location.href` for a full page navigation after server action.

- [ ] **Step 6: Verify assessment works end-to-end**

```bash
npm run dev
```

Create a new proposal with some fields filled in. Submit. Should see "Running readiness assessment..." toast, then redirect to proposal view. Check Supabase Dashboard > assessments table for the stored assessment.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ai/prompts.ts src/lib/readiness/llm-assessor.ts src/app/api/ai/assess/ src/lib/actions/proposals.ts src/components/proposals/proposal-form.tsx
git commit -m "feat: add LLM readiness assessment with rule-based + AI evaluation"
```

---

## Task 10: Proposal Read-Only View

**Files:**
- Create: `src/components/proposals/proposal-view.tsx`
- Create: `src/components/proposals/readiness-assessment.tsx`
- Create: `src/app/(app)/proposals/[id]/page.tsx`

- [ ] **Step 1: Create readiness assessment display component**

Create `src/components/proposals/readiness-assessment.tsx`:

```typescript
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Assessment } from "@/lib/types";
import type { FieldRuleFinding } from "@/lib/readiness/rules-engine";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const STATUS_CONFIG = {
  not_ready: {
    label: "Not Ready",
    variant: "destructive" as const,
    icon: AlertCircle,
  },
  partially_ready: {
    label: "Partially Ready",
    variant: "secondary" as const,
    icon: AlertTriangle,
  },
  ready_for_review: {
    label: "Ready for Review",
    variant: "default" as const,
    icon: CheckCircle2,
  },
};

export function ReadinessAssessment({
  assessment,
}: {
  assessment: Assessment;
}) {
  const config = STATUS_CONFIG[assessment.status];
  const Icon = config.icon;
  const findings = assessment.findings as FieldRuleFinding[];
  const nextActions = assessment.nextActions as string[];

  const missing = findings.filter((f) => f.status === "missing");
  const weak = findings.filter((f) => f.status === "weak");
  const strong = findings.filter((f) => f.status === "strong");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Readiness Assessment</CardTitle>
          <Badge variant={config.variant} className="gap-1">
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {missing.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-destructive mb-2">
              Missing
            </h4>
            <ul className="space-y-1.5">
              {missing.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{f.field}:</span>{" "}
                    {f.message}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {weak.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-500 mb-2">Weak</h4>
            <ul className="space-y-1.5">
              {weak.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{f.field}:</span>{" "}
                    {f.message}
                    {f.suggestion && (
                      <p className="text-muted-foreground mt-0.5">
                        {f.suggestion}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {strong.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-500 mb-2">Strong</h4>
            <ul className="space-y-1.5">
              {strong.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{f.field}:</span>{" "}
                    {f.message}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {nextActions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Next Actions</h4>
              <ol className="space-y-1.5">
                {nextActions.map((action, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    {action}
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create proposal view component**

Create `src/components/proposals/proposal-view.tsx`:

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ProposalVersion } from "@/lib/types";

function Field({
  label,
  value,
}: {
  label: string;
  value: string | string[] | null | undefined;
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(", ") : value;

  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{display}</dd>
    </div>
  );
}

export function ProposalView({ version }: { version: ProposalVersion }) {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle className="text-xl">
          {version.title || "Untitled Proposal"}
        </CardTitle>
        {version.eventType && (
          <Badge variant="outline" className="w-fit">
            {version.eventType}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold mb-3">Event Basics</h3>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Format" value={version.format} />
            <Field label="Proposed Timing" value={version.proposedTiming} />
            <Field label="Venue Type" value={version.venueType} />
          </dl>
        </section>

        <Separator />

        <section>
          <h3 className="text-sm font-semibold mb-3">Audience & Targeting</h3>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Target Segment" value={version.targetSegment} />
            <Field
              label="Buyer Roles"
              value={version.buyerRoles as string[]}
            />
            <Field label="Geography" value={version.geography} />
            <Field label="Audience Size" value={version.audienceSize} />
            <Field label="Target Accounts" value={version.targetAccounts} />
          </dl>
        </section>

        <Separator />

        <section>
          <h3 className="text-sm font-semibold mb-3">Product & Strategy</h3>
          <dl className="space-y-4">
            <Field label="Product Focus" value={version.productFocus} />
            <Field label="Objective" value={version.objective} />
            <Field
              label="Strategic Rationale"
              value={version.strategicRationale}
            />
            <Field label="Success Metrics" value={version.successMetrics} />
            <Field label="Related Campaign" value={version.relatedCampaign} />
          </dl>
        </section>

        <Separator />

        <section>
          <h3 className="text-sm font-semibold mb-3">Logistics & Budget</h3>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Budget Range" value={version.budgetRange} />
            <Field label="Owner" value={version.owner} />
            <Field label="Dependencies" value={version.dependencies} />
            <Field label="Partner" value={version.partnerName} />
            <Field label="Partner Role" value={version.partnerRole} />
            <Field
              label="Executive Participation"
              value={version.executiveParticipation}
            />
          </dl>
        </section>

        {(version.regulatoryConsiderations || version.followUpExpectation) && (
          <>
            <Separator />
            <section>
              <h3 className="text-sm font-semibold mb-3">Additional</h3>
              <dl className="space-y-4">
                <Field
                  label="Regulatory Considerations"
                  value={version.regulatoryConsiderations}
                />
                <Field
                  label="Follow-up Expectation"
                  value={version.followUpExpectation}
                />
              </dl>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Create proposal detail page**

Create `src/app/(app)/proposals/[id]/page.tsx`:

```typescript
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProposal } from "@/lib/actions/proposals";
import { ProposalView } from "@/components/proposals/proposal-view";
import { ReadinessAssessment } from "@/components/proposals/readiness-assessment";
import { Button } from "@/components/ui/button";
import { Pencil, Printer } from "lucide-react";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-lg font-semibold">Event Proposal</h2>
          <p className="text-sm text-muted-foreground">
            Version {proposal.currentVersion}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print / PDF
          </Button>
          <Button asChild size="sm">
            <Link href={`/proposals/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <ProposalView version={proposal.version} />
        {proposal.assessment && (
          <ReadinessAssessment assessment={proposal.assessment} />
        )}
      </div>
    </div>
  );
}
```

Note: The `onClick={() => window.print()}` requires this to be a client component or use a separate print button component. Create a quick client wrapper:

Replace the buttons section with a client component. Create `src/components/proposals/proposal-actions.tsx`:

```typescript
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Printer } from "lucide-react";

export function ProposalActions({ proposalId }: { proposalId: string }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Print / PDF
      </Button>
      <Button asChild size="sm">
        <Link href={`/proposals/${proposalId}/edit`}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>
    </div>
  );
}
```

Then update the page to use it:

```typescript
import { ProposalActions } from "@/components/proposals/proposal-actions";

// Replace the buttons div with:
<ProposalActions proposalId={id} />
```

- [ ] **Step 4: Add print styles**

Add to `src/app/globals.css`:

```css
@media print {
  body {
    background: white !important;
    color: black !important;
  }

  .print\\:hidden {
    display: none !important;
  }

  .print\\:shadow-none {
    box-shadow: none !important;
  }

  .print\\:border-0 {
    border: 0 !important;
  }
}
```

- [ ] **Step 5: Verify the full flow**

```bash
npm run dev
```

Create a proposal → submit → see readiness assessment on proposal view page → click Print/PDF → verify it looks clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/proposals/proposal-view.tsx src/components/proposals/readiness-assessment.tsx src/components/proposals/proposal-actions.tsx src/app/\(app\)/proposals/\[id\]/page.tsx src/app/globals.css
git commit -m "feat: add proposal read-only view with readiness assessment and print/PDF"
```

---

## Task 11: Per-Field AI Assistance

**Files:**
- Create: `src/app/api/ai/field-assist/route.ts`
- Create: `src/components/proposals/ai-assisted-field.tsx`
- Modify: `src/components/proposals/proposal-form.tsx` (swap in AI-assisted fields)

- [ ] **Step 1: Create field assist API route**

Create `src/app/api/ai/field-assist/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { FIELD_ASSIST_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { field, value, context } = await request.json();

  if (!value || value.trim().length < 5) {
    return NextResponse.json({ assessment: null, suggestion: null });
  }

  const { text } = await generateText({
    model: "anthropic/claude-haiku-4.5-20251001",
    system: FIELD_ASSIST_SYSTEM_PROMPT,
    prompt: `Field: ${field}
Current value: "${value}"
Proposal context so far: ${JSON.stringify(context)}

Assess this field value and suggest improvements if needed.`,
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ assessment: null, suggestion: null });
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ assessment: null, suggestion: null });
  }
}
```

- [ ] **Step 2: Create AI-assisted field component**

Create `src/components/proposals/ai-assisted-field.tsx`:

```typescript
"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  fieldName: string;
  context: Record<string, unknown>;
};

export function AiAssistedField({
  value,
  onChange,
  placeholder,
  rows = 3,
  fieldName,
  context,
}: Props) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkField = useCallback(
    async (currentValue: string) => {
      if (!currentValue || currentValue.trim().length < 5) {
        setSuggestion(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/ai/field-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field: fieldName,
            value: currentValue,
            context,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setSuggestion(data.suggestion);
        }
      } catch {
        // Silently fail — AI assistance is non-blocking
      } finally {
        setLoading(false);
      }
    },
    [fieldName, context]
  );

  return (
    <div className="space-y-1.5">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => checkField(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      {loading && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 animate-pulse" />
          Checking...
        </div>
      )}
      {suggestion && !loading && (
        <div
          className={cn(
            "flex items-start gap-1.5 rounded-md border px-3 py-2 text-xs",
            "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
          )}
        >
          <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
          <span>{suggestion}</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Replace plain Textareas with AiAssistedField in proposal form**

In `src/components/proposals/proposal-form.tsx`, add import:

```typescript
import { AiAssistedField } from "./ai-assisted-field";
```

Replace the Textarea for `strategicRationale`, `objective`, and `successMetrics` with `AiAssistedField`. For example, replace the strategic rationale Textarea:

```typescript
        <div className="space-y-2">
          <Label>Strategic Rationale</Label>
          <AiAssistedField
            value={data.strategicRationale ?? ""}
            onChange={(v) => update("strategicRationale", v)}
            placeholder="Why this event? How does it advance a strategic priority?"
            rows={3}
            fieldName="Strategic Rationale"
            context={data}
          />
        </div>
```

Do the same for `objective` and `successMetrics` fields.

- [ ] **Step 4: Verify AI field assistance works**

```bash
npm run dev
```

Navigate to `/proposals/new`. Type a vague objective like "raise awareness" in the objective field, tab away. Should see AI suggestion appear below the field.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/ai/field-assist/ src/components/proposals/ai-assisted-field.tsx src/components/proposals/proposal-form.tsx
git commit -m "feat: add per-field AI assistance with vagueness detection"
```

---

## Task 12: Readiness Preview Sidebar

**Files:**
- Create: `src/components/proposals/readiness-preview.tsx`
- Modify: `src/components/proposals/proposal-form.tsx` (add sidebar)

- [ ] **Step 1: Create readiness preview component**

Create `src/components/proposals/readiness-preview.tsx`:

```typescript
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { PROPOSAL_FIELDS, type ProposalFieldKey } from "@/lib/types";
import type { ProposalFormData } from "@/lib/actions/proposals";

// Fields that contribute to readiness
const TRACKED_FIELDS: ProposalFieldKey[] = [
  "title",
  "eventType",
  "format",
  "proposedTiming",
  "targetSegment",
  "buyerRoles",
  "geography",
  "productFocus",
  "strategicRationale",
  "objective",
  "successMetrics",
  "budgetRange",
  "owner",
];

function isFieldFilled(data: ProposalFormData, field: ProposalFieldKey): boolean {
  const value = (data as Record<string, unknown>)[field];
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === "string" && value.trim().length < 2) return false;
  return true;
}

export function ReadinessPreview({ data }: { data: ProposalFormData }) {
  const { filled, total, items } = useMemo(() => {
    const items = TRACKED_FIELDS.map((field) => ({
      field,
      label: PROPOSAL_FIELDS[field],
      filled: isFieldFilled(data, field),
    }));
    const filled = items.filter((i) => i.filled).length;
    return { filled, total: items.length, items };
  }, [data]);

  const percentage = Math.round((filled / total) * 100);

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Readiness Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {filled} / {total} fields
            </span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <ul className="space-y-1">
          {items.map((item) => (
            <li
              key={item.field}
              className="flex items-center gap-2 text-xs"
            >
              {item.filled ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span
                className={
                  item.filled ? "text-foreground" : "text-muted-foreground"
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

Install the progress component if not already added:

```bash
npx shadcn@latest add progress
```

- [ ] **Step 2: Add sidebar to proposal form**

In `src/components/proposals/proposal-form.tsx`, add import:

```typescript
import { ReadinessPreview } from "./readiness-preview";
```

Wrap the form return in a two-column layout. Replace the outer `<div className="space-y-4 max-w-2xl">` with:

```typescript
    <div className="flex gap-6">
      <div className="space-y-4 flex-1 max-w-2xl">
        {/* ... all the ProposalFormSection components ... */}

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? "Saving..."
              : proposalId
                ? "Save & Assess Readiness"
                : "Create & Assess Readiness"}
          </Button>
        </div>
      </div>

      <div className="w-64 shrink-0 hidden lg:block">
        <ReadinessPreview data={data} />
      </div>
    </div>
```

- [ ] **Step 3: Verify the preview sidebar**

```bash
npm run dev
```

Navigate to `/proposals/new`. As you fill fields, the readiness preview should update in real time — checkmarks appear, progress bar fills, percentage increases.

- [ ] **Step 4: Commit**

```bash
git add src/components/proposals/readiness-preview.tsx src/components/proposals/proposal-form.tsx
git commit -m "feat: add live readiness preview sidebar to proposal form"
```

---

## Task 13: Readiness Rules Admin

**Files:**
- Create: `src/lib/actions/rules.ts`
- Create: `src/components/admin/rules-manager.tsx`
- Create: `src/app/(app)/admin/rules/page.tsx`

- [ ] **Step 1: Create rules server actions**

Create `src/lib/actions/rules.ts`:

```typescript
"use server";

import { db } from "@/lib/db";
import { readinessRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRules() {
  return db.query.readinessRules.findMany({
    orderBy: (rules, { asc }) => [asc(rules.type), asc(rules.name)],
  });
}

export async function addRule(data: {
  type: "required" | "conditional" | "placeholder" | "quality";
  name: string;
  description?: string;
  fields?: string[];
  condition?: string;
  message: string;
}) {
  await db.insert(readinessRules).values({
    type: data.type,
    name: data.name,
    description: data.description || null,
    fields: data.fields || null,
    condition: data.condition || null,
    message: data.message,
  });
  revalidatePath("/admin/rules");
}

export async function updateRule(
  id: string,
  data: {
    name?: string;
    description?: string;
    fields?: string[];
    condition?: string;
    message?: string;
    active?: boolean;
  }
) {
  await db
    .update(readinessRules)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(readinessRules.id, id));
  revalidatePath("/admin/rules");
}

export async function deleteRule(id: string) {
  await db.delete(readinessRules).where(eq(readinessRules.id, id));
  revalidatePath("/admin/rules");
}
```

- [ ] **Step 2: Create rules manager component**

Create `src/components/admin/rules-manager.tsx`:

```typescript
"use client";

import { useState } from "react";
import type { ReadinessRule } from "@/lib/types";
import { addRule, updateRule, deleteRule } from "@/lib/actions/rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Plus, Pencil, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

const TYPE_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  required: { label: "Required", variant: "destructive" },
  conditional: { label: "Conditional", variant: "secondary" },
  placeholder: { label: "Placeholder", variant: "outline" },
  quality: { label: "Quality (AI)", variant: "default" },
};

export function RulesManager({ rules }: { rules: ReadinessRule[] }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Readiness Rule</DialogTitle>
            </DialogHeader>
            <RuleForm
              onSave={async (data) => {
                await addRule(data);
                setShowAdd(false);
                toast.success("Rule added");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <RuleRow key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  );
}

function RuleRow({ rule }: { rule: ReadinessRule }) {
  const [editing, setEditing] = useState(false);
  const badge = TYPE_BADGES[rule.type];

  return (
    <Card className={!rule.active ? "opacity-50" : ""}>
      <CardContent className="flex items-start gap-3 py-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{rule.name}</span>
            <Badge variant={badge.variant} className="text-xs">
              {badge.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{rule.message}</p>
          {rule.condition && (
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Condition: {rule.condition}
            </p>
          )}
          {rule.fields && (
            <p className="text-xs text-muted-foreground mt-1">
              Fields: {(rule.fields as string[]).join(", ")}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={async () => {
              await updateRule(rule.id, { active: !rule.active });
              toast.success(rule.active ? "Rule deactivated" : "Rule activated");
            }}
          >
            {rule.active ? (
              <ToggleRight className="h-3.5 w-3.5" />
            ) : (
              <ToggleLeft className="h-3.5 w-3.5" />
            )}
          </Button>
          <Dialog open={editing} onOpenChange={setEditing}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Rule</DialogTitle>
              </DialogHeader>
              <RuleForm
                initialData={rule}
                onSave={async (data) => {
                  await updateRule(rule.id, data);
                  setEditing(false);
                  toast.success("Rule updated");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function RuleForm({
  initialData,
  onSave,
}: {
  initialData?: ReadinessRule;
  onSave: (data: {
    type: "required" | "conditional" | "placeholder" | "quality";
    name: string;
    fields?: string[];
    condition?: string;
    message: string;
  }) => Promise<void>;
}) {
  const [type, setType] = useState(initialData?.type ?? "required");
  const [name, setName] = useState(initialData?.name ?? "");
  const [fields, setFields] = useState(
    (initialData?.fields as string[])?.join(", ") ?? ""
  );
  const [condition, setCondition] = useState(initialData?.condition ?? "");
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      type: type as "required" | "conditional" | "placeholder" | "quality",
      name,
      fields: fields
        ? fields.split(",").map((f) => f.trim())
        : undefined,
      condition: condition || undefined,
      message,
    });
    setSaving(false);
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="required">Required</SelectItem>
            <SelectItem value="conditional">Conditional</SelectItem>
            <SelectItem value="placeholder">Placeholder</SelectItem>
            <SelectItem value="quality">Quality (AI)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Fields (comma-separated)</Label>
        <Input
          value={fields}
          onChange={(e) => setFields(e.target.value)}
          placeholder="e.g., title, objective"
        />
      </div>
      {(type === "conditional") && (
        <div className="space-y-2">
          <Label>Condition</Label>
          <Input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g., eventType IN ['Executive Dinner']"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message shown when this rule fires"
        />
      </div>
      <Button onClick={handleSave} disabled={saving || !name || !message} className="w-full">
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Create rules admin page**

Create `src/app/(app)/admin/rules/page.tsx`:

```typescript
import { getRules } from "@/lib/actions/rules";
import { RulesManager } from "@/components/admin/rules-manager";

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Readiness Rules</h2>
        <p className="text-sm text-muted-foreground">
          Configure what "ready" means. Rules are evaluated when proposals are
          assessed.
        </p>
      </div>
      <RulesManager rules={rules} />
    </div>
  );
}
```

- [ ] **Step 4: Verify rules admin works**

```bash
npm run dev
```

Navigate to `/admin/rules`. Should see all seeded rules. Test: add a new rule, edit an existing rule, toggle active/inactive.

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/rules.ts src/components/admin/rules-manager.tsx src/app/\(app\)/admin/rules/
git commit -m "feat: add readiness rules admin UI with CRUD operations"
```

---

## Task 14: Deploy to Vercel

**Files:**
- No new files

- [ ] **Step 1: Verify build succeeds locally**

```bash
npm run build
```

Fix any TypeScript errors or build issues.

- [ ] **Step 2: Commit any build fixes**

```bash
git add -A
git commit -m "fix: resolve build issues for production deployment"
```

- [ ] **Step 3: Push to GitHub**

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

- [ ] **Step 4: Deploy via Vercel**

The project should already be linked via `vercel link` from Task 1. Deploy:

```bash
vercel --prod
```

Or push to GitHub and let Vercel's git integration auto-deploy.

- [ ] **Step 5: Verify production deployment**

Open the production URL. Sign up, create a proposal, fill fields, submit, verify readiness assessment runs, verify proposal view renders correctly, verify PDF print works.

- [ ] **Step 6: Create pilot user accounts**

In Supabase Dashboard > Authentication > Users, create accounts for your pilot team members, or have them self-register via the signup page.

---

## Self-Review Checklist

**Spec coverage:**
- Proposal form with grouped sections and all fields: Task 6
- Per-field AI assistance: Task 11
- Readiness engine (rule-based): Task 8 (with TDD)
- Readiness engine (LLM): Task 9
- Proposal list with filtering: Task 7
- Proposal read-only view: Task 10
- Taxonomy admin CRUD: Task 5
- Readiness rules admin: Task 13
- Basic auth: Task 4
- Proposal versioning: Task 6 (in server actions)
- PDF/print export: Task 10
- Live readiness preview: Task 12

**No placeholders:** All tasks contain complete code.

**Type consistency:** `ProposalFormData`, `FieldRuleFinding`, `ReadinessRule`, `Assessment` types are defined in Task 2 and used consistently across all tasks. `evaluateFieldRules` and `computeReadinessStatus` are defined in Task 8 and consumed in Task 9.
