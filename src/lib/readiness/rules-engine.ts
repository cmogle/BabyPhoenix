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

  const notEmptyMatch = condition.match(/^(\w+)\s+IS\s+NOT\s+EMPTY$/i);
  if (notEmptyMatch) {
    const fieldName = notEmptyMatch[1];
    return !isEmpty(getFieldValue(data, fieldName));
  }

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
