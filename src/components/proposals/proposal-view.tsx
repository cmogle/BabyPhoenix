import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ProposalVersion } from "@/lib/types";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  not_ready: { label: "Not Ready", className: "bg-rose-500/15 text-rose-500 border-rose-500/20" },
  partially_ready: { label: "Partially Ready", className: "bg-amber-500/15 text-amber-500 border-amber-500/20" },
  ready_for_review: { label: "Ready for Review", className: "bg-teal-500/15 text-teal-500 border-teal-500/20" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return <Badge className={config.className}>{config.label}</Badge>;
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string | string[] | null | undefined;
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(", ") : value;

  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider print:text-black">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm print:text-black">{display}</dd>
    </div>
  );
}

type Props = {
  version: ProposalVersion;
  status?: "not_ready" | "partially_ready" | "ready_for_review" | null;
};

export function ProposalView({ version, status }: Props) {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl print:text-black">{version.title || "Untitled Proposal"}</CardTitle>
            <div className="flex items-center gap-2 mt-1.5">
              {version.eventType && <Badge variant="outline">{version.eventType}</Badge>}
              {version.geography && <Badge variant="outline">{version.geography}</Badge>}
            </div>
          </div>
          {status && <StatusBadge status={status} />}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 print:text-black">
          {version.owner && <span>Owner: {version.owner}</span>}
          {version.proposedTiming && <span>Timing: {version.proposedTiming}</span>}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="print:break-inside-avoid">
          <h3 className="text-sm font-semibold mb-3 print:text-black">Event Basics</h3>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Format" value={version.format} />
            <Field label="Proposed Timing" value={version.proposedTiming} />
            <Field label="Venue Type" value={version.venueType} />
          </dl>
        </section>

        <Separator />

        <section className="print:break-inside-avoid">
          <h3 className="text-sm font-semibold mb-3 print:text-black">Audience & Targeting</h3>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Target Segment" value={version.targetSegment} />
            <Field
              label="Buyer Roles"
              value={version.buyerRoles as string[]}
            />
            <Field label="Geography" value={version.geography} />
            <Field label="Audience Size" value={version.audienceSize} />
            <Field label="Target Accounts" value={version.targetAccounts} />
          </dl>
        </section>

        <Separator />

        <section className="print:break-inside-avoid">
          <h3 className="text-sm font-semibold mb-3 print:text-black">Product & Strategy</h3>
          <dl className="space-y-4">
            <Field label="Product Focus" value={version.productFocus} />
            <Field label="Objective" value={version.objective} />
            <Field
              label="Strategic Rationale"
              value={version.strategicRationale}
            />
            <Field label="Success Metrics" value={version.successMetrics} />
            <Field label="Related Campaign" value={version.relatedCampaign} />
          </dl>
        </section>

        <Separator />

        <section className="print:break-inside-avoid">
          <h3 className="text-sm font-semibold mb-3 print:text-black">Logistics & Budget</h3>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Budget Range" value={version.budgetRange} />
            <Field label="Owner" value={version.owner} />
            <Field label="Dependencies" value={version.dependencies} />
            <Field label="Partner" value={version.partnerName} />
            <Field label="Partner Role" value={version.partnerRole} />
            <Field
              label="Executive Participation"
              value={version.executiveParticipation}
            />
          </dl>
        </section>

        {(version.regulatoryConsiderations || version.followUpExpectation) && (
          <>
            <Separator />
            <section className="print:break-inside-avoid">
              <h3 className="text-sm font-semibold mb-3 print:text-black">Additional</h3>
              <dl className="space-y-4">
                <Field
                  label="Regulatory Considerations"
                  value={version.regulatoryConsiderations}
                />
                <Field
                  label="Follow-up Expectation"
                  value={version.followUpExpectation}
                />
              </dl>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  );
}
