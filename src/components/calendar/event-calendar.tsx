"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CalendarEvent, ConflictWarning } from "@/lib/actions/calendar";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  MapPin,
  Users,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  not_ready: "border-l-rose-500",
  partially_ready: "border-l-amber-500",
  ready_for_review: "border-l-teal-500",
  null: "border-l-muted-foreground/50",
};

const STATUS_LABELS: Record<string, string> = {
  not_ready: "Not Ready",
  partially_ready: "Partially Ready",
  ready_for_review: "Ready",
  null: "Unassessed",
};

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

type Props = {
  events: CalendarEvent[];
  conflicts: ConflictWarning[];
};

export function EventCalendar({ events, conflicts }: Props) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const years = events
    .map((e) => e.year)
    .filter((y): y is number => y !== null);
  const currentYear = new Date().getFullYear();
  const displayYear = years.length > 0 ? Math.min(...years) : currentYear;

  const visibleEvents = events.filter((e) => !hiddenIds.has(e.id));

  const byQuarter: Record<string, CalendarEvent[]> = {
    Q1: [],
    Q2: [],
    Q3: [],
    Q4: [],
    unplaced: [],
  };
  for (const ev of visibleEvents) {
    if (ev.year === displayYear && ev.quarter) {
      byQuarter[ev.quarter].push(ev);
    } else if (ev.year === displayYear && ev.month) {
      const q =
        ev.month <= 3
          ? "Q1"
          : ev.month <= 6
            ? "Q2"
            : ev.month <= 9
              ? "Q3"
              : "Q4";
      byQuarter[q].push(ev);
    } else {
      byQuarter.unplaced.push(ev);
    }
  }

  // Portfolio stats
  const byType = new Map<string, number>();
  const byGeo = new Map<string, number>();
  const byStatus = new Map<string, number>();
  for (const ev of visibleEvents) {
    byType.set(ev.eventType ?? "Unknown", (byType.get(ev.eventType ?? "Unknown") ?? 0) + 1);
    byGeo.set(ev.geography ?? "Unknown", (byGeo.get(ev.geography ?? "Unknown") ?? 0) + 1);
    const s = ev.readinessStatus ?? "null";
    byStatus.set(s, (byStatus.get(s) ?? 0) + 1);
  }

  function toggleEvent(id: string) {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const maxPerQuarter = Math.max(
    ...QUARTERS.map((q) => byQuarter[q].length),
    1
  );

  return (
    <div className="space-y-4">
      {conflicts.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              Portfolio Conflicts ({conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {conflicts.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Badge
                  variant="outline"
                  className="text-[9px] h-4 shrink-0 mt-0.5"
                >
                  {c.type}
                </Badge>
                <span className="text-muted-foreground">{c.message}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            {displayYear} Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {QUARTERS.map((q) => {
              const qEvents = byQuarter[q];
              const density = qEvents.length / maxPerQuarter;

              return (
                <div key={q} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{q}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {qEvents.length} event{qEvents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        density > 0.7
                          ? "bg-rose-500"
                          : density > 0.4
                            ? "bg-amber-500"
                            : "bg-teal-500"
                      }`}
                      style={{ width: `${Math.max(density * 100, 2)}%` }}
                    />
                  </div>
                  <div className="space-y-1.5 min-h-[60px]">
                    {qEvents.length === 0 && (
                      <div className="flex h-[60px] items-center justify-center rounded border border-dashed text-[10px] text-muted-foreground">
                        No events
                      </div>
                    )}
                    {qEvents.map((ev) => (
                      <Link
                        key={ev.id}
                        href={`/proposals/${ev.id}`}
                        className="block"
                      >
                        <div
                          className={`rounded-md border-l-[3px] border p-2 text-xs hover:bg-accent/50 transition-colors ${
                            STATUS_COLORS[ev.readinessStatus ?? "null"]
                          }`}
                        >
                          <div className="font-medium truncate">
                            {ev.title}
                          </div>
                          <div className="flex gap-1.5 mt-0.5 text-muted-foreground">
                            {ev.geography && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-2.5 w-2.5" />
                                {ev.geography}
                              </span>
                            )}
                            {ev.eventType && <span>{ev.eventType}</span>}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {byQuarter.unplaced.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-2">
                  Timing not parsed ({byQuarter.unplaced.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {byQuarter.unplaced.map((ev) => (
                    <Link key={ev.id} href={`/proposals/${ev.id}`}>
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-accent/50"
                      >
                        {ev.title}
                        {ev.proposedTiming && (
                          <span className="ml-1 text-muted-foreground">
                            ({ev.proposedTiming})
                          </span>
                        )}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              By Type
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {[...byType.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate">{type}</span>
                  <span className="text-muted-foreground tabular-nums font-mono">
                    {count}
                  </span>
                </div>
              ))}
            {byType.size === 0 && (
              <p className="text-[10px] text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              By Geography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {[...byGeo.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([geo, count]) => (
                <div
                  key={geo}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="truncate">{geo}</span>
                  <span className="text-muted-foreground tabular-nums font-mono">
                    {count}
                  </span>
                </div>
              ))}
            {byGeo.size === 0 && (
              <p className="text-[10px] text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              By Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {[...byStatus.entries()].map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between text-xs"
              >
                <span>{STATUS_LABELS[status] ?? status}</span>
                <span className="text-muted-foreground tabular-nums font-mono">
                  {count}
                </span>
              </div>
            ))}
            {byStatus.size === 0 && (
              <p className="text-[10px] text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {events.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              What-If: Toggle Events
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Hide/show events to see how the portfolio changes
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => toggleEvent(ev.id)}
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors ${
                    hiddenIds.has(ev.id)
                      ? "opacity-40 line-through"
                      : "hover:bg-accent/50"
                  }`}
                >
                  {hiddenIds.has(ev.id) ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                  {ev.title}
                </button>
              ))}
            </div>
            {hiddenIds.size > 0 && (
              <button
                onClick={() => setHiddenIds(new Set())}
                className="mt-2 text-[10px] text-primary hover:underline"
              >
                Show all events
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
