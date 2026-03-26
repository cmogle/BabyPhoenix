import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  not_ready: { label: "Not Ready", variant: "destructive" },
  partially_ready: { label: "Partially Ready", variant: "secondary" },
  ready_for_review: { label: "Ready for Review", variant: "default" },
};

export function ProposalList({
  proposals,
}: {
  proposals: ProposalWithDetails[];
}) {
  if (proposals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No proposals yet. Create your first event proposal to get started.
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {proposals.map((proposal) => {
          const status = proposal.assessment?.status;
          const badge = status ? STATUS_BADGES[status] : null;

          return (
            <TableRow key={proposal.id}>
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
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                ) : (
                  <Badge variant="outline">Not Assessed</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {proposal.version.owner || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(proposal.updatedAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
