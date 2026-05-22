"use client";
import Image from "next/image";
import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { Cta } from "./Cta";
import { ArrowRight, Check, MapPin, Star } from "./icons";
import {
  buildServices,
  dates,
  locations as defaultLocations,
  slots,
} from "./BookingWidget";
import type {
  BookingLocation,
  BookingService,
  ClinicInfo,
  DoctorInfo,
} from "@/types/clinic";

type HeroService = {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  name: string;
  sub: string;
  duration: string;
};

const avatars = [
  { src: "/images/review-1.jpg", name: "Rekha M" },
  { src: "/images/review-2.jpg", name: "Daniel K" },
  { src: "/images/review-3.jpg", name: "Priya S" },
  { src: "/images/review-4.jpg", name: "Marcus J" },
];

const DEFAULT_ASSURANCES = [
  "No Insurance? No problem",
  "0% financing",
  "Same day quote",
];

const DEFAULT_HEADLINE_LINES = ["Strong, Natural,", "Long-Lasting", "Implants."];
const DEFAULT_SUBTITLE =
  "Restore your confidence and oral health with dental implants that look, feel, and function just like your natural teeth.";

const STEP_KEYS = ["place", "datetime", "details", "confirmed"] as const;
const STEP_TITLES = ["Place & Service", "Date & Time", "Your Details"];

export function Hero({
  clinic,
  doctor,
  services: customServices,
}: Readonly<{
  clinic?: ClinicInfo;
  doctor?: DoctorInfo;
  services?: BookingService[];
}> = {}) {
  const bookingServices: HeroService[] = buildServices(customServices);
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

  const bookingLocations: BookingLocation[] = clinic?.address
    ? [
        {
          name: clinic.name,
          address: clinic.address,
          hours: clinic.hours ?? "Call for hours",
        },
      ]
    : defaultLocations;

  const [step, setStep] = useState(0);
  const [locIdx, setLocIdx] = useState<number | null>(0);
  const [svcIdx, setSvcIdx] = useState<number | null>(
    bookingServices.length > 0 ? Math.min(1, bookingServices.length - 1) : null,
  );
  const [dateIdx, setDateIdx] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const step0Done = locIdx !== null && svcIdx !== null;
  const step1Done = dateIdx !== null && slot !== null;
  const step2Done = name.trim() !== "" && phone.trim() !== "";

  const advance = () => {
    if (step === 0 && step0Done) setStep(1);
    else if (step === 1 && step1Done) setStep(2);
    else if (step === 2 && step2Done) setStep(3);
  };

  const goToStep = (i: number) => {
    if (i === 3) return;
    if (i === 1 && !step0Done) return;
    if (i === 2 && (!step0Done || !step1Done)) return;
    setStep(i);
  };

  const reset = () => {
    setLocIdx(0);
    setSvcIdx(
      bookingServices.length > 0 ? Math.min(1, bookingServices.length - 1) : null,
    );
    setDateIdx(null);
    setSlot(null);
    setName("");
    setPhone("");
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
              className="object-cover object-top"
            />
          </div>

          {/* floating booking card — mirrors BookingWidget steps */}
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
                  const reachable =
                    i === 0 ||
                    (i === 1 && step0Done) ||
                    (i === 2 && step0Done && step1Done) ||
                    (i === 3 && step === 3);
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
                <StepPlace
                  bookingLocations={bookingLocations}
                  bookingServices={bookingServices}
                  locIdx={locIdx}
                  svcIdx={svcIdx}
                  onPickLoc={setLocIdx}
                  onPickSvc={setSvcIdx}
                  canAdvance={step0Done}
                  onNext={advance}
                />
              )}
              {step === 1 && (
                <StepDateTime
                  dateIdx={dateIdx}
                  slot={slot}
                  onPickDate={setDateIdx}
                  onPickSlot={setSlot}
                  canAdvance={step1Done}
                  onNext={advance}
                />
              )}
              {step === 2 && (
                <StepDetails
                  name={name}
                  phone={phone}
                  onName={setName}
                  onPhone={setPhone}
                  summary={{
                    service:
                      svcIdx !== null ? bookingServices[svcIdx]?.name ?? "" : "",
                    location:
                      locIdx !== null ? bookingLocations[locIdx]?.name ?? "" : "",
                    when:
                      dateIdx !== null && slot
                        ? `${dates[dateIdx].day} ${dates[dateIdx].date} · ${slot}`
                        : "",
                  }}
                  canAdvance={step2Done}
                  onConfirm={advance}
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
      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-navy/40">
        Step {index} of 3
      </p>
      <h3 className="mt-0.5 text-[13px] font-medium text-brand">{title}</h3>
    </div>
  );
}

