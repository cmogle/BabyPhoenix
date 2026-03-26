
---

## Brief Builder — Business Analysis

### The Core Thesis

Marketing in large enterprises is operationally broken in a specific, expensive way: the gap between strategic intent and executable plan is bridged by unstructured documents that nobody scores, nobody governs, and nobody can roll up into a portfolio view. Brief Builder bets that this gap is wide enough — and painful enough in regulated industries — to support a vertical SaaS product.

The insight is that marketing plans are not creative artefacts. They are **operational commitments** — promises to spend budget against objectives, in specific geographies, for specific products, targeting specific buyer segments. Today those commitments live in slide decks and spreadsheets with no shared language, no validation, and no traceability. The result is that marketing leadership cannot answer basic questions: "Are our Q3 plans aligned to our strategic priorities?" "How many plans target the APAC wealth segment?" "Which plans are execution-ready versus aspirational?"

Brief Builder proposes that the right unit of work is the **brief** — a structured, scored, governable document that captures the full chain from strategic intent to planned activity. The product makes briefs the atomic unit of marketing operations the way tickets are the atomic unit of engineering operations.

### Why AI Is Structural, Not Cosmetic

The conversational AI (the "Sherpa") is not a chatbot bolted onto a form. It is the product's primary input mechanism and its key defensibility layer. The Sherpa does three things that a traditional form cannot:

1. **It meets users where they are.** A regional marketer in Singapore knows what they want to do ("launch event for enterprise clients, Q3, payments product") but not how to express it in governance-compliant taxonomy. The Sherpa translates natural language intent into structured fields without requiring the user to learn a schema.

2. **It enforces completeness without friction.** A blank template invites half-completion. A conversation that asks "which buyer roles are you targeting?" and refuses to move on until the answer is specific produces briefs that are scorable. The guided flow is a compliance mechanism disguised as a helpful assistant.

3. **It encodes domain knowledge.** The Sherpa knows the company's product lines, customer segments, geographies, and event types. This domain context is what makes the output useful rather than generic. It is also the product's moat: configuring a new Sherpa instance for a new customer is a meaningful setup cost that creates switching friction.

The scoring engine reinforces this. Scores are explainable ("this brief scores low on Strategic Alignment because no success metrics map to the stated objective") and produce a tier (Needs Work / Developing / Strong / Exceptional). This transforms marketing planning from a subjective review process into a measurable one — which is what operations leaders and CFOs have been asking for.

### Market Positioning

**Vertical:** Enterprise B2B marketing operations in financial services (banking, payments, insurance, wealth management, fintech infrastructure).

**Why financial services:** Three structural reasons make this vertical unusually receptive:

- **Regulatory culture.** Financial services firms are accustomed to governance, audit trails, and structured approval flows. A product that imposes structure on marketing planning fits their operational DNA in a way it would not fit, say, a consumer tech company.
- **Geographic complexity.** Global banks run marketing across dozens of markets with local regulatory requirements, languages, and buyer profiles. The pain of inconsistent planning language compounds with geographic scale.
- **Budget scrutiny.** Post-2022 cost discipline in financial services means marketing budgets face CFO-level review. Scored, structured briefs that demonstrate strategic alignment are a procurement advantage, not a bureaucratic burden.

**Competitive landscape:** The product does not name direct competitors, which suggests the real competitor is the status quo (PowerPoint + Excel + email). Adjacent categories include Marketing Resource Management (MRM) tools like Allocadia/Brandmaker, but these focus on budget allocation and asset management, not plan quality and strategic alignment. Brief Builder occupies a gap: upstream of MRM (plan creation and validation) and downstream of strategy (translating objectives into executable plans).

### Business Model Economics

The tiering is designed around a clear cost structure:

- **Free tier** uses heuristic (rule-based) scoring — zero marginal cost per brief. This is the acquisition funnel. A marketer can create a brief, see a score, and understand the value proposition without the company spending anything on LLM inference.
- **Pro tier** uses LLM scoring (Claude) at roughly $1-2 per fully-scored brief. At $500+/month per seat, a user creating even 10 briefs/month is generating 95%+ gross margin. The unit economics are strong because the value delivered (a scored, governance-ready marketing plan) is high relative to the inference cost.
- **Enterprise tier** is where the real revenue sits: configurable taxonomy, SSO, approval workflows, and portfolio dashboards. This is the layer that sells to CMOs and Heads of Marketing Operations, not individual marketers.

The go-to-market motion is enterprise sales, not product-led growth. The waitlist explicitly targets "marketing leaders" for discovery interviews. The product roadmap phases toward "Pilot-Ready" and "Closeable Demo" — language that signals founder-led sales into a small number of design partners, not viral adoption.

### What Has to Be True

For Brief Builder to work as a business, several assumptions must hold:

1. **The taxonomy problem is real and unsolved.** If enterprises already have consistent planning language enforced through existing tools, the governance value proposition collapses. The bet is that they don't — that most enterprises' marketing taxonomy lives in tribal knowledge and inconsistently-applied style guides.

2. **Scoring changes behaviour.** If marketers treat scores the way students treat grades they disagree with (ignore them, game them, or resent them), the product becomes shelfware. The scores must be perceived as fair, useful, and actionable — which is why explainability is a first-class feature, not an afterthought.

3. **Domain configurability is achievable at reasonable cost.** The current Sherpa is hardcoded to one company's domain context. Making this configurable per tenant — so that each customer's Sherpa knows *their* products, segments, geographies, and event types — is the critical unlock. If this requires weeks of professional services per customer, the business doesn't scale. If it can be reduced to a self-serve taxonomy upload, it does.

4. **The buyer exists at the right altitude.** The product needs a buyer who cares about both marketing effectiveness (CMO concern) and operational governance (COO/CFO concern). In financial services, this buyer is often the Head of Marketing Operations or the Regional Marketing Director. If this role doesn't have budget authority or tool-selection power, the sale stalls.

### Expansion Vectors

If the core thesis holds in financial services, the product has natural expansion paths:

- **Adjacent verticals** with similar governance needs: insurance, pharmaceuticals, enterprise technology, government/public sector. Each vertical needs its own taxonomy pack but the platform is the same.
- **Portfolio analytics** — once enough briefs exist in a tenant, the aggregate data becomes valuable: "What percentage of our marketing plans target the SME segment?" "Which region produces the highest-scoring briefs?" This is the dashboard that CMOs buy.
- **Integration into the marketing stack** — CRM systems (Salesforce, HubSpot), marketing automation platforms, and digital asset management tools all need upstream plan data. Brief Builder becomes the "plan of record" that feeds downstream execution systems.
- **White-label / embedded** — selling through existing platforms (Salesforce AppExchange, HubSpot Marketplace) as an embedded planning module rather than a standalone tool.

### Summary Assessment

Brief Builder is a vertical SaaS play that bets on a specific, well-observed pain point: enterprise marketing plans are unstructured, unscored, and ungoverned. The product uses conversational AI not as a feature but as a structural input mechanism that enforces completeness and encodes domain knowledge. The market entry point (financial services) is well-chosen for regulatory and operational culture fit. The unit economics are favourable at Pro/Enterprise pricing. The critical path to viability runs through one capability: making the domain context configurable per tenant, which transforms the product from a single-customer demo into a deployable platform.