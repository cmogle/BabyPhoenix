import { notFound } from "next/navigation";
import { getProposal } from "@/lib/actions/proposals";
import { ProposalForm } from "@/components/proposals/proposal-form";

export default async function EditProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) notFound();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Edit Proposal</h2>
        <p className="text-sm text-muted-foreground">
          Update your proposal. A new version will be created and re-assessed.
        </p>
      </div>
      <ProposalForm proposalId={id} initialData={proposal.version} />
    </div>
  );
}