function PrimaryBtn({
  label,
  disabled,
  onClick,
}: {
  readonly label: string;
  readonly disabled: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
        disabled
          ? "bg-mute text-navy/35 cursor-not-allowed"
          : "bg-brand text-white shadow-[0_10px_24px_-12px_rgba(0,118,184,0.7)] hover:-translate-y-0.5"
      }`}
    >
      {label}
      <ArrowRight className="h-3 w-3" />
    </button>
  );
}

type StepPlaceProps = {
  readonly bookingLocations: BookingLocation[];
  readonly bookingServices: HeroService[];
  readonly locIdx: number | null;
  readonly svcIdx: number | null;
  readonly onPickLoc: (i: number) => void;
  readonly onPickSvc: (i: number) => void;
  readonly canAdvance: boolean;
  readonly onNext: () => void;
};

function StepPlace({
  bookingLocations,
  bookingServices,
  locIdx,
  svcIdx,
  onPickLoc,
  onPickSvc,
  canAdvance,
  onNext,
}: StepPlaceProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 animate-fade-up">
      <StepHeader index={1} title={STEP_TITLES[0]} />

      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-navy/40">
          Location
        </p>
        <div className="mt-1 grid gap-1">
          {bookingLocations.map((l, i) => {
            const on = locIdx === i;
            return (
              <button
                key={l.name}
                type="button"
                onClick={() => onPickLoc(i)}
                className={`rounded-md border px-1.5 py-1 text-left transition ${
                  on
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-navy hover:border-brand/40"
                }`}
              >
                <span className="flex items-center gap-1 text-[9px] font-semibold">
                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{l.name}</span>
                </span>
                <span
                  className={`mt-0.5 block truncate text-[8px] leading-tight ${
                    on ? "text-white/85" : "text-navy/55"
                  }`}
                >
                  {l.address}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-navy/40">
          Service
        </p>
        <div className="mt-1 grid grid-cols-2 gap-1">
          {bookingServices.slice(0, 4).map((s, i) => {
            const on = svcIdx === i;
            const Icon = s.Icon;
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => onPickSvc(i)}
                className={`flex items-center gap-1 rounded-md border px-1.5 py-1 text-left text-[9px] font-semibold transition ${
                  on
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-navy hover:border-brand/40"
                }`}
              >
                <Icon className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <PrimaryBtn label="Next" disabled={!canAdvance} onClick={onNext} />
    </div>
  );
}

type StepDateTimeProps = {
  readonly dateIdx: number | null;
  readonly slot: string | null;
  readonly onPickDate: (i: number) => void;
  readonly onPickSlot: (s: string) => void;
  readonly canAdvance: boolean;
  readonly onNext: () => void;
};

function StepDateTime({
  dateIdx,
  slot,
  onPickDate,
  onPickSlot,
  canAdvance,
  onNext,
}: StepDateTimeProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 animate-fade-up">
      <StepHeader index={2} title={STEP_TITLES[1]} />

      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-navy/40">
          Pick a Date
        </p>
        <div className="mt-1 grid grid-cols-4 gap-1">
          {dates.slice(0, 4).map((d, i) => {
            const on = dateIdx === i;
            return (
              <button
                key={`${d.day}-${d.date}`}
                type="button"
                onClick={() => onPickDate(i)}
                className={`rounded-md border px-1 py-1 text-center transition ${
                  on
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-navy hover:border-brand/40"
                }`}
              >
                <div className="text-[7px] font-semibold uppercase tracking-wider opacity-70">
                  {d.day}
                </div>
                <div className="font-display text-[14px] leading-none">
                  {d.date}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-navy/40">
          Time Slot
        </p>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {slots.slice(0, 6).map((s) => {
            const on = slot === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onPickSlot(s)}
                className={`rounded-md border py-1 text-center text-[9px] font-semibold transition ${
                  on
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-navy hover:border-brand/40"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <PrimaryBtn label="Next" disabled={!canAdvance} onClick={onNext} />
    </div>
  );
}

type StepDetailsProps = {
  readonly name: string;
  readonly phone: string;
  readonly onName: (v: string) => void;
  readonly onPhone: (v: string) => void;
  readonly summary: { service: string; location: string; when: string };
  readonly canAdvance: boolean;
  readonly onConfirm: () => void;
};

function StepDetails({
  name,
  phone,
  onName,
  onPhone,
  summary,
  canAdvance,
  onConfirm,
}: StepDetailsProps) {
  return (
    <div className="flex flex-1 flex-col gap-2 animate-fade-up">
      <StepHeader index={3} title={STEP_TITLES[2]} />

      <div className="space-y-1">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => onName(e.target.value)}
          className="w-full rounded-md border border-line bg-white px-2 py-1 text-[10px] text-navy placeholder:text-navy/35 outline-none focus:border-brand"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={phone}
          onChange={(e) => onPhone(e.target.value)}
          className="w-full rounded-md border border-line bg-white px-2 py-1 text-[10px] text-navy placeholder:text-navy/35 outline-none focus:border-brand"
        />
      </div>

      <div className="rounded-md border border-line bg-mute px-2 py-1.5 text-[9px] leading-tight">
        <div className="truncate font-semibold text-brand">
          {summary.service || "—"}
        </div>
        <div className="truncate text-navy/60">
          {summary.location} · {summary.when}
        </div>
      </div>

      <PrimaryBtn label="Confirm" disabled={!canAdvance} onClick={onConfirm} />
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
