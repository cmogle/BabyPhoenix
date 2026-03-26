"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Printer } from "lucide-react";

export function ProposalActions({ proposalId }: { proposalId: string }) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Print / PDF
      </Button>
      <Button size="sm" render={<Link href={`/proposals/${proposalId}/edit`} />}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
    </div>
  );
}
