import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Assessment } from "@/lib/types";
import type { FieldRuleFinding } from "@/lib/readiness/rules-engine";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const STATUS_CONFIG = {
  not_ready: {
    label: "Not Ready",
    variant: "destructive" as const,
    icon: AlertCircle,
  },
  partially_ready: {
    label: "Partially Ready",
    variant: "secondary" as const,
    icon: AlertTriangle,
  },
  ready_for_review: {
    label: "Ready for Review",
    variant: "default" as const,
    icon: CheckCircle2,
  },
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
          <Badge variant={config.variant} className="gap-1">
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {missing.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-destructive mb-2">
              Missing
            </h4>
            <ul className="space-y-1.5">
              {missing.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{f.field}:</span>{" "}
                    {f.message}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {weak.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-500 mb-2">Weak</h4>
            <ul className="space-y-1.5">
              {weak.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">{f.field}:</span>{" "}
                    {f.message}
                    {f.suggestion && (
                      <p className="text-muted-foreground mt-0.5">
                        {f.suggestion}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {strong.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-500 mb-2">Strong</h4>
            <ul className="space-y-1.5">
              {strong.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
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
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
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
