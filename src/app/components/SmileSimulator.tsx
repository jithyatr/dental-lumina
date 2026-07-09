"use client";
import { useRef, useState } from "react";
import { ambientGlow, glowBleed } from "./ambientGlow";
import { ArrowDownRight, Check, Sparkle, Upload } from "./icons";
import type { SimulatorStep } from "@/types/clinic";

const DEFAULT_GOALS = [
  "Whiter teeth & brighter smile",
  "Straighten crooked teeth",
  "Achieve a confident smile",
  "Fix gap between teeth",
  "Repair chipped edges",
];

const DEFAULT_STEPS: SimulatorStep[] = [
  {
    title: "Upload or take a photo",
    description:
      "A clear, front-facing selfie is all we need. No special lighting required.",
  },
  {
    title: "Select your concern or goal",
    description:
      "Whitening, alignment, veneers, implants — choose what matters most to you.",
  },
  {
    title: "Receive your AI smile report",
    description:
      "Instant assessment with a smile score, treatment estimate and recommendations.",
  },
];

type Suggestions = {
  description: string;
  suggestedTreatments: string[];
};

const MAX_BYTES = 5 * 1024 * 1024;

const AI_API_BASE = (process.env.NEXT_PUBLIC_AI_API_BASE ?? "").replace(/\/$/, "");
const SMILE_ENDPOINT = AI_API_BASE ? `${AI_API_BASE}/api/smile` : "/api/smile";

