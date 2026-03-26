import { notFound } from "next/navigation";
import { getProposal } from "@/lib/actions/proposals";
import { ProposalView } from "@/components/proposals/proposal-view";
import { ReadinessAssessment } from "@/components/proposals/readiness-assessment";
import { ProposalActions } from "@/components/proposals/proposal-actions";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-lg font-semibold">Event Proposal</h2>
          <p className="text-sm text-muted-foreground">
            Version {proposal.currentVersion}
          </p>
        </div>
        <ProposalActions proposalId={id} />
      </div>

      <div className="space-y-6">
        <ProposalView version={proposal.version} />
        {proposal.assessment && (
          <ReadinessAssessment assessment={proposal.assessment} />
        )}
      </div>
    </div>
  );
}
