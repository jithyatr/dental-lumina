"use client";
import { useState } from "react";
import { Minus, Plus } from "./icons";
import { Cta } from "./Cta";
import type { FaqItem } from "@/types/clinic";

const DEFAULT_ITEMS: FaqItem[] = [
  {
    question: "What payment options do you accept?",
    answer:
      "We accept all major PPO insurances, CareCredit, and offer in-house, interest-free monthly plans. Our team helps you maximize benefits so cost never blocks the right treatment.",
  },
  {
    question: "Do you offer teeth whitening?",
    answer:
      "Yes — both in-office and take-home whitening systems. We tailor strength and duration to your enamel and goals for a result that looks natural, not flat.",
  },
  {
    question: "How often should I get a check-up?",
    answer:
      "For most patients twice a year keeps everything ahead of trouble. Implant patients may benefit from a third visit in year one for follow-up imaging.",
  },
  {
    question: "What should I do in a dental emergency?",
    answer:
      "Call our 24-hour line. If a tooth has been knocked out, keep it moist (milk or saline) and come in within an hour for the best chance of saving it.",
  },
  {
    question: "How can I improve my oral hygiene?",
    answer:
      "Brush twice with a soft head, floss once, and add an interdental brush around implants. We'll personalize a routine based on your gum biotype.",
  },
];

export function Faq({
  label,
  headline,
  subheading,
  cta,
  items,
}: Readonly<{
  label?: string;
  headline?: string;
  subheading?: string;
  cta?: string;
  items?: FaqItem[];
}>) {
  const entries = items && items.length > 0 ? items : DEFAULT_ITEMS;
  const sectionLabel = label ?? "FAQ";
  const title = headline ?? "Frequently Asked Questions?";
  const sub =
    subheading ??
    "Describe your symptoms and get instant triage guidance, no appointment needed.";
  const ctaLabel = cta ?? "Have More Questions";

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-24 lg:py-32">
      <div className="gutter-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="text-[13px] uppercase tracking-[0.25em] text-navy/55">
            {sectionLabel}
          </span>
          <h2 className="mt-3 font-display text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.1] text-navy">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-[1.55] text-navy/70">
            {sub}
          </p>
          <div className="mt-8">
            <Cta variant="blue">{ctaLabel}</Cta>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ul className="divide-y divide-line">
            {entries.map((it, i) => {
              const on = open === i;
              return (
                <li key={it.question}>
                  <button
                    onClick={() => setOpen(on ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="flex-1 text-[18px] font-medium text-navy lg:text-[20px]">
                      {it.question}
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
                      {it.answer}
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
