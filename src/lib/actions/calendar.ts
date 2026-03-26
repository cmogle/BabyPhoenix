"use server";

import { db } from "@/lib/db";

export type CalendarEvent = {
  id: string;
  title: string;
  eventType: string | null;
  geography: string | null;
  targetSegment: string | null;
  proposedTiming: string | null;
  budgetRange: string | null;
  owner: string | null;
  readinessStatus: "not_ready" | "partially_ready" | "ready_for_review" | null;
  isExemplar: boolean;
  quarter: string | null;
  month: number | null;
  year: number | null;
};

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const QUARTER_MONTHS: Record<string, number[]> = {
  Q1: [1, 2, 3],
  Q2: [4, 5, 6],
  Q3: [7, 8, 9],
  Q4: [10, 11, 12],
};

function parseTiming(timing: string | null): {
  quarter: string | null;
  month: number | null;
  year: number | null;
} {
  if (!timing) return { quarter: null, month: null, year: null };
  const lower = timing.toLowerCase();

  const yearMatch = lower.match(/20\d{2}/);
  const year = yearMatch ? parseInt(yearMatch[0]) : null;

  const quarterMatch = lower.match(/q([1-4])/i);
  const quarter = quarterMatch ? `Q${quarterMatch[1]}` : null;

  let month: number | null = null;
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (
      lower.includes(MONTH_NAMES[i]) ||
      lower.includes(MONTH_NAMES[i].slice(0, 3))
    ) {
      month = i + 1;
      break;
    }
  }

  if (!month && quarter) {
    month = QUARTER_MONTHS[quarter][0];
  }

  return { quarter, month, year };
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const results = await db.query.proposals.findMany({
    with: {
      versions: {
        orderBy: (v, { desc }) => [desc(v.version)],
        limit: 1,
        with: {
          assessments: {
            orderBy: (a, { desc }) => [desc(a.createdAt)],
            limit: 1,
          },
        },
      },
    },
    orderBy: (p, { desc }) => [desc(p.updatedAt)],
  });

  return results
    .filter((p) => p.versions.length > 0)
    .map((p) => {
      const v = p.versions[0];
      const a = v.assessments[0] ?? null;
      const parsed = parseTiming(v.proposedTiming);

      return {
        id: p.id,
        title: v.title ?? "Untitled",
        eventType: v.eventType,
        geography: v.geography,
        targetSegment: v.targetSegment,
        proposedTiming: v.proposedTiming,
        budgetRange: v.budgetRange,
        owner: v.owner,
        readinessStatus: a?.status ?? null,
        isExemplar: p.isExemplar,
        ...parsed,
      };
    });
}

export type ConflictWarning = {
  type: "timing" | "geography" | "segment";
  message: string;
  eventIds: string[];
};

export async function detectConflicts(
  events: CalendarEvent[]
): Promise<ConflictWarning[]> {
  const warnings: ConflictWarning[] = [];

  const byPeriod = new Map<string, CalendarEvent[]>();
  for (const ev of events) {
    if (ev.month && ev.year) {
      const key = `${ev.year}-M${ev.month}`;
      if (!byPeriod.has(key)) byPeriod.set(key, []);
      byPeriod.get(key)!.push(ev);
    } else if (ev.quarter && ev.year) {
      const key = `${ev.year}-${ev.quarter}`;
      if (!byPeriod.has(key)) byPeriod.set(key, []);
      byPeriod.get(key)!.push(ev);
    }
  }

  for (const [period, periodEvents] of byPeriod) {
    // Same geography
    const byGeo = new Map<string, CalendarEvent[]>();
    for (const ev of periodEvents) {
      if (ev.geography) {
        const geo = ev.geography.toLowerCase();
        if (!byGeo.has(geo)) byGeo.set(geo, []);
        byGeo.get(geo)!.push(ev);
      }
    }
    for (const [geo, geoEvents] of byGeo) {
      if (geoEvents.length >= 2) {
        warnings.push({
          type: "geography",
          message: `${geoEvents.length} events in ${geo} during ${period}: ${geoEvents.map((e) => e.title).join(", ")}`,
          eventIds: geoEvents.map((e) => e.id),
        });
      }
    }

    // Same segment
    const bySeg = new Map<string, CalendarEvent[]>();
    for (const ev of periodEvents) {
      if (ev.targetSegment) {
        const seg = ev.targetSegment.toLowerCase();
        if (!bySeg.has(seg)) bySeg.set(seg, []);
        bySeg.get(seg)!.push(ev);
      }
    }
    for (const [, segEvents] of bySeg) {
      if (segEvents.length >= 2) {
        warnings.push({
          type: "segment",
          message: `${segEvents.length} events targeting same segment during ${period}: ${segEvents.map((e) => e.title).join(", ")}`,
          eventIds: segEvents.map((e) => e.id),
        });
      }
    }

    // Density
    if (period.includes("-M") && periodEvents.length >= 3) {
      warnings.push({
        type: "timing",
        message: `High density: ${periodEvents.length} events in ${period}`,
        eventIds: periodEvents.map((e) => e.id),
      });
    }
  }

  // Dedup
  const seen = new Set<string>();
  return warnings.filter((w) => {
    const key = w.eventIds.sort().join(",") + w.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
