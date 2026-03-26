"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  completed?: number;
  total?: number;
};

export function ProposalFormSection({
  title,
  children,
  defaultOpen = true,
  completed,
  total,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {total !== undefined && total > 0 && (
            <span className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              completed === total
                ? "bg-teal-500/15 text-teal-500"
                : "bg-muted text-muted-foreground"
            )}>
              {completed}/{total}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <div className="space-y-4 p-4 pt-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
