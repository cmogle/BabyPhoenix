"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div>
      <div className="flex gap-3">
        <Input
          placeholder="Search proposals... (/)"
          className="max-w-xs"
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => setFilter("q", e.target.value)}
        />
        <Select
          value={status}
          onValueChange={(value) => {
            const v = value ?? "all";
            setStatus(v);
            setFilter("status", v);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Statuses" />
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
      {status !== "all" && (
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            Status: {READINESS_OPTIONS.find(o => o.value === status)?.label}
            <button onClick={() => { setStatus("all"); setFilter("status", "all"); }} className="ml-1 hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
}
