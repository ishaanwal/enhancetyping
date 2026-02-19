import { NextResponse } from "next/server";
import { z } from "zod";
import { getQuoteSnippet, getWordsSnippet } from "@/lib/typing";

const querySchema = z.object({
  source: z.enum(["words", "quote"]).default("words"),
  wordCount: z.coerce.number().min(10).max(120).default(45)
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    source: searchParams.get("source") ?? "words",
    wordCount: searchParams.get("wordCount") ?? 45
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query." }, { status: 400 });
  }

  const { source, wordCount } = parsed.data;
  if (source === "quote") {
    const quote = await getQuoteSnippet();
    return NextResponse.json({ source: "quote", ...quote });
  }

  const text = await getWordsSnippet(wordCount);
  return NextResponse.json({ source: "words", text });
}
