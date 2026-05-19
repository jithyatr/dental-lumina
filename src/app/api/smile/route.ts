import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type SmileRequest = { imageBase64: string; prompt?: string };

const MODELS = (process.env.GEMINI_MODEL ?? "gemini-2.5-flash,gemini-2.0-flash,gemini-flash-latest")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

const SYSTEM_INSTRUCTION = `You are a cosmetic dentistry AI assistant analyzing a patient smile photo. Look at the image and respond ONLY with a valid JSON object in this exact shape (no markdown, no commentary):
{"description":"2-3 sentence professional analysis of the smile in the image, mentioning shade, alignment, gum line and any visible concerns","suggestedTreatments":["short treatment 1","short treatment 2","short treatment 3","short treatment 4"]}
Tone: warm, encouraging, professional. Never diagnose disease. If the image is not a clearly visible smile/face, set description to a polite request for a clearer front-facing smile photo and suggestedTreatments to ["Front-facing smile photo","Even lighting","Neutral background","Show teeth"].`;

function parseDataUrl(value: string): { mimeType: string; data: string } {
  if (value.startsWith("data:")) {
    const match = /^data:([^;]+);base64,(.+)$/.exec(value);
    if (match) return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: "image/jpeg", data: value };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: SmileRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.imageBase64) {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  const { mimeType, data } = parseDataUrl(body.imageBase64);
  const userPrompt = body.prompt?.toString().trim() || "Improve my smile";

  const requestBody = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    contents: [
      {
        role: "user",
        parts: [
          { text: `Patient goal: ${userPrompt}` },
          { inlineData: { mimeType, data } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.5,
      maxOutputTokens: 600,
      responseMimeType: "application/json",
    },
  });

  let raw = "";
  let lastError = "";
  let rateLimited = false;
  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: requestBody,
    });
    if (upstream.status === 429) {
      rateLimited = true;
      break;
    }
    if (upstream.ok) {
      const result = (await upstream.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      raw =
        result.candidates?.[0]?.content?.parts
          ?.map((p) => p.text ?? "")
          .join("")
          .trim() ?? "";
      break;
    }
    lastError = await upstream.text();
    if (upstream.status !== 503) break;
  }

  if (rateLimited) {
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  }
  if (!raw) {
    return NextResponse.json(
      { error: "Gemini error", detail: lastError.slice(0, 400) },
      { status: 502 }
    );
  }

  const match = /\{[\s\S]*\}/.exec(raw);
  if (!match) {
    return NextResponse.json(
      { error: "Could not parse Gemini response" },
      { status: 502 }
    );
  }

  try {
    const parsed = JSON.parse(match[0]) as {
      description?: string;
      suggestedTreatments?: string[];
    };
    return NextResponse.json({
      suggestions: {
        description: parsed.description ?? "",
        suggestedTreatments: Array.isArray(parsed.suggestedTreatments)
          ? parsed.suggestedTreatments.slice(0, 6)
          : [],
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON from Gemini" },
      { status: 502 }
    );
  }
}
