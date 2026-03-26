import type {
  proposals,
  proposalVersions,
  assessments,
  taxonomyCategories,
  taxonomyEntries,
  readinessRules,
} from "./db/schema";

export type Proposal = typeof proposals.$inferSelect;
export type ProposalVersion = typeof proposalVersions.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type TaxonomyCategory = typeof taxonomyCategories.$inferSelect;
export type TaxonomyEntry = typeof taxonomyEntries.$inferSelect;
export type ReadinessRule = typeof readinessRules.$inferSelect;

export type NewProposal = typeof proposals.$inferInsert;
export type NewProposalVersion = typeof proposalVersions.$inferInsert;
export type NewAssessment = typeof assessments.$inferInsert;
export type NewTaxonomyEntry = typeof taxonomyEntries.$inferInsert;
export type NewReadinessRule = typeof readinessRules.$inferInsert;

export type Finding = {
  field: string;
  status: "missing" | "weak" | "strong";
  message: string;
  suggestion?: string;
};

export type ReadinessStatus = "not_ready" | "partially_ready" | "ready_for_review";

export type ProposalWithDetails = Proposal & {
  version: ProposalVersion;
  assessment: Assessment | null;
};

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
