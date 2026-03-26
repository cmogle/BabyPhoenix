import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  assessments,
  readinessRules,
  taxonomyEntries,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  evaluateFieldRules,
  computeReadinessStatus,
} from "@/lib/readiness/rules-engine";
import { assessWithLLM } from "@/lib/readiness/llm-assessor";
import type { ProposalFormData } from "@/lib/actions/proposals";
import { proposals } from "@/lib/db/schema";

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
