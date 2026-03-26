"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { PROPOSAL_FIELDS, type ProposalFieldKey } from "@/lib/types";
import type { ProposalFormData } from "@/lib/actions/proposals";

const TRACKED_FIELDS: ProposalFieldKey[] = [
  "title",
  "eventType",
  "format",
  "proposedTiming",
  "targetSegment",
  "buyerRoles",
  "geography",
  "productFocus",
  "strategicRationale",
  "objective",
  "successMetrics",
  "budgetRange",
  "owner",
];

function isFieldFilled(data: ProposalFormData, field: ProposalFieldKey): boolean {
  const value = (data as Record<string, unknown>)[field];
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === "string" && value.trim().length < 2) return false;
  return true;
}

export function ReadinessPreview({ data }: { data: ProposalFormData }) {
  const { filled, total, items } = useMemo(() => {
    const items = TRACKED_FIELDS.map((field) => ({
      field,
      label: PROPOSAL_FIELDS[field],
      filled: isFieldFilled(data, field),
    }));
    const filled = items.filter((i) => i.filled).length;
    return { filled, total: items.length, items };
  }, [data]);

  const percentage = Math.round((filled / total) * 100);

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Readiness Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {filled} / {total} fields
            </span>
            <span>{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <ul className="space-y-1">
          {items.map((item) => (
            <li
              key={item.field}
              className="flex items-center gap-2 text-xs"
            >
              {item.filled ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span
                className={
                  item.filled ? "text-foreground" : "text-muted-foreground"
                }
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
