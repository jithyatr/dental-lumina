import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type Part = { text: string };
type HistoryItem = { role: "user" | "model"; parts: Part[] };
type ChatRequest = { message: string; history?: HistoryItem[] };

const MODELS = (process.env.GEMINI_MODEL ?? "gemini-2.5-flash,gemini-2.0-flash,gemini-flash-latest")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

async function callGemini(
  model: string,
  apiKey: string,
  contents: { role: "user" | "model"; parts: Part[] }[]
) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
    }),
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
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
    const upstream = await callGemini(model, apiKey, contents);
    if (upstream.status === 429) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    if (upstream.ok) {
      const data = (await upstream.json()) as {
        candidates?: { content?: { parts?: Part[] } }[];
      };
      const reply =
        data.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("")
          .trim() ?? "";
      return NextResponse.json({ reply });
    }
    lastError = await upstream.text();
    // 503 = model overloaded → try next model
    if (upstream.status !== 503) break;
  }

  return NextResponse.json(
    { error: "Gemini error", detail: lastError.slice(0, 400) },
    { status: 502 }
  );
}
