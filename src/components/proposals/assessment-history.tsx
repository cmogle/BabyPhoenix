import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, History } from "lucide-react";

type HistoryEntry = {
  version: number;
  createdAt: Date;
  assessment: {
    status: "not_ready" | "partially_ready" | "ready_for_review";
    findings: Array<{ status: string }>;
  } | null;
};

const STATUS_CONFIG = {
  not_ready: {
    label: "Not Ready",
    className: "bg-rose-500/15 text-rose-500 border-rose-500/20",
    order: 0,
  },
  partially_ready: {
    label: "Partially Ready",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/20",
    order: 1,
  },
  ready_for_review: {
    label: "Ready for Review",
    className: "bg-teal-500/15 text-teal-500 border-teal-500/20",
    order: 2,
  },
};

function statusOrder(s: string): number {
  return STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.order ?? -1;
}

export function AssessmentHistory({ history }: { history: HistoryEntry[] }) {
  const assessed = history.filter((h) => h.assessment);
  if (assessed.length <= 1) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Assessment History
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          How this proposal&apos;s readiness has evolved across versions.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {assessed.map((entry, i) => {
            const prev = i < assessed.length - 1 ? assessed[i + 1] : null;
            const config = entry.assessment
              ? STATUS_CONFIG[entry.assessment.status]
              : null;
            const prevOrder = prev?.assessment
              ? statusOrder(prev.assessment.status)
              : -1;
            const currOrder = entry.assessment
              ? statusOrder(entry.assessment.status)
              : -1;

            const trend =
              prev?.assessment == null
                ? null
                : currOrder > prevOrder
                  ? "up"
                  : currOrder < prevOrder
                    ? "down"
                    : "same";

            const findings = (entry.assessment?.findings ?? []) as Array<{
              status: string;
            }>;
            const strongCount = findings.filter(
              (f) => f.status === "strong"
            ).length;
            const weakCount = findings.filter(
              (f) => f.status === "weak"
            ).length;
            const missingCount = findings.filter(
              (f) => f.status === "missing"
            ).length;

            return (
              <div
                key={entry.version}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-mono font-medium">
                  v{entry.version}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {config && (
                      <Badge
                        className={`text-[10px] h-4 ${config.className}`}
                      >
                        {config.label}
                      </Badge>
                    )}
                    {trend === "up" && (
                      <TrendingUp className="h-3.5 w-3.5 text-teal-500" />
                    )}
                    {trend === "down" && (
                      <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                    )}
                    {trend === "same" && (
                      <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex gap-3 text-[11px] text-muted-foreground mt-0.5">
                    <span>{strongCount} strong</span>
                    <span>{weakCount} weak</span>
                    <span>{missingCount} missing</span>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
