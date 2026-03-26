import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { FIELD_ASSIST_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { field, value, context } = await request.json();

  if (!value || value.trim().length < 5) {
    return NextResponse.json({ assessment: null, suggestion: null });
  }

  const { text } = await generateText({
    model: "anthropic/claude-haiku-4.5",
    system: FIELD_ASSIST_SYSTEM_PROMPT,
    prompt: `Field: ${field}
Current value: "${value}"
Proposal context so far: ${JSON.stringify(context)}

Assess this field value and suggest improvements if needed.`,
  });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ assessment: null, suggestion: null });
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ assessment: null, suggestion: null });
  }
}
