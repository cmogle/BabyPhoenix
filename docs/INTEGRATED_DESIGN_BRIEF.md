# Baby Phoenix — Integrated Product & Design Brief

> Synthesized from 6 parallel research teams: Competitive Intelligence, UX Excellence, Motion Design, Data Visualization, AI Co-creation UX, and GTM Strategy.

---

## Market Position (Confirmed)

**No direct competitor exists.** After researching 22+ competitors across 7 categories, Baby Phoenix occupies genuine whitespace at the intersection of:
1. AI extraction from unstructured input
2. Readiness assessment against configurable rules
3. Event-specific, governance-compliant structured output

Closest threats: Adobe Workfront (AI brief generation), Aprimo (Intelligent Content Brief), Briefly (creative brief auto-vetting). None combine all three capabilities. The real competitor is the status quo: PowerPoint + Word + Excel + email.

---

## Design System Foundations

### Color System
- **Base:** Zinc/neutral palette (shadcn/ui default, dark-first)
- **Status colors (colorblind-safe):**
  - Strong: Teal 500/400 (`#14b8a6` / `#2dd4bf`) — NOT green (deuteranopia safe)
  - Weak: Amber 500/400 (`#f59e0b` / `#fbbf24`)
  - Missing: Rose 500/400 (`#f43f5e` / `#fb7185`)
  - Neutral: Slate 300/600
- Always pair color with icon + text label (WCAG SC 1.4.1)

### Motion Tokens
| Token | Value | Usage |
|---|---|---|
| `--motion-instant` | 100ms | Hover, color, opacity |
| `--motion-fast` | 150ms | Buttons, focus, tooltips |
| `--motion-normal` | 250ms | Dropdowns, accordions, tabs |
| `--motion-moderate` | 350ms | Page elements, card expansions |
| `--motion-slow` | 500ms | Route transitions, modals |
| `--motion-expressive` | 700ms | Assessment reveals, scores |

### Easing
- Productive: `cubic-bezier(0.2, 0, 0.38, 0.9)` — functional UI
- Expressive: `cubic-bezier(0.4, 0.14, 0.3, 1)` — emotional moments
- Entrance: `cubic-bezier(0, 0, 0.38, 0.9)` — elements entering
- Exit: `cubic-bezier(0.2, 0, 1, 0.9)` — elements leaving

### Typography
- Interface: Geist Sans
- Code/metrics: Geist Mono
- Dark mode: bump weight by one step for body text

---

## Component Enhancement Specifications

### 1. Readiness Preview (sidebar) — HIGHEST PRIORITY
**Current:** Binary filled/empty checklist with percentage progress bar.
**Target:** Three-state (strong/weak/missing) with grouped sections matching the form.

- Replace green checkmarks with teal `CheckCircle2` (strong), amber `AlertTriangle` (weak), gray `Circle` (missing)
- Group items by form section with mini completion indicators
- Replace percentage with categorical status: "Not Ready / Partially Ready / Ready for Review"
- Add segmented status bar (teal/amber/rose segments instead of single progress bar)
- Items clickable to scroll to the relevant form field
- Live updates on field blur (not keystroke)

### 2. Proposal Form — HIGH PRIORITY
**Enhancements:**
- Section completion badges on collapsible headers (e.g., "3/5" or checkmark)
- Auto-save on blur with status indicator ("Saving..." → "Saved just now")
- Keep explicit "Save Draft" button for psychological safety
- Contextual placeholders with realistic examples (already good, keep these)
- Smooth height animation on collapsible sections (`grid-template-rows: 0fr → 1fr`)

### 3. AI-Assisted Field — HIGH PRIORITY
**Current:** Basic vagueness nudge on blur.
**Enhancements:**
- Three-tier feedback: Strong (teal check), Needs Depth (amber nudge), Missing (gray placeholder)
- Dismissable nudges with "x" button
- AI thinking indicator: three-dot pulse animation instead of generic "Checking..."
- Coaching tone: "Consider specifying..." not "Field is too vague"

