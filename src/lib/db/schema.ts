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
import { relations } from "drizzle-orm";

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
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
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
  userId: uuid("user_id").notNull(),
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
  title: text("title"),
  eventType: text("event_type"),
  format: text("format"),
  proposedTiming: text("proposed_timing"),
  venueType: text("venue_type"),
  targetSegment: text("target_segment"),
  buyerRoles: jsonb("buyer_roles").$type<string[]>(),
  geography: text("geography"),
  audienceSize: text("audience_size"),
  targetAccounts: text("target_accounts"),
  productFocus: text("product_focus"),
  strategicRationale: text("strategic_rationale"),
  objective: text("objective"),
  successMetrics: text("success_metrics"),
  relatedCampaign: text("related_campaign"),
  budgetRange: text("budget_range"),
  owner: text("owner"),
  dependencies: text("dependencies"),
  partnerName: text("partner_name"),
  partnerRole: text("partner_role"),
  executiveParticipation: text("executive_participation"),
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
  fields: jsonb("fields").$type<string[]>(),
  condition: text("condition"),
  message: text("message").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
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
