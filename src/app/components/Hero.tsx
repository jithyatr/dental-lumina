"use client";
import Image from "next/image";
import { useState } from "react";
import { Cta } from "./Cta";
import { ArrowRight, Calendar, Check, ChevronDown, Clock, Star } from "./icons";
import type { ClinicInfo, DoctorInfo } from "@/types/clinic";

const avatars = [
  { src: "/images/review-1.jpg", name: "Rekha M" },
  { src: "/images/review-2.jpg", name: "Daniel K" },
  { src: "/images/review-3.jpg", name: "Priya S" },
  { src: "/images/review-4.jpg", name: "Marcus J" },
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const slots = [
  { time: "9:00 AM", booked: true },
  { time: "10:30 AM", booked: false },
  { time: "1:00 PM", booked: false },
  { time: "2:30 PM", booked: false },
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState<number | null>(null);

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

  const goToStep = (i: number) => {
    if (i === 1 && selectedDate === null) return;
    if (i === 2 && (selectedDate === null || selectedSlotIdx === null)) return;
    if (i === 3) return;
    setStep(i);
  };

  const pickDate = (d: Date) => {
    setSelectedDate(d);
    setStep(1);
  };

  const pickSlot = (i: number) => {
    if (slots[i].booked) return;
    setSelectedSlotIdx(i);
    setStep(2);
  };

  const confirm = () => setStep(3);

  const reset = () => {
    setSelectedDate(null);
    setSelectedSlotIdx(null);
    setStep(0);
  };

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

          {/* social proof — avatars + rating + smiles restored */}
          <div className="mt-7 flex items-center gap-4">
            <div className="flex -space-x-3">
              {avatars.map((a) => (
                <span
                  key={a.src}
                  className="relative grid h-10 w-10 overflow-hidden rounded-full ring-2 ring-brand"
                >
                  <Image
                    src={a.src}
                    alt={a.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-0.5 text-gold">
                {[0, 1, 2, 3].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5" />
                ))}
                <Star className="h-3.5 w-3.5 text-white/40" />
              </div>
              <p className="text-[14px] font-medium text-white/95">
                1,200+ Confident Smiles Restored
              </p>
            </div>
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
                {STEP_KEYS.map((key, i) => {
                  const reachable = i <= step;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`Go to step ${i + 1}`}
                      onClick={() => goToStep(i)}
                      disabled={!reachable || i === 3}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === step ? "w-4 bg-brand" : "w-1.5 bg-brand/15"
                      } ${reachable && i !== 3 ? "cursor-pointer hover:bg-brand/40" : "cursor-default"}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Step body — fixed-height frame so the card doesn't jitter */}
            <div className="mt-3 flex min-h-32 flex-col">
              {step === 0 && (
                <StepPickDate
                  selectedDate={selectedDate}
                  onPick={pickDate}
                />
              )}
              {step === 1 && (
                <StepPickSlot
                  selectedIdx={selectedSlotIdx}
                  onPick={pickSlot}
                />
              )}
              {step === 2 && selectedDate && selectedSlotIdx !== null && (
                <StepReview
                  date={selectedDate}
                  slotIdx={selectedSlotIdx}
                  onConfirm={confirm}
                />
              )}
              {step === 3 && <StepConfirmed onReset={reset} />}
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

type StepPickDateProps = {
  readonly selectedDate: Date | null;
  readonly onPick: (d: Date) => void;
};

function StepPickDate({ selectedDate, onPick }: StepPickDateProps) {
  const today = stripTime(new Date());
  const initialMonth = selectedDate ?? today;
  const [view, setView] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );

  const firstWeekday = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const daysInMonth = new Date(
    view.getFullYear(),
    view.getMonth() + 1,
    0,
  ).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(view.getFullYear(), view.getMonth(), d));
  }

  const shift = (delta: number) => {
    setView(new Date(view.getFullYear(), view.getMonth() + delta, 1));
  };

  return (
    <div className="flex flex-1 flex-col gap-2 animate-fade-up">
      <div className="flex items-center justify-between">
        <StepHeader index={1} title="Pick a date" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shift(-1)}
            className="grid h-6 w-6 place-items-center rounded-md border border-line text-navy/60 transition hover:border-brand/40 hover:text-brand"
          >
            <ChevronDown className="h-3 w-3 rotate-90" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shift(1)}
            className="grid h-6 w-6 place-items-center rounded-md border border-line text-navy/60 transition hover:border-brand/40 hover:text-brand"
          >
            <ChevronDown className="h-3 w-3 -rotate-90" />
          </button>
        </div>
      </div>
      <p className="text-[11px] font-semibold text-navy">
        {MONTH_LABELS[view.getMonth()]} {view.getFullYear()}
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {DAY_LABELS.map((d, i) => (
          <span
            key={`${d}-${i}`}
            className="text-[8px] font-semibold uppercase tracking-wider text-navy/40"
          >
            {d}
          </span>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <span key={`pad-${i}`} className="h-6" />;
          const past = cell < today;
          const selected =
            selectedDate !== null &&
            cell.getTime() === stripTime(selectedDate).getTime();
          const isToday = cell.getTime() === today.getTime();
          let style = "text-navy hover:bg-brand/10";
          if (past) style = "text-navy/25 cursor-not-allowed";
          else if (selected)
            style =
              "bg-brand text-white shadow-[0_6px_14px_-8px_rgba(0,118,184,0.7)]";
          else if (isToday) style = "text-brand ring-1 ring-brand/40";
          return (
            <button
              type="button"
              key={cell.toISOString()}
              onClick={() => !past && onPick(cell)}
              disabled={past}
              className={`grid h-6 place-items-center rounded-md text-[10px] font-medium transition ${style}`}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type StepPickSlotProps = {
  readonly selectedIdx: number | null;
  readonly onPick: (i: number) => void;
};

function StepPickSlot({ selectedIdx, onPick }: StepPickSlotProps) {
  return (
    <div className="flex flex-1 flex-col gap-2.5 animate-fade-up">
      <StepHeader index={2} title="Choose a slot" />
      <div className="grid grid-cols-2 gap-1.5">
        {slots.map((s, i) => {
          const selected = i === selectedIdx;
          let style = "border-line bg-white text-navy hover:border-brand/40";
          let labelOpacity = "opacity-40";
          let label = "Open";
          if (s.booked) {
            style = "border-line bg-mute text-navy/35 line-through cursor-not-allowed";
            labelOpacity = "opacity-60";
            label = "Booked";
          } else if (selected) {
            style =
              "border-brand bg-brand text-white shadow-[0_8px_20px_-10px_rgba(0,118,184,0.7)]";
            labelOpacity = "opacity-85";
            label = "Selected";
          }
          return (
            <button
              type="button"
              key={s.time}
              onClick={() => onPick(i)}
              disabled={s.booked}
              className={`rounded-lg border px-2.5 py-1.5 text-left transition ${style}`}
            >
              <div className="text-[11px] font-semibold">{s.time}</div>
              <div
                className={`mt-0.5 text-[8px] font-semibold uppercase tracking-[0.18em] ${labelOpacity}`}
              >
                {label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type StepReviewProps = {
  readonly date: Date;
  readonly slotIdx: number;
  readonly onConfirm: () => void;
};

function StepReview({ date, slotIdx, onConfirm }: StepReviewProps) {
  const s = slots[slotIdx];
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
              {WEEKDAY_LONG[date.getDay()].slice(0, 3)},{" "}
              {MONTH_LABELS[date.getMonth()].slice(0, 3)} {date.getDate()},{" "}
              {date.getFullYear()}
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
              {s.time} · 60 min
            </p>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_24px_-12px_rgba(0,118,184,0.7)] transition hover:-translate-y-0.5"
      >
        Confirm
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

type StepConfirmedProps = {
  readonly onReset: () => void;
};

function StepConfirmed({ onReset }: StepConfirmedProps) {
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
      <button
        type="button"
        onClick={onReset}
        className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand underline-offset-2 hover:underline"
      >
        Book another
      </button>
    </div>
  );
}
