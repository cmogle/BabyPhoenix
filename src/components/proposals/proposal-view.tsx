import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { ProposalVersion } from "@/lib/types";

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
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{display}</dd>
    </div>
  );
}

export function ProposalView({ version }: { version: ProposalVersion }) {
  return (
    <Card className="print:shadow-none print:border-0">
      <CardHeader>
        <CardTitle className="text-xl">
          {version.title || "Untitled Proposal"}
        </CardTitle>
        {version.eventType && (
          <Badge variant="outline" className="w-fit">
            {version.eventType}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold mb-3">Event Basics</h3>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Format" value={version.format} />
            <Field label="Proposed Timing" value={version.proposedTiming} />
            <Field label="Venue Type" value={version.venueType} />
          </dl>
        </section>

        <Separator />

        <section>
          <h3 className="text-sm font-semibold mb-3">Audience & Targeting</h3>
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

        <section>
          <h3 className="text-sm font-semibold mb-3">Product & Strategy</h3>
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

        <section>
          <h3 className="text-sm font-semibold mb-3">Logistics & Budget</h3>
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
            <section>
              <h3 className="text-sm font-semibold mb-3">Additional</h3>
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
