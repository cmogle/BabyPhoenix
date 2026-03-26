import { notFound } from "next/navigation";
import { getProposal } from "@/lib/actions/proposals";
import { getComments, getAssessmentHistory } from "@/lib/actions/knowledge";
import { ProposalView } from "@/components/proposals/proposal-view";
import { ReadinessAssessment } from "@/components/proposals/readiness-assessment";
import { ProposalActions } from "@/components/proposals/proposal-actions";
import { ReviewerComments } from "@/components/proposals/reviewer-comments";
import { AssessmentHistory } from "@/components/proposals/assessment-history";
import {
  ExemplarBadge,
  ExemplarToggle,
} from "@/components/proposals/exemplar-badge";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [proposal, comments, history] = await Promise.all([
    getProposal(id),
    getComments(id),
    getAssessmentHistory(id),
  ]);
  if (!proposal) notFound();

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Event Proposal</h2>
            <ExemplarBadge isExemplar={proposal.isExemplar} />
          </div>
          <p className="text-sm text-muted-foreground">
            Version {proposal.currentVersion}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExemplarToggle proposalId={id} isExemplar={proposal.isExemplar} />
          <ProposalActions proposalId={id} />
        </div>
      </div>

      <div className="space-y-6">
        <ProposalView
          version={proposal.version}
          status={proposal.assessment?.status}
        />
        {proposal.assessment && (
          <ReadinessAssessment assessment={proposal.assessment} />
        )}
        <AssessmentHistory history={history} />
        <ReviewerComments proposalId={id} comments={comments} />
      </div>
    </div>
  );
}
