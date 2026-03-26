# Event Proposal Readiness Engine — MVP Design Spec

## Context

BabyPhoenix is an AI-assisted workflow that converts vague or inconsistent enterprise event proposals into standardized, approval-ready artifacts with readiness diagnostics. The CMO of the pilot organization is building it for their own team first, with plans to monetize externally.

This spec defines the day-one MVP: a live pilot tool for 4-10 users (marketers and reviewers) at a single financial services organization, shipping within days.

---

## Core Flow

The user experience is a single linear flow with three moments:

### 1. Create Proposal (Guided Form)

A structured form with AI-assisted fields. Fields are grouped into collapsible sections. The form enforces nothing on submission — the readiness engine's job is to diagnose gaps, not block submission.

Each field has contextual AI assistance:
- Taxonomy-aware dropdowns with search/suggestions
- Inline vagueness nudges for free-text fields ("This objective is broad — consider specifying which buyer outcome you're targeting")
- Contextual auto-population (selecting an event type suggests sensible defaults for related fields)

A persistent readiness preview updates as fields are filled, showing gaps closing in real time.

### 2. Readiness Assessment (On Submission)

Two layers run in sequence:

**Rule-based checks (deterministic, instant):**
- Required field validation (some conditional by event type)
- Taxonomy compliance
- Conditional requirements (e.g., partner named but role unspecified)
- Placeholder detection (TBD, TBC, "various")

**LLM-based assessment (~2-3 seconds):**
- Objective specificity
- Metrics-to-objective alignment
- Internal consistency across fields
- Strategic alignment credibility

Output: readiness status, per-field findings, actionable improvement suggestions.

### 3. Proposal Output (Exportable Artifact)

A clean, structured, one-page-style view of the completed proposal with the readiness assessment embedded. Professional enough to forward to a VP. Printable / PDF-exportable.

The user can iterate: fix flagged issues, re-submit, get updated assessment.

---

## Data Model (Conceptual)

### Proposal

The atomic unit. One proposal = one event. Contains all structured fields. Each submission creates a version (immutable history). Has a readiness status that updates on each assessment.

**Required core fields:**
- Event title
- Event type (from taxonomy)
- Format
- Objective (free text, AI-assessed for specificity)
- Target segment (from taxonomy)
- Target buyer roles (from taxonomy)
- Product / solution focus (from taxonomy)
- Geography / market (from taxonomy)
- Proposed timing
- Audience size / scale
- Strategic rationale (free text, AI-assessed)
- Success metrics (free text, AI-assessed for alignment to objective)
- Estimated budget range
- Owner
- Dependencies / required approvals

**Optional fields:**
- Partner involved (name + role: co-host, sponsor, attendee source)
- Target accounts
- Related campaign / program
- Regulatory or compliance considerations
- Executive participation
- Venue type
- Follow-up / conversion expectation

### Taxonomy Pack

Controlled vocabularies that power form fields and AI context. Stored in the database, managed through admin UI.

| Vocabulary | Purpose |
|---|---|
| Event Types | Controlled list of event formats |
| Products / Solutions | Organization's product portfolio |
| Geographies | Markets the organization operates in |
| Customer Segments | Target audience categories |
| Buyer Roles | Decision-makers and influencers |
| Strategic Priorities | Current business objectives |
| Success Metric Types | Measurement categories for event outcomes |

Each entry: name, optional description, active/inactive flag. Flat lists (no hierarchy for day one).

The taxonomy is swappable per tenant — day one is hardcoded to one org, but the architecture treats it as configuration, not code.

### Readiness Rules

Configuration that defines what "ready" means. Two flavors:

**Field rules (deterministic):**
- Required-field rules (global and per-event-type)
- Conditional rules (if X then Y is required)
- Placeholder detection patterns

**Quality rules (LLM-assessed):**
- Natural language criteria (e.g., "Objective must specify a measurable buyer outcome")
- Expressed as evaluation prompts the LLM applies to the proposal

Managed through admin UI alongside taxonomy.

### Assessment

Output of readiness evaluation. Contains:
- Overall status: Not Ready / Partially Ready / Ready for Review
- Per-field findings: missing, weak, or valid — each with specific explanation
- Suggested next actions
- Timestamp

Stored alongside the proposal version. Machine-readable for downstream AI consumption.

---

## AI Layer

Three distinct responsibilities:

### Job 1: Per-Field Assistance (Inline, Real-Time)

- **Taxonomy suggestions:** Match user input against vocabulary entries
- **Vagueness nudges:** Detect when free-text fields are too broad and suggest specificity
- **Contextual defaults:** Pre-populate related fields based on selections (e.g., event type suggests audience size range)

Mix of rule-based (taxonomy matching) and lightweight LLM calls (vagueness detection, contextual suggestions).

### Job 2: Readiness Assessment (On Submission)

The LLM receives the full proposal, taxonomy pack, and quality criteria. Returns structured findings per criterion with status (strong / weak / missing) and actionable explanation.

Evaluates: objective specificity, metrics-objective alignment, internal consistency, strategic alignment.

### Job 3: Proposal Polish (Borderline — Include If Free)

Light formatting pass on the canonical output for consistent language and professional phrasing. Does not change substance. Deferred if it adds complexity.

---

## User Interface

### Surface 1: Proposal List (Home)

Table/list view of all proposals. Columns: title, event type, region, readiness status, last modified, owner.

Filterable by: readiness status, event type, region, strategic priority.
Sortable by any column.

