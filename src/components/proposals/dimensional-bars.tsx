"use client";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Finding = {
  field: string;
  status: "missing" | "weak" | "strong";
  message: string;
  suggestion?: string;
};

// Map fields to assessment dimensions
const DIMENSIONS: Record<string, { label: string; fields: string[] }> = {
  completeness: {
    label: "Completeness",
    fields: ["title", "eventType", "format", "proposedTiming", "targetSegment", "buyerRoles", "geography", "audienceSize", "productFocus", "budgetRange", "owner"],
  },
  strategic: {
    label: "Strategic Clarity",
    fields: ["objective", "strategicRationale", "relatedCampaign"],
  },
  measurability: {
    label: "Measurability",
    fields: ["successMetrics", "followUpExpectation", "audienceSize"],
  },
  governance: {
    label: "Governance",
    fields: ["dependencies", "regulatoryConsiderations", "partnerRole", "executiveParticipation"],
  },
};

const STATUS_COLORS = {
  strong: "bg-teal-500",
  weak: "bg-amber-500",
  missing: "bg-rose-500/40",
};

type Props = {
  findings: Finding[];
};

export function DimensionalBars({ findings }: Props) {
  // Build a lookup of field -> status from findings
  const fieldStatusMap = new Map<string, "missing" | "weak" | "strong">();
  for (const f of findings) {
    // Use the most severe status if duplicate
    const existing = fieldStatusMap.get(f.field);
    if (!existing || severityRank(f.status) > severityRank(existing)) {
      fieldStatusMap.set(f.field, f.status);
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {Object.entries(DIMENSIONS).map(([key, dim]) => {
          const segments = dim.fields.map((field) => ({
            field,
            status: fieldStatusMap.get(field) ?? "strong", // default to strong if not in findings
          }));

          const strongCount = segments.filter((s) => s.status === "strong").length;
          const weakCount = segments.filter((s) => s.status === "weak").length;
          const missingCount = segments.filter((s) => s.status === "missing").length;

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{dim.label}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums font-mono">
                  {strongCount}/{segments.length}
                </span>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-px bg-muted/30">
                {segments.map((seg, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger
                      render={
                        <div
                          className={cn(
                            "flex-1 transition-colors duration-300",
                            STATUS_COLORS[seg.status],
                            i === 0 && "rounded-l-full",
                            i === segments.length - 1 && "rounded-r-full"
                          )}
                        />
                      }
                    />
                    <TooltipContent side="bottom" className="text-xs">
                      <span className="capitalize">{seg.field.replace(/([A-Z])/g, ' $1').trim()}</span>
                      : {seg.status}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              {/* Summary counts */}
              <div className="flex gap-3 text-[10px] text-muted-foreground">
                {strongCount > 0 && <span className="text-teal-500">{strongCount} strong</span>}
                {weakCount > 0 && <span className="text-amber-500">{weakCount} weak</span>}
                {missingCount > 0 && <span className="text-rose-500">{missingCount} missing</span>}
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function severityRank(status: "missing" | "weak" | "strong"): number {
  switch (status) {
    case "missing": return 3;
    case "weak": return 2;
    case "strong": return 1;
  }
}