### 4. Readiness Assessment — HIGH PRIORITY
**Current:** Good three-category display (missing/weak/strong).
**Enhancements:**
- Update colors: green → teal, red → rose (colorblind-safe)
- Add expandable "Why?" explanations on each finding
- Add "[Rule: X]" source attribution link showing which rule triggered
- Add "click to fix" navigation — clicking a finding scrolls to the field in edit mode
- Coaching tone throughout: "Adding a specific buyer outcome would strengthen this" not "Objective too vague"
- Dimensional summary bars at top (one per assessment dimension)

### 5. Proposal List — HIGH PRIORITY
**Current:** Basic table with status badges.
**Enhancements:**
- Update status badges to use semantic status colors (teal/amber/rose)
- Add hover state (subtle background highlight)
- Replace `<select>` filter with shadcn Select component + active filter pills
- Add row actions on hover (View, Edit, Duplicate)
- Add keyboard shortcut hint (press `/` to search)
- Better empty state with illustration-style icon and prominent CTA

### 6. Proposal View — MEDIUM PRIORITY
**Current:** Single-column card layout.
**Enhancements:**
- Two-column layout: 65% content, 35% readiness assessment
- Branded header with readiness status badge, date, owner
- Print CSS (`@media print`) for professional output
- Inline status indicators next to each assessed field (small teal/amber/rose dots)

### 7. Sidebar & Navigation — MEDIUM PRIORITY
**Enhancements:**
- Add product wordmark/logo area
- Active nav indicator with left accent bar (not just background)
- Keyboard shortcut labels next to nav items
- Add Cmd+K command palette trigger at bottom

### 8. Command Palette (NEW) — MEDIUM PRIORITY
- Global `Cmd+K` using existing shadcn `Command` component
- Actions: navigate to proposals, create new, search by title, switch admin views
- Keyboard-first for enterprise power users

---

## AI Sherpa Interaction Model

### Design Principles
1. **Prove value before showing AI** — first visit shows only basic form + taxonomy dropdowns
2. **Human always in control** — every AI suggestion dismissable with one click
3. **Domain knowledge is the differentiator** — suggestions draw from taxonomy, not generic AI
4. **Explain, don't assert** — every AI finding has a "why" one click away
5. **Readiness is diagnosis, not judgment** — specific findings, not scores
6. **Silence is golden** — AI invisible when fields are strong
7. **Design for failure** — one-click revert, diff views for AI suggestions

### Interaction Patterns (Priority Order)
1. Real-time readiness preview (living sidebar)
2. Inline vagueness nudges (on blur, dismissable)
3. Taxonomy ghost text / smart autocomplete
4. Anticipatory auto-population chains (event type → smart defaults)
5. Sherpa side panel (contextual guidance per field)

---

## Data Visualization Approach

### Individual Proposal
- Segmented dimensional bars (Completeness, Strategic Clarity, Measurability, Governance)
- Field-level diagnostic cards grouped by status
- Tri-state readiness badge (Not Ready / Partially Ready / Ready for Review)

### Portfolio
- Enriched status grid (the list IS the primary viz)
- Bubble chart for strategic priority vs. readiness (post-MVP)
- Timeline swim-lane for temporal planning (post-MVP)

### Libraries
- **Tier 1:** shadcn/ui Charts (Recharts v3) — for bar charts, sparklines
- **Tier 2:** Nivo — for heatmaps, Sankey, radar (when needed)

---

## Implementation Phases

### Phase 1: Foundation (Now)
- Design system tokens (colors, motion, easing) in globals.css
- Readiness preview → three-state with section grouping
- Form sections → completion badges
- Assessment → colorblind-safe palette + coaching tone
- Proposal list → semantic badges + better filters
- Command palette (Cmd+K)

### Phase 2: AI Enhancement
- AI loading states (thinking indicator, streaming reveal)
- Readiness preview → live gap tracking with AI assessment on blur
- Proposal view → two-column + print CSS
- Dimensional assessment bars

### Phase 3: Portfolio Intelligence
- Strategic alignment matrix
- Comparison views
- Version timeline / progress tracking

### Phase 4: Advanced Sherpa
- Sherpa side panel (contextual + conversational)
- Paste-and-extract mode
- Anticipatory auto-population chains
