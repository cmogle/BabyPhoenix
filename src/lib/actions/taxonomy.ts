"use server";

import { db } from "@/lib/db";
import { taxonomyCategories, taxonomyEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTaxonomyCategories() {
  return db.query.taxonomyCategories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });
}

export async function getTaxonomyEntries(categoryId: string) {
  return db.query.taxonomyEntries.findMany({
    where: eq(taxonomyEntries.categoryId, categoryId),
    orderBy: (entries, { asc }) => [asc(entries.name)],
  });
}

export async function getTaxonomyEntriesBySlug(slug: string) {
  const category = await db.query.taxonomyCategories.findFirst({
    where: eq(taxonomyCategories.slug, slug),
  });
  if (!category) return [];
  return db.query.taxonomyEntries.findMany({
    where: eq(taxonomyEntries.categoryId, category.id),
    orderBy: (entries, { asc }) => [asc(entries.name)],
  });
}

export async function addTaxonomyEntry(categoryId: string, name: string, description?: string) {
  await db.insert(taxonomyEntries).values({
    categoryId,
    name,
    description: description || null,
  });
  revalidatePath("/admin/taxonomy");
}

export async function updateTaxonomyEntry(
  id: string,
  data: { name?: string; description?: string; active?: boolean }
) {
  await db
    .update(taxonomyEntries)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(taxonomyEntries.id, id));
  revalidatePath("/admin/taxonomy");
}

export async function deleteTaxonomyEntry(id: string) {
  await db.delete(taxonomyEntries).where(eq(taxonomyEntries.id, id));
  revalidatePath("/admin/taxonomy");
}
