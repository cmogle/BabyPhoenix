"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { ProposalFormData } from "@/lib/actions/proposals";
import { PROPOSAL_FIELDS } from "@/lib/types";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

type ExtractionResult = {
  extracted: Record<string, unknown> & {
    confidence?: Record<string, "high" | "medium" | "low">;
    gaps?: string[];
    warnings?: string[];
    sourceContext?: string;
  };
};

type Props = {
  onAccept: (data: ProposalFormData) => void;
  onCancel: () => void;
};

const CONFIDENCE_CONFIG = {
  high: {
    label: "High",
    className: "bg-teal-500/15 text-teal-500 border-teal-500/20",
    icon: CheckCircle2,
  },
  medium: {
    label: "Review",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/20",
    icon: AlertTriangle,
  },
  low: {
    label: "Low",
    className: "bg-rose-500/15 text-rose-500 border-rose-500/20",
    icon: AlertCircle,
  },
};

const REQUIRED_FIELDS = [
  "title",
  "eventType",
  "format",
  "proposedTiming",
  "targetSegment",
  "buyerRoles",
  "geography",
  "audienceSize",
  "productFocus",
  "strategicRationale",
  "objective",
  "successMetrics",
  "budgetRange",
  "owner",
  "dependencies",
];

export function DocumentImport({ onAccept, onCancel }: Props) {
  const [rawText, setRawText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  async function handleExtract() {
    if (rawText.trim().length < 20) {
      toast.error("Please paste more content — at least a few sentences");
      return;
    }
    setExtracting(true);
    try {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Extraction failed");
        return;
      }
      const data = await res.json();
      setResult(data);
      toast.success("Fields extracted — review below");
    } catch {
      toast.error("Network error during extraction");
    } finally {
      setExtracting(false);
    }
  }

  function handleAccept() {
    if (!result) return;
    const { confidence, gaps, warnings, sourceContext, ...formData } =
      result.extracted;
    onAccept(formData as unknown as ProposalFormData);
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Import Existing Plan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Paste an existing event plan, campaign brief, email thread, or
            meeting notes. The AI will extract structured proposal fields and
            show what&apos;s missing.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Paste your existing event plan here...\n\nExamples of what works:\n• Email proposing an event\n• Campaign brief or plan document\n• Meeting notes about an upcoming event\n• Slide deck text (copy from PowerPoint)\n• Even rough notes or ideas`}
            rows={12}
            className="font-mono text-sm"
          />
          <div className="flex gap-3">
            <Button
              onClick={handleExtract}
              disabled={extracting || rawText.trim().length < 20}
            >
              {extracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting fields...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Extract &amp; Review
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Start from blank form instead
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { extracted } = result;
  const confidence = (extracted.confidence ?? {}) as Record<
    string,
    "high" | "medium" | "low"
  >;
  const gaps = (extracted.gaps ?? []) as string[];
  const warnings = (extracted.warnings ?? []) as string[];

  const extractedFields = Object.entries(PROPOSAL_FIELDS).filter(([key]) => {
    const val = extracted[key];
    if (val === null || val === undefined || val === "") return false;
    if (Array.isArray(val) && val.length === 0) return false;
    return true;
  });
  const missingRequired = REQUIRED_FIELDS.filter((key) => {
    const val = extracted[key];
    if (val === null || val === undefined || val === "") return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Extraction Results</CardTitle>
            {extracted.sourceContext && (
              <Badge variant="outline" className="text-xs">
                {String(extracted.sourceContext)}
              </Badge>
            )}
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-teal-500">
              {extractedFields.length} fields extracted
            </span>
            <span className="text-rose-500">
              {missingRequired.length} required fields missing
            </span>
          </div>
        </CardHeader>
      </Card>

      {warnings.length > 0 && (
        <Card className="border-amber-500/30">
          <CardContent className="pt-4">
            <h4 className="text-sm font-medium text-amber-500 mb-2">
              Compliance Warnings
            </h4>
            <ul className="space-y-1">
              {warnings.map((w, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {missingRequired.length > 0 && (
        <Card className="border-rose-500/30">
          <CardContent className="pt-4">
            <h4 className="text-sm font-medium text-rose-500 mb-2">
              Missing Required Fields
            </h4>
            <p className="text-xs text-muted-foreground mb-2">
              These weren&apos;t found in the source material. You&apos;ll need
              to add them in the form.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {missingRequired.map((key) => (
                <Badge
                  key={key}
                  variant="outline"
                  className="text-rose-500 border-rose-500/30"
                >
                  {PROPOSAL_FIELDS[key as keyof typeof PROPOSAL_FIELDS] ?? key}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Extracted Fields</CardTitle>
          <p className="text-xs text-muted-foreground">
            Review what was extracted. You can edit everything in the next step.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {extractedFields.map(([key, label]) => {
            const value = extracted[key];
            const conf = confidence[key] ?? "medium";
            const ConfIcon = CONFIDENCE_CONFIG[conf].icon;
            const displayValue = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            return (
              <div
                key={key}
                className="flex items-start gap-3 rounded-md border p-3"
              >
                <ConfIcon
                  className={`h-4 w-4 shrink-0 mt-0.5 ${
                    conf === "high"
                      ? "text-teal-500"
                      : conf === "medium"
                        ? "text-amber-500"
                        : "text-rose-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {label}
                    </span>
                    <Badge
                      className={`text-[10px] h-4 ${CONFIDENCE_CONFIG[conf].className}`}
                    >
                      {CONFIDENCE_CONFIG[conf].label}
                    </Badge>
                  </div>
                  <p className="text-sm mt-0.5 break-words">{displayValue}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-2">
        <Button onClick={handleAccept}>
          Accept &amp; Continue to Form
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => setResult(null)}>
          Try different text
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Start from blank form
        </Button>
      </div>
    </div>
  );
}
