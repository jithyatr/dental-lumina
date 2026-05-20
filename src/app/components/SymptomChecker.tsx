"use client";
import { useState } from "react";
import { ArrowDownRight, Check, Phone, Shield } from "./icons";

const baseSymptoms = [
  "Severe Pain",
  "Swelling",
  "Bleeding",
  "Broken Tooth",
  "Lost Crown/Filling",
  "Temperature Sensitivity",
  "Jaw Pain",
  "Abscess/Pus",
  "Knocked-Out Tooth",
  "Cracked Tooth",
  "Loose Tooth",
  "Gum Swelling",
];

const implantSymptoms = [
  "Post-Op Bleeding",
  "Persistent Numbness",
  "Loose Implant",
  "Fever/Chills",
  "Extreme Swelling",
  "Pain Clicking",
];

const SERVICE_NAME = "Dental Implants";
const ALL_SYMPTOMS = [...baseSymptoms, ...implantSymptoms];

type Urgency = "Emergency" | "Urgent" | "Non-Urgent";
type Triage = {
  urgency: Urgency;
  assessment: string;
  immediateActions: string[];
};

const urgencyStyle: Record<Urgency, { ring: string; chip: string; label: string }> = {
  Emergency: {
    ring: "ring-red-400/40 bg-red-500/15",
    chip: "bg-red-500 text-white",
    label: "Emergency — Call us now",
  },
  Urgent: {
    ring: "ring-gold/40 bg-gold/15",
    chip: "bg-gold text-navy",
    label: "Urgent — Book same day",
  },
  "Non-Urgent": {
    ring: "ring-teal/40 bg-teal/15",
    chip: "bg-teal text-navy",
    label: "Non-Urgent — Schedule a visit",
  },
};

function buildPrompt(symptoms: string[], description: string) {
  return `You are a dental emergency triage AI. Analyze these symptoms and respond ONLY with a valid JSON object in this exact format (no other text):
{"urgency":"Emergency","assessment":"brief explanation","immediateActions":["action1","action2"]}
Urgency rules: Emergency=uncontrolled bleeding/swelling affecting breathing/knocked-out permanent tooth. Urgent=severe pain/abscess/broken tooth. Non-Urgent=mild sensitivity/lost filling without pain.
Patient on ${SERVICE_NAME} page. Symptoms: ${symptoms.join(", ") || "none"}. Description: ${description || "none"}`;
}

export function SymptomChecker() {
  const [active, setActive] = useState<Set<string>>(new Set(["Severe Pain"]));
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Triage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggle = (s: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const onCheck = async () => {
    if (active.size === 0 && !description.trim()) {
      setError("Please select at least one symptom or describe your pain.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const message = buildPrompt(Array.from(active), description.trim());
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: [] }),
      });
      if (res.status === 429) {
        setError("Too many requests — please try again in a minute.");
        return;
      }
      if (!res.ok) throw new Error("API error");
      const { reply } = (await res.json()) as { reply: string };
      const match = /\{[\s\S]*\}/.exec(reply ?? "");
      if (!match) throw new Error("No JSON in response");
      const parsed = JSON.parse(match[0]) as Triage;
      setResult(parsed);
    } catch {
      setError(
        "Failed to process symptoms. Please call us directly at (555) 123-4567 if you are in severe pain."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const palette = result ? urgencyStyle[result.urgency] : null;

  return (
    <section
      id="symptom-checker"
      className="relative isolate overflow-hidden py-24 lg:py-32"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand/20 blur-[160px]" />

      <div className="gutter-x relative mx-auto max-w-[1100px] text-center">
        <span className="inline-flex items-center gap-2 rounded-pill bg-brand/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brand">
          <span className="h-1 w-1 rounded-full bg-brand" />
          AI Triage
        </span>
        <h2 className="mt-6 font-display text-[clamp(34px,5vw,56px)] font-medium leading-[1.1] text-navy">
          Not sure what your symptoms mean?
          <br />
          <span className="text-brand">Ask our AI.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-[17px] text-navy/70">
          Describe your symptoms and get instant triage guidance, no
          appointment needed.
        </p>

        <div className="relative mx-auto mt-12 w-full max-w-[760px]">
          <div className="absolute -inset-4 -z-10 rounded-[40px] bg-brand/15 blur-2xl" />
          <div className="glow-card rounded-[32px] p-8 text-left text-white sm:p-10">
            {result ? (
              <ResultPanel
                triage={result}
                palette={palette!}
                onReset={reset}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-medium tracking-[0.04em]">
                    COMMON SYMPTOMS:
                  </h3>
                  <span className="text-xs text-white/60">
                    {active.size} selected
                  </span>
                </div>
                <p className="mt-2 text-[14px] text-white/65">
                  Tap any symptom to add it to your consultation.
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  {ALL_SYMPTOMS.map((s) => {
                    const on = active.has(s);
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => toggle(s)}
                        className={`rounded-chip px-5 py-3 text-[14px] transition ${
                          on
                            ? "bg-chip-gradient text-white ring-1 ring-white/30"
                            : "bg-chip text-white/80 hover:text-white hover:bg-chip-2"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-7 rounded-2xl border border-white/5 bg-chip-2 p-4">
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your pain in your own words… (e.g. sharp throbbing on upper right, started 2 days ago)"
                    className="w-full resize-none bg-transparent text-[15px] text-white/85 placeholder:text-white/35 outline-none"
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
                  onClick={onCheck}
                  disabled={loading}
                  className="mt-6 group inline-flex w-full items-center justify-center gap-3 rounded-chip bg-brand-gradient px-6 py-4 text-[16px] font-medium text-white shadow-[0_18px_40px_-18px_rgba(0,118,184,.8)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      Analyzing Symptoms…
                    </>
                  ) : (
                    <>
                      Check My Symptoms
                      <ArrowDownRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ResultPanel({
  triage,
  palette,
  onReset,
}: Readonly<{
  triage: Triage;
  palette: { ring: string; chip: string; label: string };
  onReset: () => void;
}>) {
  return (
    <div className="animate-fade-up">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/45">
            Estimated Urgency
          </p>
          <h3 className="mt-2 font-display text-[28px] text-white">
            {triage.urgency}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-pill px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.2em] ring-1 ${palette.ring}`}
        >
          <span className={`grid h-5 w-5 place-items-center rounded-full ${palette.chip}`}>
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          {palette.label}
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-white/5 bg-chip-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
          AI Assessment
        </p>
        <p className="mt-2 text-[15px] leading-[1.6] text-white/85">
          {triage.assessment}
        </p>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
          Immediate Steps
        </p>
        <ul className="mt-3 space-y-2.5">
          {triage.immediateActions.map((step, i) => (
            <li key={`${i}-${step}`} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <span className="text-[14px] text-white/85">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-chip border border-white/15 px-5 py-3 text-[14px] font-medium text-white/85 transition hover:bg-white/5"
        >
          Check New Symptoms
        </button>
        <a
          href="tel:5551234567"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-chip bg-brand-gradient px-5 py-3 text-[14px] font-medium text-white shadow-[0_18px_40px_-18px_rgba(0,118,184,.8)] transition hover:-translate-y-0.5"
        >
          <Phone className="h-4 w-4" />
          Call Us Now
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
