"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createProposal,
  updateProposal,
  type ProposalFormData,
} from "@/lib/actions/proposals";
import { ProposalFormSection } from "./proposal-form-section";
import { TaxonomyField } from "./taxonomy-field";
import { AiAssistedField } from "./ai-assisted-field";
import { ReadinessPreview } from "./readiness-preview";
import { SherpaPanel } from "./sherpa-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProposalVersion } from "@/lib/types";

// Smart defaults based on event type — drawn from financial services domain knowledge
const EVENT_TYPE_DEFAULTS: Record<string, Partial<ProposalFormData>> = {
  "Executive Dinner": {
    audienceSize: "15-30",
    format: "Intimate seated dinner with keynote or fireside chat",
    venueType: "Private dining venue or hotel restaurant",
  },
  "Client Roundtable": {
    audienceSize: "20-40",
    format: "Moderated discussion with client presentations",
    venueType: "Hotel meeting room or executive briefing center",
  },
  "Conference": {
    audienceSize: "200-500",
    format: "Multi-track sessions with keynotes and networking",
    venueType: "Convention center or large hotel",
  },
  "Webinar": {
    audienceSize: "100-500",
    format: "Virtual presentation with live Q&A",
    venueType: "Virtual",
  },
  "Regional Field Event": {
    audienceSize: "50-150",
    format: "Half-day or full-day event with presentations and networking",
    venueType: "Hotel conference room or local venue",
  },
  "Partner Event": {
    audienceSize: "30-100",
    format: "Co-hosted event with partner presentations",
    venueType: "Partner office or shared venue",
  },
  "Sponsorship": {
    audienceSize: "500+",
    format: "Branded presence at third-party event",
    venueType: "Third-party event venue",
  },
};

