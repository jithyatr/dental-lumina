"use client";
import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { Carousel, MapPin, Sparkle, Stethoscope } from "./icons";
import { CtaWide } from "./Cta";
import type { BookingLocation, BookingService } from "@/types/clinic";

const DEFAULT_LOCATIONS: BookingLocation[] = [
  {
    name: "Gallery District",
    address: "123 Aesthetic Ave, NY 10001",
    hours: "Mon-Fri 8AM to 8PM",
  },
  {
    name: "Midtown",
    address: "123 Aesthetic Ave, NY 10001",
    hours: "Mon-Fri 8AM to 8PM",
  },
  {
    name: "Brooklyn Heights",
    address: "123 Aesthetic Ave, NY 10001",
    hours: "Mon-Fri 8AM to 8PM",
  },
  {
    name: "Lower Manhattan",
    address: "456 Serenity Lane, NY 10002",
    hours: "Weekdays 9AM to 6PM",
  },
];

const SERVICE_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  stethoscope: Stethoscope,
  sparkle: Sparkle,
  carousel: Carousel,
};
const SERVICE_ICON_ORDER = ["stethoscope", "sparkle", "carousel"];

const DEFAULT_SERVICES: BookingService[] = [
  { iconName: "stethoscope", name: "General Consultation", subtitle: "Exam & Treatment Plan", duration: "30 min" },
  { iconName: "sparkle", name: "Dental Implants", subtitle: "Full Implant Procedure", duration: "90 min" },
  { iconName: "carousel", name: "Teeth Whitening", subtitle: "Cosmetic Brightening Treatment", duration: "45 min" },
  { iconName: "sparkle", name: "Root Canal Therapy", subtitle: "Infection Removal & Sealing", duration: "60 min" },
  { iconName: "stethoscope", name: "Orthodontic Consultation", subtitle: "Braces and Aligners Assessment", duration: "30 min" },
  { iconName: "sparkle", name: "Cosmetic Consultation", subtitle: "Smile Design Planning Session", duration: "30 min" },
];

const DEFAULT_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
];

const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const dates = Array.from({ length: 14 }, (_, i) => ({
  day: days[i % 7],
  date: 12 + i,
  month: "May",
}));

const stepTitles = ["Choose Place & Service", "Select Date & Time", "Your Details"];

