"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  fieldName: string;
  context: Record<string, unknown>;
};

export function AiAssistedField({
  value,
  onChange,
  placeholder,
  rows = 3,
  fieldName,
  context,
}: Props) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkField = useCallback(
    async (currentValue: string) => {
      if (!currentValue || currentValue.trim().length < 5) {
        setSuggestion(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/ai/field-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field: fieldName,
            value: currentValue,
            context,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setSuggestion(data.suggestion);
        }
      } catch {
        // Silently fail — AI assistance is non-blocking
      } finally {
        setLoading(false);
      }
    },
    [fieldName, context]
  );

  return (
    <div className="space-y-1.5">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => checkField(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      {loading && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 animate-pulse" />
          Checking...
        </div>
      )}
      {suggestion && !loading && (
        <div
          className={cn(
            "flex items-start gap-1.5 rounded-md border px-3 py-2 text-xs",
            "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
          )}
        >
          <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
          <span>{suggestion}</span>
        </div>
      )}
    </div>
  );
}