This surface is designed to evolve into a strategic alignment view — the data model makes strategic priority a first-class queryable dimension so the list can answer "is our event portfolio serving our business strategy?"

### Surface 2: Proposal Form (Create / Edit)

Grouped into collapsible sections:
- **Event Basics** — title, event type, format, proposed timing, venue type
- **Audience & Targeting** — target segment, buyer roles, geography/market, audience size, target accounts
- **Product & Strategy** — product/solution focus, strategic rationale, objective, success metrics, related campaign
- **Logistics & Budget** — estimated budget range, owner, dependencies/approvals, partner involvement, executive participation
- **Optional Fields** — regulatory considerations, follow-up/conversion expectations

Persistent readiness preview sidebar/panel with live gap indicator.

### Surface 3: Proposal View (Read-Only Output)

The canonical artifact. Clean, structured, professional. Includes the readiness assessment inline. Printable / PDF-exportable.

This is the document that gets forwarded, shared, and consumed by downstream AI processes.

### Surface 4: Taxonomy Admin

Per-vocabulary CRUD interface. View list, add entry, edit entry, mark inactive. Shows which entries are actively used in proposals. Versioned — changes don't retroactively alter existing proposals.

### Surface 5: Readiness Rules Admin

View, add, edit rules. Each rule has: type (required-field, conditional, quality-check), applicable fields, condition/criteria, failure message.

---

## Readiness Engine Detail

### Rule-Based Layer (Instant)

Example rules:

| Rule Type | Condition | Message |
|---|---|---|
| Required | Event type is empty | "Event type is required" |
| Required (conditional) | Event type is "Executive Dinner" AND buyer roles is empty | "Buyer roles are required for executive dinners" |
| Required (conditional) | Audience size > 100 AND budget range is empty | "Budget range is required for events with 100+ attendees" |
| Required (conditional) | Timing is within 6 weeks AND dependencies is empty | "Dependencies and required approvals must be specified for events within 6 weeks" |
| Conditional | Partner name is provided AND partner role is empty | "Partner role must be specified — co-host, sponsor, or attendee source" |
| Placeholder | Any field contains "TBD", "TBC", "to be confirmed", "various", "multiple" | "'{field}' contains a placeholder — replace with a specific value" |

### LLM-Based Layer (~2-3 Seconds)

The LLM evaluates these quality criteria:

1. **Objective specificity:** Is it actionable with a measurable buyer outcome, or a platitude?
2. **Metrics-objective alignment:** Do success metrics actually measure whether the objective was achieved?
3. **Internal consistency:** Audience vs. event type vs. budget vs. geography coherence
4. **Strategic alignment:** Is the rationale specific and credible, or hand-waving?

Each criterion returns: status (strong / weak / missing), explanation, and improvement suggestion.

### Combined Output Format

```
Readiness Status: [Not Ready | Partially Ready | Ready for Review]

Missing:
- [field]: [reason]

Weak:
- [field]: [explanation + specific guidance]

Strong:
- [field]: [confirmation of quality]

Next Actions:
1. [Specific, actionable step]
2. [Specific, actionable step]
```

---

## Canonical Output as Downstream Feed

The structured proposal + assessment is the source record for downstream AI-generated activities (campaign planning, execution briefs, content generation). This means:

- The data model must be stable and well-structured — field names and semantics are a contract
- Proposals must be queryable by any field (event type, region, strategic priority, readiness status, timing)
- The output must be machine-readable, not just human-readable
- Downstream processes should be able to query: "all Ready proposals for Q3 APAC targeting enterprise treasurers"

---

## Day One Scope

### In — Must Ship

- Proposal form with all required/optional fields, grouped sections, collapsible
- Per-field AI assistance (taxonomy suggestions, vagueness nudges, contextual defaults)
- Readiness engine (rule-based + LLM layers)
- Proposal list view with filtering/sorting
- Proposal read-only view (canonical artifact)
- Taxonomy admin UI (CRUD per vocabulary)
- Readiness rules admin UI (view, add, edit)
- Basic auth (email/password or magic link)
- Proposal versioning (each submission = new version)
- PDF/print-friendly export

### Out — Explicitly Deferred

- Freeform paste input mode
- Conversational wizard input
- Multi-tenancy / org switching
- SSO / SAML
- Portfolio analytics dashboards / charts
- CRM or MAP integration
- Approval workflow (status changes, sign-offs, routing)
- Notifications / email alerts
- Commenting on proposals
- Role-based access control beyond basic auth
- Multilingual support
- Proposal templates (pre-filled starting points)
- Audit trail UI

### Borderline — Include If It Doesn't Slow Us Down

- AI-generated proposal polish (Job 3)
- Export to structured formats beyond PDF (JSON, CSV)
- Duplicate proposal action

---

## Design Principles

1. **The proposal is the atomic unit.** Everything revolves around creating, assessing, and refining proposals.
2. **Structure over chat.** The value is in the structured output and readiness logic, not in the input method.
3. **AI assists, doesn't replace.** Users control every field. AI suggests, nudges, and diagnoses — it doesn't auto-generate proposals.
4. **Configuration over code.** Taxonomy and readiness rules are data, not hardcoded logic. Swappable per tenant when multi-tenancy arrives.
5. **The output is a contract.** The canonical proposal is machine-readable and semantically stable because downstream processes depend on it.
6. **Strategic alignment is first-class.** Every proposal maps to business strategic priorities. The list view is designed to evolve into a strategic portfolio view.
7. **Readiness is diagnosis, not judgment.** No single composite score. Specific, actionable findings that tell you exactly what to fix.