export function BookingWidget({
  headline,
  subheading,
  locations,
  services,
  timeSlots,
}: Readonly<{
  headline?: string;
  subheading?: string;
  locations?: BookingLocation[];
  services?: BookingService[];
  timeSlots?: string[];
}>) {
  const locs = locations && locations.length > 0 ? locations : DEFAULT_LOCATIONS;
  const svcs = services && services.length > 0 ? services : DEFAULT_SERVICES;
  const slots = timeSlots && timeSlots.length > 0 ? timeSlots : DEFAULT_SLOTS;
  const title = headline ?? "Book Your Visit";
  const sub =
    subheading ??
    "Select a date and time that works for you. Our real-time booking system shows current availability for all our services.";
  const [step, setStep] = useState(0);
  const [loc, setLoc] = useState(0);
  const [svc, setSvc] = useState(1);
  const [dateIdx, setDateIdx] = useState(2);
  const [slot, setSlot] = useState("10:00 AM");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const primaryLabel =
    step === 0 ? "Choose Date & Time" : step === 1 ? "Continue to Details" : "Confirm Booking";

  return (
    <section id="booking" className="relative isolate overflow-hidden bg-section-gradient py-24 text-white lg:py-32">
      <div className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full bg-white/10 blur-[180px]" />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 h-[480px] w-[480px] rounded-full bg-white/10 blur-[200px]" />

      <div className="gutter-x relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill bg-white/15 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white ring-1 ring-white/25 backdrop-blur">
            Book Online
          </span>
          <h2 className="mt-5 font-display text-[clamp(34px,5vw,56px)] font-medium leading-[1.08]">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-[640px] text-[17px] text-white/85">
            {sub}
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-[1200px]">
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[40px] bg-white/10 blur-2xl" />
            <div className="glow-card-soft rounded-[32px] p-6 sm:p-10 flex min-h-[640px] flex-col">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[20px] font-medium">{stepTitles[step]}</h3>
                  <div className="text-[11px] uppercase tracking-[0.25em] text-white/55">
                    Step {step + 1} of 3
                  </div>
                </div>
                <div className="mt-5 flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                        i <= step ? "bg-brand" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Step 1 — location & service */}
              {step === 0 && (
                <>
                  <div className="mt-8">
                    <div className="text-[12px] uppercase tracking-[0.25em] text-white/45">
                      Choose Your Location
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {locs.map((l, i) => {
                        const on = loc === i;
                        return (
                          <button
                            key={l.name}
                            onClick={() => setLoc(i)}
                            className={`text-left rounded-2xl p-4 transition ${
                              on
                                ? "bg-brand ring-1 ring-[#1E6FD9] shadow-[0_18px_40px_-18px_rgba(0,118,184,.7)]"
                                : "bg-chip hover:bg-chip-2"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-white/70" />
                              <span className="text-[16px] font-medium">{l.name}</span>
                            </div>
                            <div className="mt-2 text-[12px] text-white/65">{l.address}</div>
                            <div className="mt-1 text-[12px] text-white/55">{l.hours}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-8">
                    <div className="text-[12px] uppercase tracking-[0.25em] text-white/45">
                      Choose Your Service
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {svcs.map((service, i) => {
                        const on = svc === i;
                        const iconKey =
                          service.iconName && service.iconName in SERVICE_ICONS
                            ? service.iconName
                            : SERVICE_ICON_ORDER[i % SERVICE_ICON_ORDER.length];
                        const Icon = SERVICE_ICONS[iconKey];
                        return (
                          <button
                            key={service.name}
                            onClick={() => setSvc(i)}
                            className={`text-left rounded-2xl p-4 transition ${
                              on ? "bg-brand ring-1 ring-[#1E6FD9]" : "bg-chip hover:bg-chip-2"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white">
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="rounded-full bg-teal/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-teal">
                                {service.duration}
                              </span>
                            </div>
                            <div className="mt-3 text-[16px] font-medium">{service.name}</div>
                            <div className="mt-1 text-[12px] text-white/60">{service.subtitle}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Step 2 — date & time */}
              {step === 1 && (
                <>
                  <div className="mt-8">
                    <div className="text-[12px] uppercase tracking-[0.25em] text-white/45">
                      Pick a Date
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {dates.slice(0, 4).map((d, i) => {
                        const on = dateIdx === i;
                        return (
                          <button
                            key={`${d.day}-${d.date}`}
                            onClick={() => setDateIdx(i)}
                            className={`flex items-center justify-between rounded-2xl p-4 text-left transition ${
                              on
                                ? "bg-brand ring-1 ring-[#1E6FD9] shadow-[0_18px_40px_-18px_rgba(0,118,184,.7)]"
                                : "bg-chip hover:bg-chip-2"
                            }`}
                          >
                            <div>
                              <div className="text-[11px] uppercase tracking-wide text-white/65">
                                {d.day} · {d.month}
                              </div>
                              <div className="mt-1 font-display text-[26px] leading-none">
                                {d.date}
                              </div>
                            </div>
                            <span
                              className={`text-[11px] uppercase tracking-wider ${
                                on ? "text-white/85" : "text-white/45"
                              }`}
                            >
                              {on ? "Selected" : "Available"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-8">
                    <div className="text-[12px] uppercase tracking-[0.25em] text-white/45">
                      Available Time Slots
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {slots.map((s) => {
                        const on = slot === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setSlot(s)}
                            className={`rounded-2xl p-4 text-left transition ${
                              on
                                ? "bg-brand ring-1 ring-[#1E6FD9]"
                                : "bg-chip text-white/85 hover:bg-chip-2"
                            }`}
                          >
                            <div className="font-display text-[20px] leading-none">{s}</div>
                            <div
                              className={`mt-2 text-[11px] uppercase tracking-wider ${
                                on ? "text-white/85" : "text-white/45"
                              }`}
                            >
                              {on ? "Selected" : "Open slot"}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Step 3 — contact details + summary */}
              {step === 2 && (
                <>
                  <div className="mt-8">
                    <div className="text-[12px] uppercase tracking-[0.25em] text-white/45">
                      Your Details
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <Field
                        label="Full Name"
                        value={name}
                        onChange={setName}
                        placeholder="Jane Doe"
                      />
                      <Field
                        label="Phone"
                        value={phone}
                        onChange={setPhone}
                        placeholder="(555) 123-4567"
                      />
                      <Field
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="jane@example.com"
                      />
                      <Field
                        label="Notes (optional)"
                        value={notes}
                        onChange={setNotes}
                        placeholder="Anything we should know?"
                      />
                    </div>
                  </div>

                  <div className="mt-8 border-t border-white/10 pt-8">
                    <div className="text-[12px] uppercase tracking-[0.25em] text-white/45">
                      Booking Summary
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <SummaryCard
                        label="Location"
                        value={locs[loc].name}
                        sub={locs[loc].address}
                        icon={<MapPin className="h-4 w-4" />}
                      />
                      <SummaryCard
                        label="Service"
                        value={svcs[svc].name}
                        sub={svcs[svc].duration}
                        icon={<Sparkle className="h-4 w-4" />}
                      />
                      <SummaryCard
                        label="Date & Time"
                        value={`${dates[dateIdx].day} ${dates[dateIdx].date} ${dates[dateIdx].month}`}
                        sub={slot}
                        icon={<Carousel className="h-4 w-4" />}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Footer — single full-width gradient CTA */}
              <div className="mt-auto pt-8">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={back}
                    className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-white/55 transition hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="m15 6-6 6 6 6" />
                    </svg>
                    Back
                  </button>
                )}
                <CtaWide onClick={step < 2 ? next : undefined}>{primaryLabel}</CtaWide>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: Readonly<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}>) {
  return (
    <label className="block rounded-2xl bg-chip p-4">
      <span className="text-[11px] uppercase tracking-[0.18em] text-white/55">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full bg-transparent text-[15px] font-medium text-white placeholder:text-white/35 outline-none"
      />
    </label>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  icon,
}: Readonly<{
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}>) {
  return (
    <div className="rounded-2xl bg-chip p-4">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white/80">
          {icon}
        </span>
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">
          {label}
        </div>
      </div>
      <div className="mt-3 text-[15px] font-medium text-white">{value}</div>
      {sub ? <div className="mt-1 text-[12px] text-white/55">{sub}</div> : null}
    </div>
  );
}
