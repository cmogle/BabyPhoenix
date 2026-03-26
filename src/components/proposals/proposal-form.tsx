"use client";

import { useState } from "react";
import {
  createProposal,
  updateProposal,
  type ProposalFormData,
} from "@/lib/actions/proposals";
import { ProposalFormSection } from "./proposal-form-section";
import { TaxonomyField } from "./taxonomy-field";
import { AiAssistedField } from "./ai-assisted-field";
import { ReadinessPreview } from "./readiness-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ProposalVersion } from "@/lib/types";

type Props = {
  proposalId?: string;
  initialData?: ProposalVersion;
};

export function ProposalForm({ proposalId, initialData }: Props) {
  const [data, setData] = useState<ProposalFormData>({
    title: initialData?.title ?? "",
    eventType: initialData?.eventType ?? "",
    format: initialData?.format ?? "",
    proposedTiming: initialData?.proposedTiming ?? "",
    venueType: initialData?.venueType ?? "",
    targetSegment: initialData?.targetSegment ?? "",
    buyerRoles: (initialData?.buyerRoles as string[]) ?? [],
    geography: initialData?.geography ?? "",
    audienceSize: initialData?.audienceSize ?? "",
    targetAccounts: initialData?.targetAccounts ?? "",
    productFocus: initialData?.productFocus ?? "",
    strategicRationale: initialData?.strategicRationale ?? "",
    objective: initialData?.objective ?? "",
    successMetrics: initialData?.successMetrics ?? "",
    relatedCampaign: initialData?.relatedCampaign ?? "",
    budgetRange: initialData?.budgetRange ?? "",
    owner: initialData?.owner ?? "",
    dependencies: initialData?.dependencies ?? "",
    partnerName: initialData?.partnerName ?? "",
    partnerRole: initialData?.partnerRole ?? "",
    executiveParticipation: initialData?.executiveParticipation ?? "",
    regulatoryConsiderations: initialData?.regulatoryConsiderations ?? "",
    followUpExpectation: initialData?.followUpExpectation ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ProposalFormData>(
    key: K,
    value: ProposalFormData[K]
  ) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      let id: string;
      if (proposalId) {
        id = await updateProposal(proposalId, data);
      } else {
        id = await createProposal(data);
      }

      toast.info("Running readiness assessment...");
      const res = await fetch("/api/ai/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId: id }),
      });

      if (res.ok) {
        toast.success("Proposal saved and assessed");
      } else {
        toast.warning("Proposal saved but assessment failed");
      }

      window.location.href = `/proposals/${id}`;
    } catch {
      toast.error("Failed to save proposal");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex gap-6">
      <div className="space-y-4 flex-1 max-w-2xl">
        <ProposalFormSection title="Event Basics">
          <div className="space-y-2">
            <Label>Event Title</Label>
            <Input
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g., Q3 APAC Payments Executive Breakfast"
            />
          </div>
          <div className="space-y-2">
            <Label>Event Type</Label>
            <TaxonomyField
              slug="event_types"
              value={data.eventType}
              onChange={(v) => update("eventType", v as string)}
              placeholder="Select event type..."
            />
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <Input
              value={data.format}
              onChange={(e) => update("format", e.target.value)}
              placeholder="e.g., Seated dinner with keynote, Panel discussion"
            />
          </div>
          <div className="space-y-2">
            <Label>Proposed Timing</Label>
            <Input
              value={data.proposedTiming}
              onChange={(e) => update("proposedTiming", e.target.value)}
              placeholder="e.g., Q3 2026, September 15-17, Sibos week"
            />
          </div>
          <div className="space-y-2">
            <Label>Venue Type</Label>
            <Input
              value={data.venueType}
              onChange={(e) => update("venueType", e.target.value)}
              placeholder="e.g., Hotel private dining room, Conference venue"
            />
          </div>
        </ProposalFormSection>

        <ProposalFormSection title="Audience & Targeting">
          <div className="space-y-2">
            <Label>Target Segment</Label>
            <TaxonomyField
              slug="segments"
              value={data.targetSegment}
              onChange={(v) => update("targetSegment", v as string)}
              placeholder="Select segment..."
            />
          </div>
          <div className="space-y-2">
            <Label>Target Buyer Roles</Label>
            <TaxonomyField
              slug="buyer_roles"
              value={data.buyerRoles}
              onChange={(v) => update("buyerRoles", v as string[])}
              multiple
              placeholder="Select buyer roles..."
            />
          </div>
          <div className="space-y-2">
            <Label>Geography / Market</Label>
            <TaxonomyField
              slug="geographies"
              value={data.geography}
              onChange={(v) => update("geography", v as string)}
              placeholder="Select geography..."
            />
          </div>
          <div className="space-y-2">
            <Label>Audience Size</Label>
            <Input
              value={data.audienceSize}
              onChange={(e) => update("audienceSize", e.target.value)}
              placeholder="e.g., 25-30 attendees"
            />
          </div>
          <div className="space-y-2">
            <Label>Target Accounts (optional)</Label>
            <Textarea
              value={data.targetAccounts}
              onChange={(e) => update("targetAccounts", e.target.value)}
              placeholder="Named accounts or account criteria..."
              rows={2}
            />
          </div>
        </ProposalFormSection>

        <ProposalFormSection title="Product & Strategy">
          <div className="space-y-2">
            <Label>Product / Solution Focus</Label>
            <TaxonomyField
              slug="products"
              value={data.productFocus}
              onChange={(v) => update("productFocus", v as string)}
              placeholder="Select product..."
            />
          </div>
          <div className="space-y-2">
            <Label>Strategic Rationale</Label>
            <AiAssistedField
              value={data.strategicRationale ?? ""}
              onChange={(v) => update("strategicRationale", v)}
              placeholder="Why this event? How does it advance a strategic priority?"
              rows={3}
              fieldName="Strategic Rationale"
              context={data}
            />
          </div>
          <div className="space-y-2">
            <Label>Objective</Label>
            <AiAssistedField
              value={data.objective ?? ""}
              onChange={(v) => update("objective", v)}
              placeholder="What specific, measurable outcome should this event produce?"
              rows={3}
              fieldName="Objective"
              context={data}
            />
          </div>
          <div className="space-y-2">
            <Label>Success Metrics</Label>
            <AiAssistedField
              value={data.successMetrics ?? ""}
              onChange={(v) => update("successMetrics", v)}
              placeholder="How will you measure whether this event achieved its objective?"
              rows={3}
              fieldName="Success Metrics"
              context={data}
            />
          </div>
          <div className="space-y-2">
            <Label>Related Campaign / Program (optional)</Label>
            <Input
              value={data.relatedCampaign}
              onChange={(e) => update("relatedCampaign", e.target.value)}
              placeholder="e.g., APAC Payments Growth H2 Campaign"
            />
          </div>
        </ProposalFormSection>

        <ProposalFormSection title="Logistics & Budget">
          <div className="space-y-2">
            <Label>Estimated Budget Range</Label>
            <Input
              value={data.budgetRange}
              onChange={(e) => update("budgetRange", e.target.value)}
              placeholder="e.g., $15,000-$25,000"
            />
          </div>
          <div className="space-y-2">
            <Label>Owner</Label>
            <Input
              value={data.owner}
              onChange={(e) => update("owner", e.target.value)}
              placeholder="Who is responsible for this event?"
            />
          </div>
          <div className="space-y-2">
            <Label>Dependencies / Required Approvals</Label>
            <Textarea
              value={data.dependencies}
              onChange={(e) => update("dependencies", e.target.value)}
              placeholder="Budget approval, venue booking, speaker confirmation..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Partner (optional)</Label>
              <Input
                value={data.partnerName}
                onChange={(e) => update("partnerName", e.target.value)}
                placeholder="Partner name"
              />
            </div>
            <div className="space-y-2">
              <Label>Partner Role</Label>
              <Input
                value={data.partnerRole}
                onChange={(e) => update("partnerRole", e.target.value)}
                placeholder="Co-host, sponsor, attendee source"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Executive Participation (optional)</Label>
            <Input
              value={data.executiveParticipation}
              onChange={(e) => update("executiveParticipation", e.target.value)}
              placeholder="e.g., Regional CEO keynote, MD hosting"
            />
          </div>
        </ProposalFormSection>

        <ProposalFormSection title="Optional" defaultOpen={false}>
          <div className="space-y-2">
            <Label>Regulatory / Compliance Considerations</Label>
            <Textarea
              value={data.regulatoryConsiderations}
              onChange={(e) => update("regulatoryConsiderations", e.target.value)}
              placeholder="Any regulatory requirements for this market or event type..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Follow-up / Conversion Expectation</Label>
            <Textarea
              value={data.followUpExpectation}
              onChange={(e) => update("followUpExpectation", e.target.value)}
              placeholder="Expected post-event follow-up process and conversion targets..."
              rows={2}
            />
          </div>
        </ProposalFormSection>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? "Saving..."
              : proposalId
                ? "Save & Assess Readiness"
                : "Create & Assess Readiness"}
          </Button>
        </div>
      </div>

      <div className="w-64 shrink-0 hidden lg:block">
        <ReadinessPreview data={data} />
      </div>
    </div>
  );
}
