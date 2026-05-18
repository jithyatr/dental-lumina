"use client";
import Image from "next/image";
import { useState } from "react";
import { Cta } from "./Cta";
import { Check } from "./icons";

const dates = [
  { day: "MON", date: 12 },
  { day: "TUE", date: 13 },
  { day: "WED", date: 14 },
  { day: "THU", date: 15 },
  { day: "FRI", date: 16 },
];

const assurances = [
  "No Insurance? No problem",
  "0% financing",
  "Same day quote",
];

export function Hero() {
  const [selected, setSelected] = useState(2);
  return (
    <section className="relative isolate overflow-hidden bg-brand pt-32 pb-20 text-white lg:pt-40 lg:pb-24">
      {/* Background ambient blur blobs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#138acc] opacity-60 blur-[160px]" />
      <div className="pointer-events-none absolute -right-32 top-20 h-[480px] w-[480px] rounded-full bg-[#0099d0] opacity-70 blur-[180px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-[420px] w-[700px] rounded-full bg-[#075788] opacity-60 blur-[200px]" />
      {/* Faint grid overlay */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06]"
        aria-hidden
      >
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0H0V60" fill="none" stroke="#fff" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <div className="gutter-x relative grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Heading + CTA */}
        <div className="lg:col-span-6 xl:col-span-6">
          <h1 className="font-display text-[clamp(44px,7vw,80px)] font-medium leading-[1.05] tracking-[-0.03em]">
            Strong, Natural,
            <br />
            Long-Lasting
            <br />
            Implants.
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] leading-[1.55] text-white/85">
            Restore your confidence and oral health with dental implants that
            look, feel, and function just like your natural teeth.
          </p>
          <div className="mt-9">
            <Cta variant="white">Book Free Consultation</Cta>
          </div>

          {/* assurance pills */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px] text-white/90">
            {assurances.map((label) => (
              <div key={label} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15 ring-1 ring-white/30">
                  <Check className="h-3 w-3 text-white" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Dentist image with floating booking card */}
        <div className="relative lg:col-span-6 xl:col-span-6">
          <div className="relative ml-auto aspect-[4/3] w-full max-w-[620px] overflow-hidden rounded-[28px] ring-1 ring-white/15 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)]">
            <Image
              src="/images/dr-sheila-dobee-hero.png"
              alt="Dr Sheila Dobee treating a patient"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* floating booking card */}
          <div className="pointer-events-auto absolute -bottom-10 right-4 w-[300px] rounded-[22px] bg-white p-5 text-navy shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] ring-1 ring-white/40 sm:right-6 md:w-[320px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[15px] font-medium">
                <span className="relative grid h-2.5 w-2.5 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-success/50" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                Live Booking
              </div>
              <div className="text-[12px] text-navy/55">Step 1/3</div>
            </div>

            <h3 className="mt-4 text-[16px] font-medium text-brand">Pick A Date</h3>

            <div className="mt-3 grid grid-cols-5 gap-1.5">
              {dates.map((d, i) => (
                <button
                  key={d.day}
                  onClick={() => setSelected(i)}
                  className={`flex flex-col items-center rounded-xl border px-1.5 py-2 text-center transition ${
                    selected === i
                      ? "border-brand bg-brand text-white shadow-[0_8px_20px_-10px_rgba(0,118,184,0.7)]"
                      : "border-line bg-white hover:border-brand/40"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-80">
                    {d.day}
                  </span>
                  <span className="mt-1 text-[18px] font-medium leading-none">
                    {d.date}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
