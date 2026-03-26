import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { taxonomyEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const EXTRACTION_SYSTEM_PROMPT = `You are an expert at extracting structured event proposal data from unstructured marketing documents.

Given raw text (from an email, brief, deck, meeting notes, or plan), extract as many of these fields as possible:

- title: Event title
- eventType: Type of event (e.g., Executive Dinner, Conference, Webinar, Client Roundtable)
- format: Event format details (e.g., Seated dinner with keynote, Panel discussion)
- proposedTiming: When the event is planned (e.g., Q3 2026, September 15-17)
- venueType: Type of venue
- targetSegment: Target customer segment
- buyerRoles: Array of target buyer roles (e.g., ["CFO", "Head of Treasury"])
- geography: Geographic market/region
- audienceSize: Expected audience size
- targetAccounts: Specific target accounts or criteria
- productFocus: Product or solution being promoted
- strategicRationale: Why this event matters strategically
- objective: What the event should achieve
- successMetrics: How success will be measured
- relatedCampaign: Related campaign or program
- budgetRange: Estimated budget
- owner: Who owns this event
- dependencies: Dependencies or required approvals
- partnerName: Partner organization name
- partnerRole: Partner's role (co-host, sponsor, attendee source)
- executiveParticipation: Executive involvement details
- regulatoryConsiderations: Any compliance/regulatory notes
- followUpExpectation: Post-event follow-up plan

Also provide:
- confidence: Object mapping each extracted field to "high", "medium", or "low"
- gaps: Array of field names completely missing from the source
- warnings: Array of strings noting concerns
- sourceContext: Brief note about what type of document this appears to be

Where a field value should match the organization's taxonomy, map to the closest match from the provided taxonomy.

Respond with JSON only. For fields you cannot extract, use null. For buyerRoles, always return an array.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text: rawText } = await request.json();

  if (!rawText || rawText.trim().length < 20) {
    return NextResponse.json(
      { error: "Please provide more text (minimum 20 characters)" },
      { status: 400 }
    );
  }

  const categories = await db.query.taxonomyCategories.findMany({
    with: {
      entries: {
        where: eq(taxonomyEntries.active, true),
      },
    },
  });
  const taxonomyContext = categories
    .map(
      (cat) => `${cat.name}: ${cat.entries.map((e) => e.name).join(", ")}`
    )
    .join("\n");

  const { text } = await generateText({
    model: "anthropic/claude-sonnet-4.6",
    system: EXTRACTION_SYSTEM_PROMPT,
    prompt: `Extract structured event proposal data from this document:\n\n---\n${rawText}\n---\n\nOrganization taxonomy:\n${taxonomyContext}`,
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to extract structured data" },
        { status: 500 }
      );
    }
    const extracted = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ extracted });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse extraction results" },
      { status: 500 }
    );
  }
}
