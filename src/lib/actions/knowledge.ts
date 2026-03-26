"use server";

import { db } from "@/lib/db";
import { reviewerComments, fieldGuidance, proposals } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// --- Reviewer Comments ---

export async function addComment(
  proposalId: string,
  content: string,
  field?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await db.insert(reviewerComments).values({
    proposalId,
    userId: user.id,
    userEmail: user.email ?? "Unknown",
    content,
    field: field ?? null,
  });

  revalidatePath(`/proposals/${proposalId}`);
}

export async function getComments(proposalId: string) {
  return db.query.reviewerComments.findMany({
    where: eq(reviewerComments.proposalId, proposalId),
    orderBy: [desc(reviewerComments.createdAt)],
  });
}

// --- Exemplar Management ---

export async function toggleExemplar(proposalId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, proposalId),
  });
  if (!proposal) throw new Error("Proposal not found");

  await db
    .update(proposals)
    .set({ isExemplar: !proposal.isExemplar })
    .where(eq(proposals.id, proposalId));

  revalidatePath(`/proposals/${proposalId}`);
  revalidatePath("/proposals");
}

export async function getExemplars() {
  const results = await db.query.proposals.findMany({
    where: eq(proposals.isExemplar, true),
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

  return results
    .filter((p) => p.versions.length > 0)
    .map((p) => ({
      ...p,
      version: p.versions[0],
      assessment: p.versions[0].assessments[0] ?? null,
    }));
}

// --- Field Guidance ---

export async function getFieldGuidance() {
  return db.query.fieldGuidance.findMany({
    where: eq(fieldGuidance.active, true),
  });
}

export async function upsertFieldGuidance(
  fieldKey: string,
  data: {
    title: string;
    guidance: string;
    examples?: string[];
    antiPatterns?: string[];
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const existing = await db.query.fieldGuidance.findFirst({
    where: eq(fieldGuidance.fieldKey, fieldKey),
  });

  if (existing) {
    await db
      .update(fieldGuidance)
      .set({
        ...data,
        examples: data.examples ?? null,
        antiPatterns: data.antiPatterns ?? null,
        updatedAt: new Date(),
      })
      .where(eq(fieldGuidance.id, existing.id));
  } else {
    await db.insert(fieldGuidance).values({
      fieldKey,
      ...data,
      examples: data.examples ?? null,
      antiPatterns: data.antiPatterns ?? null,
    });
  }

  revalidatePath("/admin/guidance");
}

// --- Assessment History ---

export async function getAssessmentHistory(proposalId: string) {
  const proposal = await db.query.proposals.findFirst({
    where: eq(proposals.id, proposalId),
    with: {
      versions: {
        orderBy: (v, { desc }) => [desc(v.version)],
        with: {
          assessments: {
            orderBy: (a, { desc }) => [desc(a.createdAt)],
            limit: 1,
          },
        },
      },
    },
  });

  if (!proposal) return [];

  return proposal.versions.map((v) => ({
    version: v.version,
    createdAt: v.createdAt,
    assessment: v.assessments[0] ?? null,
  }));
}
