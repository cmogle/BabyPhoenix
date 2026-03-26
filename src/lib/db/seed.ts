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
  { type: "required" as const, name: "Event title required", fields: ["title"], condition: null, message: "Event title is required" },
  { type: "required" as const, name: "Event type required", fields: ["eventType"], condition: null, message: "Event type is required" },
  { type: "required" as const, name: "Objective required", fields: ["objective"], condition: null, message: "Objective is required" },
  { type: "required" as const, name: "Target segment required", fields: ["targetSegment"], condition: null, message: "Target segment is required" },
  { type: "required" as const, name: "Geography required", fields: ["geography"], condition: null, message: "Geography / market is required" },
  { type: "required" as const, name: "Proposed timing required", fields: ["proposedTiming"], condition: null, message: "Proposed timing is required" },
  { type: "required" as const, name: "Product focus required", fields: ["productFocus"], condition: null, message: "Product / solution focus is required" },
  { type: "required" as const, name: "Owner required", fields: ["owner"], condition: null, message: "Proposal owner is required" },
  { type: "conditional" as const, name: "Buyer roles for executive events", fields: ["buyerRoles"], condition: "eventType IN ['Executive Dinner', 'Client Roundtable', 'Thought Leadership Panel']", message: "Buyer roles are required for executive-format events" },
  { type: "conditional" as const, name: "Budget for large events", fields: ["budgetRange"], condition: "audienceSize > 100", message: "Budget range is required for events with 100+ attendees" },
  { type: "conditional" as const, name: "Partner role when partner named", fields: ["partnerRole"], condition: "partnerName IS NOT EMPTY", message: "Partner role must be specified — co-host, sponsor, or attendee source" },
  { type: "placeholder" as const, name: "Placeholder detection", fields: null, condition: null, message: "'{field}' contains a placeholder — replace with a specific value" },
  { type: "quality" as const, name: "Objective specificity", fields: ["objective"], condition: null, message: "Objective must specify a measurable buyer outcome, not a generic goal like 'raise awareness' or 'drive engagement'" },
  { type: "quality" as const, name: "Metrics-objective alignment", fields: ["successMetrics", "objective"], condition: null, message: "Success metrics must directly measure whether the stated objective was achieved" },
  { type: "quality" as const, name: "Internal consistency", fields: null, condition: null, message: "Check coherence between audience type, event format, scale, budget, and geography" },
  { type: "quality" as const, name: "Strategic alignment", fields: ["strategicRationale"], condition: null, message: "Strategic rationale must be specific and credible — explain exactly how this event advances the stated priority" },
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
