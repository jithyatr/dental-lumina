"use client";
import { useState } from "react";
import { ArrowDownRight, Upload } from "./icons";

const goals = [
  "Whiter teeth & brighter smile",
  "Straighten crooked teeth",
  "Achieve a confident smile",
  "Fix gap between teeth",
  "Repair chipped edges",
];

const steps = [
  {
    title: "Upload or take a photo",
    desc: "A clear, front-facing selfie is all we need. No special lighting required.",
  },
  {
    title: "Select your concern or goal",
    desc: "Whitening, alignment, veneers, implants — choose what matters most to you.",
  },
  {
    title: "Receive your AI smile report",
    desc: "Instant assessment with a smile score, treatment estimate and recommendations.",
  },
];

export function SmileSimulator() {
  const [active, setActive] = useState(goals[0]);

  return (
    <section className="relative isolate overflow-hidden bg-brand py-24 text-white lg:py-32">
      {/* soft ambient lighting */}
      <div className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-brand-2 opacity-40 blur-[160px]" />
      <div className="pointer-events-none absolute -right-32 top-1/3 h-[520px] w-[520px] rounded-full bg-brand-deep opacity-50 blur-[200px]" />

      <div className="gutter-x relative grid gap-14 lg:grid-cols-12 lg:gap-16">
        {/* Left — copy + steps */}
        <div className="lg:col-span-6">
          <h2 className="font-display text-[clamp(34px,5vw,56px)] font-medium leading-[1.08]">
            See Your New Smile
            <br />
            Before You Start
          </h2>
          <p className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-white/75">
            Upload a photo and tell us what you'd like to improve. Our AI-driven
            simulator will analyze your unique features and suggest the best
            path for your Digital Smile Design.
          </p>

          <ol className="mt-10 space-y-7">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 text-[13px] font-medium text-white ring-1 ring-white/25">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[17px] font-medium">{s.title}</h3>
                  <p className="mt-1 max-w-md text-[14px] text-white/70">
                    {s.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Right — dark interactive card */}
        <div className="relative lg:col-span-6">
          <div className="rounded-[28px] bg-ink p-6 ring-1 ring-white/5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] sm:p-7">
            {/* compact upload row */}
            <div className="rounded-2xl border border-dashed border-white/10 bg-chip-2 px-6 py-7 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#4E83DD] to-[#B2C9E9] text-white shadow-[0_14px_30px_-14px_rgba(78,131,221,0.7)]">
                <Upload className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[15px] font-medium">Upload Your Smile</p>
              <p className="mt-1 text-[12px] text-white/50">
                Front-facing smile photo for best results
              </p>
            </div>

            {/* improvement picker */}
            <div className="mt-6">
              <h3 className="text-[18px] font-medium">How can we improve it?</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {goals.map((g) => {
                  const on = active === g;
                  return (
                    <button
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
                placeholder="Describe your pain in your own words…"
                className="w-full resize-none bg-transparent text-[14px] text-white/85 placeholder:text-white/35 outline-none"
              />
            </div>

            {/* CTA */}
            <button className="mt-6 group inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-gradient px-6 py-4 text-[15px] font-medium text-white shadow-[0_18px_40px_-18px_rgba(0,118,184,.8)] transition hover:-translate-y-0.5">
              Simulate Transformation
              <ArrowDownRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
