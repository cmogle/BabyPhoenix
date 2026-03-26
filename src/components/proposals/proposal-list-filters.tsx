"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");

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
      <select
        className="h-8 w-44 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none dark:bg-input/30"
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setFilter("status", e.target.value);
        }}
      >
        {READINESS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
