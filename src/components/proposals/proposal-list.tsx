import Link from "next/link";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProposalWithDetails } from "@/lib/types";

const STATUS_BADGES: Record<
  string,
  { label: string; className: string }
> = {
  not_ready: { label: "Not Ready", className: "bg-rose-500/15 text-rose-500 border-rose-500/20" },
  partially_ready: { label: "Partially Ready", className: "bg-amber-500/15 text-amber-500 border-amber-500/20" },
  ready_for_review: { label: "Ready for Review", className: "bg-teal-500/15 text-teal-500 border-teal-500/20" },
};

export function ProposalList({
  proposals,
}: {
  proposals: ProposalWithDetails[];
}) {
  if (proposals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
        <h3 className="text-sm font-medium mb-1">No proposals yet</h3>
        <p className="text-xs text-muted-foreground mb-4">Create your first event proposal to get started.</p>
        <Button size="sm" render={<Link href="/proposals/new" />}>
          Create Proposal
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Event Type</TableHead>
          <TableHead>Region</TableHead>
          <TableHead>Readiness</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-0" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposals.map((proposal) => {
          const status = proposal.assessment?.status;
          const badge = status ? STATUS_BADGES[status] : null;

          return (
            <TableRow key={proposal.id} className="group hover:bg-accent/30 transition-colors cursor-pointer">
              <TableCell>
                <Link
                  href={`/proposals/${proposal.id}`}
                  className="font-medium hover:underline"
                >
                  {proposal.version.title || "Untitled Proposal"}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {proposal.version.eventType || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {proposal.version.geography || "—"}
              </TableCell>
              <TableCell>
                {badge ? (
                  <Badge className={badge.className}>{badge.label}</Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">Not Assessed</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {proposal.version.owner || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(proposal.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" render={<Link href={`/proposals/${proposal.id}`} />}>
                    View
                  </Button>
                  <Button variant="ghost" size="sm" render={<Link href={`/proposals/${proposal.id}/edit`} />}>
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
