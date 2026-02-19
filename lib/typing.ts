import { TextSource } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ResultPayload = {
  mode: string;
  durationSeconds: number;
  textSource: TextSource;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  consistency: number;
  inputHistory?: unknown;
};

export const DURATIONS = [15, 30, 60, 120] as const;

export async function getWordsSnippet(wordCount = 45) {
  const words = await prisma.word.findMany({ select: { value: true } });
  if (!words.length) {
    return "enhancetyping demo mode starts instantly and remains stable with no external services configured";
  }

  const chosen: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const word = words[Math.floor(Math.random() * words.length)]?.value ?? "typing";
    chosen.push(word);
  }
  return chosen.join(" ");
}

export async function getQuoteSnippet() {
  const quotes = await prisma.quote.findMany({ select: { content: true, author: true } });
  if (!quotes.length) {
    return {
      content: "Type calmly, strike accurately, and speed will rise with each focused session.",
      author: "EnhanceTyping"
    };
  }

  const quote = quotes[Math.floor(Math.random() * quotes.length)]!;
  return quote;
}

export function computeConsistency(rawWpmSeries: number[]) {
  if (rawWpmSeries.length < 2) {
    return 100;
  }

  const avg = rawWpmSeries.reduce((acc, n) => acc + n, 0) / rawWpmSeries.length;
  if (avg === 0) {
    return 0;
  }

  const variance =
    rawWpmSeries.reduce((acc, n) => acc + Math.pow(n - avg, 2), 0) / rawWpmSeries.length;
  const stdDev = Math.sqrt(variance);
  const normalized = Math.max(0, 100 - (stdDev / avg) * 100);
  return Math.round(normalized * 100) / 100;
}
