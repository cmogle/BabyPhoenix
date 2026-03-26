"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { upsertFieldGuidance } from "@/lib/actions/knowledge";
import { toast } from "sonner";
import { Save, ChevronDown, ChevronRight } from "lucide-react";

type GuidanceEntry = {
  id: string;
  fieldKey: string;
  title: string;
  guidance: string;
  examples: string[] | null;
  antiPatterns: string[] | null;
  active: boolean;
};

type Props = {
  fields: Record<string, string>;
  existingGuidance: GuidanceEntry[];
};

export function GuidanceManager({ fields, existingGuidance }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const guidanceMap = new Map(
    existingGuidance.map((g) => [g.fieldKey, g])
  );

  return (
    <div className="space-y-2 max-w-2xl">
      {Object.entries(fields).map(([key, label]) => {
        const existing = guidanceMap.get(key);
        const isExpanded = expanded === key;

        return (
          <Card key={key}>
            <button
              className="w-full text-left"
              onClick={() => setExpanded(isExpanded ? null : key)}
            >
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  {existing ? (
                    <Badge className="bg-teal-500/15 text-teal-500 border-teal-500/20 text-[10px]">
                      Configured
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      No guidance
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </button>
            {isExpanded && (
              <GuidanceForm
                fieldKey={key}
                fieldLabel={label}
                existing={existing}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}

function GuidanceForm({
  fieldKey,
  fieldLabel,
  existing,
}: {
  fieldKey: string;
  fieldLabel: string;
  existing?: GuidanceEntry;
}) {
  const [title, setTitle] = useState(
    existing?.title ?? `How to write a good ${fieldLabel}`
  );
  const [guidance, setGuidance] = useState(existing?.guidance ?? "");
  const [examplesText, setExamplesText] = useState(
    (existing?.examples ?? []).join("\n")
  );
  const [antiPatternsText, setAntiPatternsText] = useState(
    (existing?.antiPatterns ?? []).join("\n")
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await upsertFieldGuidance(fieldKey, {
        title,
        guidance,
        examples: examplesText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        antiPatterns: antiPatternsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success(`Guidance saved for ${fieldLabel}`);
    } catch {
      toast.error("Failed to save guidance");
    } finally {
      setSaving(false);
    }
  }

  return (
    <CardContent className="space-y-3 pt-0">
      <Separator />
      <div className="space-y-2">
        <Label className="text-xs">Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., How to write a good Strategic Rationale"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Guidance text</Label>
        <Textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder="Explain what this field should contain and why it matters..."
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Good examples (one per line)</Label>
        <Textarea
          value={examplesText}
          onChange={(e) => setExamplesText(e.target.value)}
          placeholder={`e.g., "Generate 15 qualified pipeline meetings with enterprise treasurers in APAC"`}
          rows={3}
          className="font-mono text-xs"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">
          Anti-patterns — what NOT to do (one per line)
        </Label>
        <Textarea
          value={antiPatternsText}
          onChange={(e) => setAntiPatternsText(e.target.value)}
          placeholder={`e.g., "Raise awareness" — too vague, not measurable`}
          rows={3}
          className="font-mono text-xs"
        />
      </div>
      <Button
        size="sm"
        onClick={handleSave}
        disabled={saving || !guidance.trim()}
      >
        <Save className="mr-1.5 h-3.5 w-3.5" />
        {saving ? "Saving..." : "Save guidance"}
      </Button>
    </CardContent>
  );
}