export function SmileSimulator({
  headline,
  subheading,
  goals,
  steps,
}: Readonly<{
  headline?: string;
  subheading?: string;
  goals?: string[];
  steps?: SimulatorStep[];
}>) {
  const goalOptions = goals && goals.length > 0 ? goals : DEFAULT_GOALS;
  const stepItems = steps && steps.length > 0 ? steps : DEFAULT_STEPS;
  const title = headline ?? "See Your New Smile\nBefore You Start";
  const titleLines = title.split("\n");
  const sub =
    subheading ??
    "Upload a photo and tell us what you'd like to improve. Our AI-driven simulator will analyze your unique features and suggest the best path for your Digital Smile Design.";

  const fileInput = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(goalOptions[0]);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Suggestions | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFile = (file: File) => {
    if (file.size > MAX_BYTES) {
      setError("Image size exceeds 5MB. Please upload a smaller file.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPreview(url);
      setImageBase64(url);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async () => {
    if (!imageBase64) {
      setError("Please upload a photo of your smile first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const promptText = description.trim() || active;
      const res = await fetch(SMILE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, prompt: promptText }),
      });
      if (res.status === 429) {
        setError("Too many requests — please try again in a minute.");
        return;
      }
      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as { suggestions: Suggestions };
      setResult(data.suggestions);
    } catch {
      setError("Something went wrong. Please try again with a clearer photo.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPreview(null);
    setImageBase64(null);
    setDescription("");
    setError(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  return (
    <section
      id="smile-simulator"
      className="relative isolate overflow-hidden bg-brand py-24 text-white lg:py-32"
    >
      {/* was: -left-40 top-10 h-[420px] w-[420px] bg-brand-2 opacity-40 blur-[160px] */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: -160 - glowBleed(160),
          top: 40 - glowBleed(160),
          width: 420 + 2 * glowBleed(160),
          height: 420 + 2 * glowBleed(160),
          ...ambientGlow("var(--color-brand-2)", 0.4),
        }}
      />
      {/* was: -right-32 top-1/3 h-[520px] w-[520px] bg-brand-deep opacity-50 blur-[200px] */}
      <div
        className="pointer-events-none absolute"
        style={{
          right: -128 - glowBleed(200),
          top: `calc(33.333% - ${glowBleed(200)}px)`,
          width: 520 + 2 * glowBleed(200),
          height: 520 + 2 * glowBleed(200),
          ...ambientGlow("var(--color-brand-deep)", 0.5),
        }}
      />

      <div className="gutter-x relative grid gap-14 lg:grid-cols-12 lg:gap-16">
        {/* Left — copy + steps */}
        <div className="lg:col-span-6">
          <h2 className="font-display text-[clamp(34px,5vw,56px)] font-medium leading-[1.08]">
            {titleLines.map((line, i) => (
              <span key={`${line}-${i}`}>
                {line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-white/75">
            {sub}
          </p>

          <ol className="mt-10 space-y-7">
            {stepItems.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 text-[13px] font-medium text-white ring-1 ring-white/25">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[17px] font-medium">{s.title}</h3>
                  <p className="mt-1 max-w-md text-[14px] text-white/70">
                    {s.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Right — dark interactive card */}
        <div className="relative lg:col-span-6">
          <div className="rounded-[28px] bg-ink p-6 ring-1 ring-white/5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] sm:p-7">
            {result ? (
              <SmileResult result={result} preview={preview} onReset={reset} />
            ) : (
              <>
                {/* Upload */}
                <label className="block cursor-pointer rounded-2xl border border-dashed border-white/10 bg-chip-2 px-6 py-7 text-center transition hover:border-white/25 hover:bg-chip">
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onFile(f);
                    }}
                    className="hidden"
                  />
                  {preview ? (
                    <PreviewBlock src={preview} onClear={reset} />
                  ) : (
                    <>
                      <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-2 to-brand-3 text-white shadow-[0_14px_30px_-14px_rgba(78,131,221,0.7)]">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-[15px] font-medium">
                        Click to upload photo
                      </p>
                      <p className="mt-1 text-[12px] text-white/50">
                        Front-facing smile photo for best results · max 5MB
                      </p>
                    </>
                  )}
                </label>

                {/* improvement picker */}
                <div className="mt-6">
                  <h3 className="text-[18px] font-medium">
                    How can we improve it?
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {goalOptions.map((g) => {
                      const on = active === g;
                      return (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setActive(g)}
                          className={`rounded-full px-4 py-2 text-[13px] transition ${
                            on
                              ? "bg-chip-gradient text-white ring-1 ring-white/30"
                              : "bg-chip text-white/75 hover:bg-chip-2"
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* free text */}
                <div className="mt-5 rounded-2xl border border-white/5 bg-chip-2 p-4">
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., I want my teeth to be whiter and more even…"
                    className="w-full resize-none bg-transparent text-[14px] text-white/85 placeholder:text-white/35 outline-none"
                  />
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-[13px] text-red-200">
                    <span className="mt-0.5">⚠</span>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={loading}
                  className="mt-6 group inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-gradient px-6 py-4 text-[15px] font-medium text-white shadow-[0_18px_40px_-18px_rgba(0,118,184,.8)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Analyzing Smile…
                    </>
                  ) : (
                    <>
                      Simulate Transformation
                      <ArrowDownRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-white/40">
                  Powered by Gemini AI Vision
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PreviewBlock({
  src,
  onClear,
}: Readonly<{ src: string; onClear: () => void }>) {
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Smile preview"
        className="mx-auto h-32 w-32 rounded-2xl object-cover ring-1 ring-white/15"
      />
      <p className="mt-3 text-[12px] text-white/60">Photo ready</p>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClear();
        }}
        className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/40 underline-offset-2 hover:text-white/80 hover:underline"
      >
        Replace photo
      </button>
    </div>
  );
}

function SmileResult({
  result,
  preview,
  onReset,
}: Readonly<{
  result: Suggestions;
  preview: string | null;
  onReset: () => void;
}>) {
  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white">
          <Sparkle className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-[20px] font-medium">Transformation Insights</h3>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
            Powered by Gemini AI Vision
          </p>
        </div>
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Your smile"
          className="mt-5 h-40 w-full rounded-2xl object-cover ring-1 ring-white/10"
        />
      )}

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-3">
          AI Analysis
        </p>
        <p className="mt-2 border-l-2 border-brand-3/40 pl-3 text-[14px] italic leading-relaxed text-white/75">
          {result.description}
        </p>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-3">
          Suggested treatments
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {result.suggestedTreatments.map((t, i) => (
            <span
              key={`${i}-${t}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white ring-1 ring-white/15"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-full border border-white/15 px-5 py-3 text-[14px] font-medium text-white/85 transition hover:bg-white/5"
        >
          Try Another Photo
        </button>
        <a
          href="#booking"
          className="flex-[2] inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 py-3 text-[14px] font-medium text-white shadow-[0_18px_40px_-18px_rgba(0,118,184,.8)] transition hover:-translate-y-0.5"
        >
          Book Now to Make it Real
          <ArrowDownRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 animate-spin"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
