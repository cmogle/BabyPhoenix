"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

// Field guidance data — domain knowledge for financial services event proposals
const FIELD_GUIDANCE: Record<string, {
  description: string;
  example: string;
  tips: string[];
}> = {
  title: {
    description: "A clear, descriptive event title that communicates the purpose and audience at a glance.",
    example: "Q3 APAC Payments Executive Breakfast — Enterprise Treasury Leaders",
    tips: ["Include the quarter/timing", "Name the target audience", "Specify the geographic focus"],
  },
  eventType: {
    description: "The category of event from your organization's taxonomy. This drives conditional requirements and smart defaults.",
    example: "Executive Dinner, Client Roundtable, Conference",
    tips: ["Executive Dinners typically target 15-30 senior buyers", "Conferences need longer lead times and larger budgets"],
  },
  format: {
    description: "How the event will be structured — the agenda format and interaction model.",
    example: "Seated dinner with keynote speaker followed by moderated discussion",
    tips: ["Match format to audience seniority", "Virtual events need different engagement strategies", "Consider hybrid options for broader reach"],
  },
  proposedTiming: {
    description: "When the event should take place. Include specific dates or date ranges.",
    example: "September 15-17, 2026 (aligned with Sibos week in Singapore)",
    tips: ["Align with industry events for better attendance", "Avoid major holidays and competing events", "Allow sufficient lead time for executive-level events"],
  },
  targetSegment: {
    description: "The customer segment you're targeting — which organizations and industries.",
    example: "Enterprise Treasury & Transaction Banking",
    tips: ["Be specific about the segment", "Consider whether existing clients, prospects, or both"],
  },
  buyerRoles: {
    description: "The specific job titles and decision-making roles you want in the room.",
    example: "Head of Treasury, VP Transaction Banking, CFO",
    tips: ["Name specific titles, not just 'senior leaders'", "Include both decision-makers and influencers", "Match roles to your product's buying committee"],
  },
  geography: {
    description: "The target market or region for this event.",
    example: "APAC — Singapore, Hong Kong, Australia",
    tips: ["Specify the city for in-person events", "Consider regional regulatory requirements", "Note if this targets a specific market within a region"],
  },
  audienceSize: {
    description: "Expected number of attendees. This affects budget, venue, and format decisions.",
    example: "25-30 attendees",
    tips: ["Executive dinners: 15-30", "Roundtables: 20-40", "Conferences: 200-500", "Be realistic about achievable attendance"],
  },
  objective: {
    description: "The specific, measurable outcome this event should produce. This is the most important field — it drives the readiness assessment.",
    example: "Generate 15 qualified pipeline opportunities from enterprise treasurers evaluating cross-border payment solutions",
    tips: ["Include a number (measurable)", "Name the buyer outcome", "Connect to a product or solution", "Avoid vague goals like 'raise awareness' or 'build relationships'"],
  },
  strategicRationale: {
    description: "Why this event matters strategically. How does it advance a specific business priority?",
    example: "APAC cross-border payments is our fastest-growing segment. This event targets the top 30 enterprise treasury teams evaluating real-time settlement solutions ahead of our Q4 product launch.",
    tips: ["Link to a specific strategic priority", "Explain why this event, why now", "Quantify the opportunity if possible"],
  },
  successMetrics: {
    description: "How you'll measure whether the event achieved its objective. Metrics must directly connect to the stated objective.",
    example: "12+ qualified pipeline meetings booked within 2 weeks, $3M+ pipeline attributed, 80%+ attendee satisfaction",
    tips: ["Metrics must measure the objective, not just activity", "'Attendees' is not a success metric — it's a prerequisite", "Include both leading indicators and outcome metrics"],
  },
  budgetRange: {
    description: "Estimated total cost range for the event.",
    example: "$15,000-$25,000",
    tips: ["Include venue, catering, travel, and materials", "Budget should be proportional to audience size and format", "Executive dinners: $500-1,000 per head is typical"],
  },
  owner: {
    description: "The person accountable for this event's success.",
    example: "Jane Smith, Regional Marketing Director — APAC",
    tips: ["Name a specific person, not a team", "Include their title and region"],
  },
  dependencies: {
    description: "What needs to happen before this event can proceed? What approvals are needed?",
    example: "Budget approval from VP Marketing (by Aug 1), venue booking (by Aug 15), speaker confirmation from CEO APAC",
    tips: ["Include dates where possible", "Note any external dependencies (partners, venues)", "Flag regulatory approvals needed"],
  },
  productFocus: {
    description: "Which product or solution line this event promotes.",
    example: "Cross-Border Payments, Real-Time Settlement",
    tips: ["Select from the taxonomy", "Multiple products are fine but prioritize one"],
  },
  partnerName: {
    description: "If a partner is involved, their organization name.",
    example: "SWIFT, Temenos, Finastra",
    tips: ["If partner is named, partner role becomes required"],
  },
  partnerRole: {
    description: "How the partner participates — co-host, sponsor, or attendee source.",
    example: "Co-host providing venue and 50% of attendee list",
    tips: ["Be specific about what the partner contributes", "Clarify co-branding expectations"],
  },
};

type Props = {
  activeField: string | null;
  collapsed: boolean;
  onToggle: () => void;
};

export function SherpaPanel({ activeField, collapsed, onToggle }: Props) {
  const guidance = activeField ? FIELD_GUIDANCE[activeField] : null;

  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="flex h-full w-10 flex-col items-center justify-center gap-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        aria-label="Open Sherpa panel"
      >
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <ChevronLeft className="h-3 w-3 text-muted-foreground" />
      </button>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-500" />
            <CardTitle className="text-sm">Sherpa</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="h-6 w-6 p-0">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {guidance ? (
          <>
            <div>
              <h4 className="text-xs font-medium mb-1 text-foreground capitalize">
                {activeField?.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {guidance.description}
              </p>
            </div>
            <Separator />
            <div>
              <h5 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Example
              </h5>
              <p className="text-xs text-foreground/80 italic bg-muted/50 rounded-md px-2.5 py-2 leading-relaxed">
                {guidance.example}
              </p>
            </div>
            <div>
              <h5 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                Tips
              </h5>
              <ul className="space-y-1">
                {guidance.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-teal-500 shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              Click on a field to see guidance
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
