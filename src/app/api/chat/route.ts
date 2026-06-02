import { NextRequest, NextResponse } from "next/server";
import { createGenAI } from "@/lib/genai";

export const runtime = "nodejs";

type Part = { text: string };
type HistoryItem = { role: "user" | "model"; parts: Part[] };
type ChatRequest = { message: string; history?: HistoryItem[] };

const MODELS = (process.env.GEMINI_MODEL ?? "gemini-2.5-flash,gemini-2.0-flash,gemini-flash-latest")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

/** Pull the HTTP status out of a @google/genai ApiError, when present. */
function errStatus(err: unknown): number | undefined {
  const status = (err as { status?: unknown })?.status;
  return typeof status === "number" ? status : undefined;
}

export async function POST(req: NextRequest) {
  let ai;
  try {
    ai = createGenAI();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message?.toString().trim();
  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const history = Array.isArray(body.history) ? body.history : [];
  const contents = [
    ...history,
    { role: "user" as const, parts: [{ text: message }] },
  ];

  let lastError = "";
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: { temperature: 0.4, maxOutputTokens: 1024 },
      });
      const reply = (response.text ?? "").trim();
      return NextResponse.json({ reply });
    } catch (err) {
      const status = errStatus(err);
      if (status === 429) {
        return NextResponse.json({ error: "Rate limited" }, { status: 429 });
      }
      lastError = err instanceof Error ? err.message : String(err);
      // 503 = model overloaded → try next model; anything else → give up
      if (status !== 503) break;
    }
  }

  return NextResponse.json(
    { error: "Gemini error", detail: lastError.slice(0, 400) },
    { status: 502 }
  );
}
