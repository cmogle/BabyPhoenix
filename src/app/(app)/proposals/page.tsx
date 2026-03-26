import { Suspense } from "react";
import Link from "next/link";
import { getProposals } from "@/lib/actions/proposals";
import { ProposalList } from "@/components/proposals/proposal-list";
import { ProposalListFilters } from "@/components/proposals/proposal-list-filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  let proposals = await getProposals();

  // Apply filters
  if (params.q) {
    const q = params.q.toLowerCase();
    proposals = proposals.filter(
      (p) =>
        p.version.title?.toLowerCase().includes(q) ||
        p.version.eventType?.toLowerCase().includes(q) ||
        p.version.geography?.toLowerCase().includes(q) ||
        p.version.owner?.toLowerCase().includes(q)
    );
  }

  if (params.status && params.status !== "all") {
    if (params.status === "unassessed") {
      proposals = proposals.filter((p) => !p.assessment);
    } else {
      proposals = proposals.filter(
        (p) => p.assessment?.status === params.status
      );
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Event Proposals</h2>
          <p className="text-sm text-muted-foreground">
            {proposals.length} proposal{proposals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button render={<Link href="/proposals/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>
      <div className="space-y-4">
        <Suspense>
          <ProposalListFilters />
        </Suspense>
        <ProposalList proposals={proposals} />
      </div>
    </div>
  );
}
