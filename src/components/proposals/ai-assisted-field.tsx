"use client";

import { useState, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Sparkles, X } from "lucide-react";

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
  const [checked, setChecked] = useState(false);

  const checkField = useCallback(
    async (currentValue: string) => {
      if (!currentValue || currentValue.trim().length < 5) {
        setSuggestion(null);
        setChecked(false);
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
          setChecked(true);
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
        onChange={(e) => { setChecked(false); onChange(e.target.value); }}
        onBlur={(e) => checkField(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex gap-0.5">
            <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
            <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
            <span className="h-1 w-1 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
          </span>
          Analyzing {fieldName.toLowerCase()}...
        </div>
      )}
      {suggestion && !loading && (
        <div className="flex items-start gap-1.5 rounded-md border px-3 py-2 text-xs bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
          <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
          <span className="flex-1">{suggestion}</span>
          <button
            onClick={() => setSuggestion(null)}
            className="shrink-0 hover:text-foreground transition-colors"
            aria-label="Dismiss suggestion"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      {checked && !suggestion && !loading && value.trim().length >= 5 && (
        <div className="flex items-center gap-1.5 text-xs text-teal-500">
          <CheckCircle2 className="h-3 w-3" />
          Looks good
        </div>
      )}
    </div>
  );
}
