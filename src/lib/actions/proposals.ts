"use server";

import { db } from "@/lib/db";
import { proposals, proposalVersions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProposalFormData = {
  title?: string;
  eventType?: string;
  format?: string;
  proposedTiming?: string;
  venueType?: string;
  targetSegment?: string;
  buyerRoles?: string[];
  geography?: string;
  audienceSize?: string;
  targetAccounts?: string;
  productFocus?: string;
  strategicRationale?: string;
  objective?: string;
  successMetrics?: string;
  relatedCampaign?: string;
  budgetRange?: string;
  owner?: string;
  dependencies?: string;
  partnerName?: string;
  partnerRole?: string;
  executiveParticipation?: string;
  regulatoryConsiderations?: string;
  followUpExpectation?: string;
};

export async function createProposal(data: ProposalFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [proposal] = await db
    .insert(proposals)
    .values({ userId: user.id })
    .returning();

  await db.insert(proposalVersions).values({
    proposalId: proposal.id,
    version: 1,
    ...data,
    buyerRoles: data.buyerRoles ?? null,
  });

  revalidatePath("/proposals");
  return proposal.id;
}

export async function updateProposal(proposalId: string, data: ProposalFormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, proposalId),
  });
  if (!proposal) throw new Error("Proposal not found");

  const newVersion = proposal.currentVersion + 1;

  await db.insert(proposalVersions).values({
    proposalId,
    version: newVersion,
    ...data,
    buyerRoles: data.buyerRoles ?? null,
  });

  await db
    .update(proposals)
    .set({ currentVersion: newVersion, updatedAt: new Date() })
    .where(eq(proposals.id, proposalId));

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
  return proposalId;
}

export async function getProposal(id: string) {
  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, id),
    with: {
      versions: {
        orderBy: (v, { desc }) => [desc(v.version)],
        limit: 1,
        with: {
          assessments: {
            orderBy: (a, { desc }) => [desc(a.createdAt)],
            limit: 1,
          },
        },
      },
    },
  });

  if (!proposal || proposal.versions.length === 0) return null;

  return {
    ...proposal,
    version: proposal.versions[0],
    assessment: proposal.versions[0].assessments[0] ?? null,
  };
}

export async function getProposals() {
  const results = await db.query.proposals.findMany({
    with: {
      versions: {
        orderBy: (v, { desc }) => [desc(v.version)],
        limit: 1,
        with: {
          assessments: {
            orderBy: (a, { desc }) => [desc(a.createdAt)],
            limit: 1,
          },
        },
      },
    },
    orderBy: (p, { desc }) => [desc(p.updatedAt)],
  });

  return results
    .filter((p) => p.versions.length > 0)
    .map((p) => ({
      ...p,
      version: p.versions[0],
      assessment: p.versions[0].assessments[0] ?? null,
    }));
}
