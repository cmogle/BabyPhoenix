import { db } from "@/lib/db";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";

export default async function TaxonomyPage() {
  const categories = await db.query.taxonomyCategories.findMany({
    with: {
      entries: {
        orderBy: (entries, { asc }) => [asc(entries.name)],
      },
    },
    orderBy: (cats, { asc }) => [asc(cats.name)],
  });

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Taxonomy Management</h2>
        <p className="text-sm text-muted-foreground">
          Manage controlled vocabularies used in proposal forms and readiness assessment.
        </p>
      </div>
      <TaxonomyManager categories={categories} />
    </div>
  );
}
