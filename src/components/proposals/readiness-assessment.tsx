import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Assessment } from "@/lib/types";
import type { FieldRuleFinding } from "@/lib/readiness/rules-engine";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { DimensionalBars } from "./dimensional-bars";

const STATUS_CONFIG = {
  not_ready: { label: "Not Ready", className: "bg-rose-500/15 text-rose-500 border-rose-500/20", icon: AlertCircle },
  partially_ready: { label: "Partially Ready", className: "bg-amber-500/15 text-amber-500 border-amber-500/20", icon: AlertTriangle },
  ready_for_review: { label: "Ready for Review", className: "bg-teal-500/15 text-teal-500 border-teal-500/20", icon: CheckCircle2 },
};

export function ReadinessAssessment({
  assessment,
}: {
  assessment: Assessment;
}) {
  const config = STATUS_CONFIG[assessment.status];
  const Icon = config.icon;
  const findings = assessment.findings as FieldRuleFinding[];
  const nextActions = assessment.nextActions as string[];

  const missing = findings.filter((f) => f.status === "missing");
  const weak = findings.filter((f) => f.status === "weak");
  const strong = findings.filter((f) => f.status === "strong");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Readiness Assessment</CardTitle>
          <Badge className={`gap-1 ${config.className}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DimensionalBars findings={findings} />
        <Separator className="my-4" />
        {missing.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-rose-500 mb-2">
              Missing Information
            </h4>
            <ul className="space-y-1.5">
              {missing.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{f.field}:</span>{" "}
                    {f.message}
                    {f.suggestion && (
                      <details className="mt-1">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Why? How to improve
                        </summary>
                        <p className="text-xs text-muted-foreground mt-1 pl-1 border-l-2 border-muted">
                          {f.suggestion}
                        </p>
                      </details>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {weak.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-amber-500 mb-2">Needs Strengthening</h4>
            <ul className="space-y-1.5">
              {weak.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{f.field}:</span>{" "}
                    {f.message}
                    {f.suggestion && (
                      <details className="mt-1">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                          Why? How to improve
                        </summary>
                        <p className="text-xs text-muted-foreground mt-1 pl-1 border-l-2 border-muted">
                          {f.suggestion}
                        </p>
                      </details>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {strong.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-teal-500 mb-2">Looking Good</h4>
            <ul className="space-y-1.5">
              {strong.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{f.field}:</span>{" "}
                    {f.message}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {nextActions.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-2">Next Actions</h4>
              <ol className="space-y-1.5">
                {nextActions.map((action, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium shrink-0">
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
