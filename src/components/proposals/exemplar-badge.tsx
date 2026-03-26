"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleExemplar } from "@/lib/actions/knowledge";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { useState } from "react";

export function ExemplarBadge({ isExemplar }: { isExemplar: boolean }) {
  if (!isExemplar) return null;
  return (
    <Badge className="gap-1 bg-amber-500/15 text-amber-600 border-amber-500/20">
      <Star className="h-3 w-3 fill-current" />
      Exemplar
    </Badge>
  );
}

export function ExemplarToggle({
  proposalId,
  isExemplar: initial,
}: {
  proposalId: string;
  isExemplar: boolean;
}) {
  const [isExemplar, setIsExemplar] = useState(initial);
  const [toggling, setToggling] = useState(false);

  async function handleToggle() {
    setToggling(true);
    try {
      await toggleExemplar(proposalId);
      setIsExemplar(!isExemplar);
      toast.success(
        isExemplar
          ? "Removed exemplar status"
          : "Marked as exemplar — visible to all submitters as a gold standard"
      );
    } catch {
      toast.error("Failed to update");
    } finally {
      setToggling(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={toggling}
      className={isExemplar ? "text-amber-600 border-amber-500/30" : ""}
    >
      <Star
        className={`mr-1.5 h-3.5 w-3.5 ${isExemplar ? "fill-current" : ""}`}
      />
      {isExemplar ? "Remove Exemplar" : "Mark as Exemplar"}
    </Button>
  );
}
