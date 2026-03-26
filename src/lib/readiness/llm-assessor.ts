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
    prompt: `Assess this event proposal for readiness:\n\n${proposalSummary}\n\nOrganization context:\n${taxonomyContext}`,
  });

  try {
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