function SuggestedValue({
  fieldKey,
  suggestion,
  onAccept,
  onDismiss,
}: {
  fieldKey: string;
  suggestion: string;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-teal-500/20 bg-teal-500/5 px-3 py-1.5 text-xs text-teal-600 dark:text-teal-400">
      <Sparkles className="h-3 w-3 shrink-0" />
      <span className="flex-1">
        <span className="font-medium">Suggested:</span> {suggestion}
      </span>
      <button
        type="button"
        onClick={onAccept}
        className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-teal-500/15 hover:bg-teal-500/25 transition-colors"
      >
        Accept
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss suggestion"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

type Props = {
  proposalId?: string;
  initialData?: Partial<ProposalVersion> | Partial<ProposalFormData>;
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
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [activeField, setActiveField] = useState<string | null>(null);
  const [sherpaCollapsed, setSherpaCollapsed] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sectionCounts = useMemo(() => {
    function countFilled(fields: (keyof ProposalFormData)[]) {
      return fields.filter(f => {
        const v = data[f];
        if (v === undefined || v === null || v === "") return false;
        if (Array.isArray(v) && v.length === 0) return false;
        if (typeof v === "string" && v.trim().length < 2) return false;
        return true;
      }).length;
    }
    return {
      basics: { completed: countFilled(["title", "eventType", "format", "proposedTiming"]), total: 4 },
      audience: { completed: countFilled(["targetSegment", "buyerRoles", "geography", "audienceSize"]), total: 4 },
      strategy: { completed: countFilled(["productFocus", "strategicRationale", "objective", "successMetrics"]), total: 4 },
      logistics: { completed: countFilled(["budgetRange", "owner", "dependencies"]), total: 3 },
    };
  }, [data]);

  useEffect(() => {
    if (!proposalId) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await updateProposal(proposalId, data);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch {
        setSaveStatus("idle");
      }
    }, 2000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [data, proposalId]);

  useEffect(() => {
    if (!data.eventType) {
      setSuggestions({});
      return;
    }
    const defaults = EVENT_TYPE_DEFAULTS[data.eventType];
    if (!defaults) {
      setSuggestions({});
      return;
    }

    // Only suggest for fields that are currently empty
    const newSuggestions: Record<string, string> = {};
    for (const [key, value] of Object.entries(defaults)) {
      const currentValue = data[key as keyof ProposalFormData];
      if (!currentValue || (typeof currentValue === "string" && currentValue.trim() === "")) {
        newSuggestions[key] = value as string;
      }
    }
    setSuggestions(newSuggestions);
  }, [data.eventType]);

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
        <div className="flex items-center justify-between mb-4">
          <div /> {/* spacer */}
          {saveStatus !== "idle" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              {saveStatus === "saving" && (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Saving...
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-teal-500" />
                  Saved
                </>
              )}
            </span>
          )}
        </div>
        <ProposalFormSection title="Event Basics" completed={sectionCounts.basics.completed} total={sectionCounts.basics.total}>
          <div className="space-y-2" onFocus={() => setActiveField("title")}>
            <Label>Event Title</Label>
            <Input
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g., Q3 APAC Payments Executive Breakfast"
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("eventType")}>
            <Label>Event Type</Label>
            <TaxonomyField
              slug="event_types"
              value={data.eventType}
              onChange={(v) => update("eventType", v as string)}
              placeholder="Select event type..."
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("format")}>
            <Label>Format</Label>
            <Input
              value={data.format}
              onChange={(e) => update("format", e.target.value)}
              placeholder="e.g., Seated dinner with keynote, Panel discussion"
            />
            {suggestions.format && (
              <SuggestedValue
                fieldKey="format"
                suggestion={suggestions.format}
                onAccept={() => {
                  update("format", suggestions.format);
                  setSuggestions((prev) => { const next = { ...prev }; delete next.format; return next; });
                }}
                onDismiss={() => setSuggestions((prev) => { const next = { ...prev }; delete next.format; return next; })}
              />
            )}
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("proposedTiming")}>
            <Label>Proposed Timing</Label>
            <Input
              value={data.proposedTiming}
              onChange={(e) => update("proposedTiming", e.target.value)}
              placeholder="e.g., Q3 2026, September 15-17, Sibos week"
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("venueType")}>
            <Label>Venue Type</Label>
            <Input
              value={data.venueType}
              onChange={(e) => update("venueType", e.target.value)}
              placeholder="e.g., Hotel private dining room, Conference venue"
            />
            {suggestions.venueType && (
              <SuggestedValue
                fieldKey="venueType"
                suggestion={suggestions.venueType}
                onAccept={() => {
                  update("venueType", suggestions.venueType);
                  setSuggestions((prev) => { const next = { ...prev }; delete next.venueType; return next; });
                }}
                onDismiss={() => setSuggestions((prev) => { const next = { ...prev }; delete next.venueType; return next; })}
              />
            )}
          </div>
        </ProposalFormSection>

        <ProposalFormSection title="Audience & Targeting" completed={sectionCounts.audience.completed} total={sectionCounts.audience.total}>
          <div className="space-y-2" onFocus={() => setActiveField("targetSegment")}>
            <Label>Target Segment</Label>
            <TaxonomyField
              slug="segments"
              value={data.targetSegment}
              onChange={(v) => update("targetSegment", v as string)}
              placeholder="Select segment..."
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("buyerRoles")}>
            <Label>Target Buyer Roles</Label>
            <TaxonomyField
              slug="buyer_roles"
              value={data.buyerRoles}
              onChange={(v) => update("buyerRoles", v as string[])}
              multiple
              placeholder="Select buyer roles..."
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("geography")}>
            <Label>Geography / Market</Label>
            <TaxonomyField
              slug="geographies"
              value={data.geography}
              onChange={(v) => update("geography", v as string)}
              placeholder="Select geography..."
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("audienceSize")}>
            <Label>Audience Size</Label>
            <Input
              value={data.audienceSize}
              onChange={(e) => update("audienceSize", e.target.value)}
              placeholder="e.g., 25-30 attendees"
            />
            {suggestions.audienceSize && (
              <SuggestedValue
                fieldKey="audienceSize"
                suggestion={suggestions.audienceSize}
                onAccept={() => {
                  update("audienceSize", suggestions.audienceSize);
                  setSuggestions((prev) => { const next = { ...prev }; delete next.audienceSize; return next; });
                }}
                onDismiss={() => setSuggestions((prev) => { const next = { ...prev }; delete next.audienceSize; return next; })}
              />
            )}
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("targetAccounts")}>
            <Label>Target Accounts (optional)</Label>
            <Textarea
              value={data.targetAccounts}
              onChange={(e) => update("targetAccounts", e.target.value)}
              placeholder="Named accounts or account criteria..."
              rows={2}
            />
          </div>
        </ProposalFormSection>

        <ProposalFormSection title="Product & Strategy" completed={sectionCounts.strategy.completed} total={sectionCounts.strategy.total}>
          <div className="space-y-2" onFocus={() => setActiveField("productFocus")}>
            <Label>Product / Solution Focus</Label>
            <TaxonomyField
              slug="products"
              value={data.productFocus}
              onChange={(v) => update("productFocus", v as string)}
              placeholder="Select product..."
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("strategicRationale")}>
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
          <div className="space-y-2" onFocus={() => setActiveField("objective")}>
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
          <div className="space-y-2" onFocus={() => setActiveField("successMetrics")}>
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
          <div className="space-y-2" onFocus={() => setActiveField("relatedCampaign")}>
            <Label>Related Campaign / Program (optional)</Label>
            <Input
              value={data.relatedCampaign}
              onChange={(e) => update("relatedCampaign", e.target.value)}
              placeholder="e.g., APAC Payments Growth H2 Campaign"
            />
          </div>
        </ProposalFormSection>

        <ProposalFormSection title="Logistics & Budget" completed={sectionCounts.logistics.completed} total={sectionCounts.logistics.total}>
          <div className="space-y-2" onFocus={() => setActiveField("budgetRange")}>
            <Label>Estimated Budget Range</Label>
            <Input
              value={data.budgetRange}
              onChange={(e) => update("budgetRange", e.target.value)}
              placeholder="e.g., $15,000-$25,000"
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("owner")}>
            <Label>Owner</Label>
            <Input
              value={data.owner}
              onChange={(e) => update("owner", e.target.value)}
              placeholder="Who is responsible for this event?"
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("dependencies")}>
            <Label>Dependencies / Required Approvals</Label>
            <Textarea
              value={data.dependencies}
              onChange={(e) => update("dependencies", e.target.value)}
              placeholder="Budget approval, venue booking, speaker confirmation..."
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2" onFocus={() => setActiveField("partnerName")}>
              <Label>Partner (optional)</Label>
              <Input
                value={data.partnerName}
                onChange={(e) => update("partnerName", e.target.value)}
                placeholder="Partner name"
              />
            </div>
            <div className="space-y-2" onFocus={() => setActiveField("partnerRole")}>
              <Label>Partner Role</Label>
              <Input
                value={data.partnerRole}
                onChange={(e) => update("partnerRole", e.target.value)}
                placeholder="Co-host, sponsor, attendee source"
              />
            </div>
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("executiveParticipation")}>
            <Label>Executive Participation (optional)</Label>
            <Input
              value={data.executiveParticipation}
              onChange={(e) => update("executiveParticipation", e.target.value)}
              placeholder="e.g., Regional CEO keynote, MD hosting"
            />
          </div>
        </ProposalFormSection>

        <ProposalFormSection title="Optional" defaultOpen={false}>
          <div className="space-y-2" onFocus={() => setActiveField("regulatoryConsiderations")}>
            <Label>Regulatory / Compliance Considerations</Label>
            <Textarea
              value={data.regulatoryConsiderations}
              onChange={(e) => update("regulatoryConsiderations", e.target.value)}
              placeholder="Any regulatory requirements for this market or event type..."
              rows={2}
            />
          </div>
          <div className="space-y-2" onFocus={() => setActiveField("followUpExpectation")}>
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
      <div className={cn("shrink-0 hidden xl:block", sherpaCollapsed ? "w-10" : "w-72")}>
        <div className="sticky top-6">
          <SherpaPanel
            activeField={activeField}
            collapsed={sherpaCollapsed}
            onToggle={() => setSherpaCollapsed((prev) => !prev)}
          />
        </div>
      </div>
    </div>
  );
}
