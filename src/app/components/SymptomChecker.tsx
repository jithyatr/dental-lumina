"use client";
import { useState } from "react";
import { ArrowDownRight } from "./icons";

const symptoms = [
  "Severe Pain",
  "Swelling",
  "Bleeding",
  "Broken Tooth",
  "Abscess/Pus",
  "Loose Tooth",
  "Gum Swelling",
  "Lost Crown/Filling",
  "Jaw Pain",
  "Temperature Sensitivity",
];

export function SymptomChecker() {
  const [active, setActive] = useState<Set<string>>(new Set(["Severe Pain"]));

  const toggle = (s: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  return (
    <section className="relative isolate overflow-hidden py-24 lg:py-32">
      {/* ambient glow */}
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
          Describe your symptoms and get instant triage guidance, no appointment
          needed.
        </p>

        <div className="relative mx-auto mt-12 w-full max-w-[760px]">
          <div className="absolute -inset-4 -z-10 rounded-[40px] bg-brand/15 blur-2xl" />
          <div className="glow-card rounded-[32px] p-8 text-left text-white sm:p-10">
            <div className="flex items-center justify-between">
              <h3 className="text-[20px] font-medium tracking-[0.04em]">
                COMMON SYMPTOMS:
              </h3>
              <span className="text-xs text-white/60">{active.size} selected</span>
            </div>
            <p className="mt-2 text-[14px] text-white/65">
              Tap any symptom to add it to your consultation.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {symptoms.map((s) => {
                const on = active.has(s);
                return (
                  <button
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
                placeholder="Describe your pain in your own words… (e.g. sharp throbbing on upper right, started 2 days ago)"
                className="w-full resize-none bg-transparent text-[15px] text-white/85 placeholder:text-white/35 outline-none"
              />
            </div>

            <button className="mt-6 group inline-flex w-full items-center justify-center gap-3 rounded-chip bg-brand-gradient px-6 py-4 text-[16px] font-medium text-white shadow-[0_18px_40px_-18px_rgba(0,118,184,.8)] transition hover:-translate-y-0.5">
              Check My Symptoms
              <ArrowDownRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>

            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-white/40">
              Not a substitute for medical advice
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
