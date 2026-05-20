"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Cta } from "./Cta";
import { ArrowRight, Calendar, Check, Clock } from "./icons";
import type { ClinicInfo, DoctorInfo } from "@/types/clinic";

const dates = [
  { day: "MON", date: 14 },
  { day: "TUE", date: 15 },
  { day: "WED", date: 16 },
  { day: "THU", date: 17 },
];

const slots = [
  { time: "9:00 AM", state: "booked" as const },
  { time: "10:30 AM", state: "selected" as const },
  { time: "1:00 PM", state: "open" as const },
  { time: "2:30 PM", state: "open" as const },
];

const DEFAULT_ASSURANCES = [
  "No Insurance? No problem",
  "0% financing",
  "Same day quote",
];

const DEFAULT_HEADLINE_LINES = ["Strong, Natural,", "Long-Lasting", "Implants."];

const DEFAULT_SUBTITLE =
  "Restore your confidence and oral health with dental implants that look, feel, and function just like your natural teeth.";

const STEP_KEYS = ["date", "slot", "review", "confirmed"] as const;

export function Hero({
  clinic,
  doctor,
}: Readonly<{ clinic?: ClinicInfo; doctor?: DoctorInfo }>) {
  const [step, setStep] = useState(0);

  const headlineLines = clinic?.heroHeadline
    ? clinic.heroHeadline.split("\n")
    : DEFAULT_HEADLINE_LINES;
  const subtitle = clinic?.heroSubtitle ?? DEFAULT_SUBTITLE;
  const ctaLabel = clinic?.heroCta ?? "Book Free Consultation";
  const heroImage =
    clinic?.heroImagePath ?? "/images/dr-sheila-dobee-hero.png";
  const heroImageAlt = doctor?.name
    ? `${doctor.name} treating a patient`
    : "Dr Sheila Dobee treating a patient";
  const assurances =
    clinic?.heroAssurances && clinic.heroAssurances.length > 0
      ? clinic.heroAssurances
      : DEFAULT_ASSURANCES;

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STEP_KEYS.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-brand pt-32 pb-28 text-white lg:pt-40 lg:pb-32">
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
            {headlineLines.map((line, i) => (
              <span key={`${line}-${i}`}>
                {line}
                {i < headlineLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] leading-[1.55] text-white/85">
            {subtitle}
          </p>
          <div className="mt-9">
            <Cta variant="white">{ctaLabel}</Cta>
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
              src={heroImage}
              alt={heroImageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* floating booking card — anchored below image so it doesn't cover the photo */}
          <div className="pointer-events-auto absolute -bottom-24 right-2 w-[260px] rounded-[20px] bg-white p-3.5 text-navy shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)] ring-1 ring-white/40 sm:-bottom-20 sm:right-4 sm:w-[280px] md:w-[300px]">
            {/* Header — Live + progress dots */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
                <span className="relative grid h-2 w-2 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-success/50" />
                  <span className="relative h-2 w-2 rounded-full bg-success" />
                </span>
                Live Booking
              </div>
              <div className="flex items-center gap-1">
                {STEP_KEYS.map((key, i) => (
                  <span
                    key={key}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i === step ? "w-4 bg-brand" : "w-1.5 bg-brand/15"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step body — fixed-height frame so the card doesn't jitter */}
            <div className="mt-3 flex min-h-32 flex-col">
              {step === 0 && <StepPickDate />}
              {step === 1 && <StepPickSlot />}
              {step === 2 && <StepReview />}
              {step === 3 && <StepConfirmed />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepHeader({ index, title }: { readonly index: number; readonly title: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/40">
        Step {index}
      </p>
      <h3 className="mt-1 text-[16px] font-medium text-brand">{title}</h3>
    </div>
  );
}

function StepPickDate() {
  return (
    <div className="flex flex-1 flex-col gap-2.5 animate-fade-up">
      <StepHeader index={1} title="Pick a date" />
      <div className="grid grid-cols-4 gap-1.5">
        {dates.map((d, i) => {
          const on = i === 2;
          return (
            <div
              key={d.day}
              className={`flex h-12 flex-col items-center justify-center rounded-lg border text-center transition ${
                on
                  ? "border-brand bg-brand text-white shadow-[0_8px_20px_-10px_rgba(0,118,184,0.7)]"
                  : "border-line bg-white text-navy"
              }`}
            >
              <span
                className={`text-[9px] font-semibold uppercase tracking-wider ${
                  on ? "opacity-85" : "opacity-50"
                }`}
              >
                {d.day}
              </span>
              <span className="mt-0.5 font-display text-[16px] leading-none">
                {d.date}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] italic text-navy/45">Wed, Oct 16 selected</p>
    </div>
  );
}

const slotStyleByState: Record<(typeof slots)[number]["state"], string> = {
  selected:
    "border-brand bg-brand text-white shadow-[0_8px_20px_-10px_rgba(0,118,184,0.7)]",
  booked: "border-line bg-mute text-navy/35 line-through",
  open: "border-line bg-white text-navy",
};

const slotLabelByState: Record<(typeof slots)[number]["state"], string> = {
  selected: "Selected",
  booked: "Booked",
  open: "Open",
};

const slotLabelOpacityByState: Record<
  (typeof slots)[number]["state"],
  string
> = {
  selected: "opacity-85",
  booked: "opacity-60",
  open: "opacity-40",
};

function StepPickSlot() {
  return (
    <div className="flex flex-1 flex-col gap-2.5 animate-fade-up">
      <StepHeader index={2} title="Choose a slot" />
      <div className="grid grid-cols-2 gap-1.5">
        {slots.map((s) => (
          <div
            key={s.time}
            className={`rounded-lg border px-2.5 py-1.5 text-left transition ${slotStyleByState[s.state]}`}
          >
            <div className="text-[11px] font-semibold">{s.time}</div>
            <div
              className={`mt-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] ${slotLabelOpacityByState[s.state]}`}
            >
              {slotLabelByState[s.state]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepReview() {
  return (
    <div className="flex flex-1 flex-col gap-2 animate-fade-up">
      <StepHeader index={3} title="Review & confirm" />
      <div className="space-y-1.5 rounded-lg border border-line bg-mute p-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-brand">
            <Calendar className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-navy/40">
              Date
            </p>
            <p className="text-[11px] font-semibold text-brand">
              Wed, Oct 16, 2026
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-gold">
            <Clock className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-navy/40">
              Time
            </p>
            <p className="text-[11px] font-semibold text-brand">
              10:30 AM · 60 min
            </p>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_24px_-12px_rgba(0,118,184,0.7)] transition hover:-translate-y-0.5"
      >
        Confirm
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

function StepConfirmed() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-1 text-center animate-fade-up">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-white shadow-[0_12px_28px_-12px_rgba(0,118,184,0.65)]">
        <Check className="h-6 w-6" strokeWidth={3} />
      </span>
      <div>
        <h4 className="font-display text-[18px] leading-none text-brand">
          You&rsquo;re booked
        </h4>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-navy/45">
          Confirmation sent
        </p>
      </div>
    </div>
  );
}
