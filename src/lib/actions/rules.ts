"use server";

import { db } from "@/lib/db";
import { readinessRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRules() {
  return db.query.readinessRules.findMany({
    orderBy: (rules, { asc }) => [asc(rules.type), asc(rules.name)],
  });
}

export async function addRule(data: {
  type: "required" | "conditional" | "placeholder" | "quality";
  name: string;
  description?: string;
  fields?: string[];
  condition?: string;
  message: string;
}) {
  await db.insert(readinessRules).values({
    type: data.type,
    name: data.name,
    description: data.description || null,
    fields: data.fields || null,
    condition: data.condition || null,
    message: data.message,
  });
  revalidatePath("/admin/rules");
}

export async function updateRule(
  id: string,
  data: {
    name?: string;
    description?: string;
    fields?: string[];
    condition?: string;
    message?: string;
    active?: boolean;
  }
) {
  await db
    .update(readinessRules)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(readinessRules.id, id));
  revalidatePath("/admin/rules");
}

export async function deleteRule(id: string) {
  await db.delete(readinessRules).where(eq(readinessRules.id, id));
  revalidatePath("/admin/rules");
}
