import { NextResponse } from "next/server";
import { OPENAI_MODEL, resolveOpenAiModel } from "@/lib/ai/model";

export const dynamic = "force-dynamic";

export async function GET() {
  const rawModel = process.env.OPENAI_MODEL ?? "";
  return NextResponse.json(
    {
      configured: Boolean(process.env.OPENAI_API_KEY),
      model: OPENAI_MODEL,
      rawModel: rawModel || "gpt-5-mini",
      normalized: resolveOpenAiModel(rawModel) !== (rawModel || "gpt-5-mini")
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
