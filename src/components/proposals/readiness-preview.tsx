"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Circle } from "lucide-react";
import { PROPOSAL_FIELDS, type ProposalFieldKey } from "@/lib/types";
import type { ProposalFormData } from "@/lib/actions/proposals";

const PLACEHOLDER_PATTERNS =
  /^(tbd|tbc|to be (confirmed|determined)|various|multiple|n\/a|na|pending)$/i;

type FieldStatus = "strong" | "weak" | "missing";

type FieldItem = {
  field: ProposalFieldKey;
  label: string;
  status: FieldStatus;
};

type Section = {
  title: string;
  fields: ProposalFieldKey[];
};

const SECTIONS: Section[] = [
  {
    title: "Event Basics",
    fields: ["title", "eventType", "format", "proposedTiming"],
  },
  {
    title: "Audience & Targeting",
    fields: ["targetSegment", "buyerRoles", "geography", "audienceSize"],
  },
  {
    title: "Product & Strategy",
    fields: [
      "productFocus",
      "strategicRationale",
      "objective",
      "successMetrics",
    ],
  },
  {
    title: "Logistics & Budget",
    fields: ["budgetRange", "owner", "dependencies"],
  },
];

function getFieldStatus(
  data: ProposalFormData,
  field: ProposalFieldKey
): FieldStatus {
  const value = (data as Record<string, unknown>)[field];

  // Missing checks
  if (value === undefined || value === null || value === "") return "missing";
  if (Array.isArray(value) && value.length === 0) return "missing";
  if (typeof value === "string" && value.trim().length === 0) return "missing";

  // Weak checks — placeholder patterns
  if (typeof value === "string" && PLACEHOLDER_PATTERNS.test(value.trim())) {
    return "weak";
  }

  // Weak checks — too short for text fields
  if (typeof value === "string" && value.trim().length < 10) {
    return "weak";
  }

  // Array fields: check if all entries are placeholders or very short
  if (Array.isArray(value)) {
    const allWeak = value.every(
      (v) =>
        typeof v === "string" &&
        (v.trim().length < 10 || PLACEHOLDER_PATTERNS.test(v.trim()))
    );
    if (allWeak) return "weak";
  }

  return "strong";
}

type ReadinessLabel = "Not Ready" | "Partially Ready" | "Ready for Review";

function getReadinessLabel(items: FieldItem[]): {
  label: ReadinessLabel;
  className: string;
} {
  const hasMissing = items.some((i) => i.status === "missing");
  const hasWeak = items.some((i) => i.status === "weak");

  if (hasMissing) {
    return { label: "Not Ready", className: "text-rose-500" };
  }
  if (hasWeak) {
    return { label: "Partially Ready", className: "text-amber-500" };
  }
  return { label: "Ready for Review", className: "text-teal-500" };
}

function StatusIcon({ status }: { status: FieldStatus }) {
  switch (status) {
    case "strong":
      return <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />;
    case "weak":
      return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
    case "missing":
      return <Circle className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

export function ReadinessPreview({ data }: { data: ProposalFormData }) {
  const { sections, allItems, counts } = useMemo(() => {
    const allItems: FieldItem[] = [];
    const sections = SECTIONS.map((section) => {
      const items = section.fields.map((field) => {
        const item: FieldItem = {
          field,
          label: PROPOSAL_FIELDS[field],
          status: getFieldStatus(data, field),
        };
        allItems.push(item);
        return item;
      });
      const filledCount = items.filter((i) => i.status !== "missing").length;
      return { ...section, items, filledCount };
    });

    const strong = allItems.filter((i) => i.status === "strong").length;
    const weak = allItems.filter((i) => i.status === "weak").length;
    const missing = allItems.filter((i) => i.status === "missing").length;
    const total = allItems.length;

    return {
      sections,
      allItems,
      counts: { strong, weak, missing, total },
    };
  }, [data]);

  const readiness = getReadinessLabel(allItems);

  const strongPct = (counts.strong / counts.total) * 100;
  const weakPct = (counts.weak / counts.total) * 100;
  const missingPct = (counts.missing / counts.total) * 100;

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Readiness Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className={`font-medium ${readiness.className}`}>
              {readiness.label}
            </span>
            <span className="text-muted-foreground">
              {counts.strong + counts.weak} / {counts.total} fields
            </span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
            {strongPct > 0 && (
              <div
                className="bg-teal-500 transition-all"
                style={{ width: `${strongPct}%` }}
              />
            )}
            {weakPct > 0 && (
              <div
                className="bg-amber-500 transition-all"
                style={{ width: `${weakPct}%` }}
              />
            )}
            {missingPct > 0 && (
              <div
                className="bg-rose-500/20 transition-all"
                style={{ width: `${missingPct}%` }}
              />
            )}
          </div>
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {section.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {section.filledCount}/{section.fields.length}
                </span>
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li
                    key={item.field}
                    className="flex items-center gap-2 text-xs"
                  >
                    <StatusIcon status={item.status} />
                    <span
                      className={
                        item.status === "missing"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      }
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
