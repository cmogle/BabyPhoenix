"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const READINESS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "not_ready", label: "Not Ready" },
  { value: "partially_ready", label: "Partially Ready" },
  { value: "ready_for_review", label: "Ready for Review" },
  { value: "unassessed", label: "Not Assessed" },
];

export function ProposalListFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/proposals?${params.toString()}`);
  }

  return (
    <div className="flex gap-3">
      <Input
        placeholder="Search proposals..."
        className="max-w-xs"
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => setFilter("q", e.target.value)}
      />
      <Select
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(v) => v && setFilter("status", v)}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {READINESS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
