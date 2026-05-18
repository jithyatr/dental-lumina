"use client";
import { useState } from "react";
import { Minus, Plus } from "./icons";
import { Cta } from "./Cta";

const items = [
  {
    q: "What payment options do you accept?",
    a: "We accept all major PPO insurances, CareCredit, and offer in-house, interest-free monthly plans. Our team helps you maximize benefits so cost never blocks the right treatment.",
  },
  {
    q: "Do you offer teeth whitening?",
    a: "Yes — both in-office and take-home whitening systems. We tailor strength and duration to your enamel and goals for a result that looks natural, not flat.",
  },
  {
    q: "How often should I get a check-up?",
    a: "For most patients twice a year keeps everything ahead of trouble. Implant patients may benefit from a third visit in year one for follow-up imaging.",
  },
  {
    q: "What should I do in a dental emergency?",
    a: "Call our 24-hour line. If a tooth has been knocked out, keep it moist (milk or saline) and come in within an hour for the best chance of saving it.",
  },
  {
    q: "How can I improve my oral hygiene?",
    a: "Brush twice with a soft head, floss once, and add an interdental brush around implants. We'll personalize a routine based on your gum biotype.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="gutter-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="text-[13px] uppercase tracking-[0.25em] text-navy/55">
            FAQ
          </span>
          <h2 className="mt-3 font-display text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.1] text-navy">
            Frequently Asked Questions?
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-[1.55] text-navy/70">
            Describe your symptoms and get instant triage guidance, no
            appointment needed.
          </p>
          <div className="mt-8">
            <Cta variant="blue">Have More Questions</Cta>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ul className="divide-y divide-line">
            {items.map((it, i) => {
              const on = open === i;
              return (
                <li key={it.q}>
                  <button
                    onClick={() => setOpen(on ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="flex-1 text-[18px] font-medium text-navy lg:text-[20px]">
                      {it.q}
                    </span>
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition ${
                        on ? "bg-brand text-white" : "bg-mute text-navy"
                      }`}
                    >
                      {on ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <div
                    className={`grid overflow-hidden text-[15px] text-navy/70 transition-all ${
                      on ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden max-w-2xl leading-[1.6]">
                      {it.a}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
