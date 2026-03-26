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
