import { ProposalForm } from "@/components/proposals/proposal-form";

export default function NewProposalPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">New Event Proposal</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details below. The readiness engine will assess your
          proposal on submission.
        </p>
      </div>
      <ProposalForm />
    </div>
  );
}
