"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Close, Logo, Menu, Phone } from "./icons";
import { Cta } from "./Cta";

const DEFAULT_LINKS = ["About", "Services", "Patients", "Media"];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

const DAY_INDEX: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  tues: 2,
  wed: 3,
  weds: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  fri: 5,
  sat: 6,
};
const DAY_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Period = { days: number[]; open: number; close: number };

function parseTime(raw: string): number | null {
  const m = raw.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3];
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
}

function parseDays(raw: string): number[] {
  const lower = raw.toLowerCase().trim();
  if (/(7\s*days|every\s*day|daily|open\s*all)/.test(lower)) {
    return [0, 1, 2, 3, 4, 5, 6];
  }
  const range = lower.match(/^([a-z]{3,5})\s*[-–]\s*([a-z]{3,5})$/);
  if (range) {
    const start = DAY_INDEX[range[1]];
    const end = DAY_INDEX[range[2]];
    if (start === undefined || end === undefined) return [];
    const out: number[] = [];
    let i = start;
    for (let n = 0; n < 7; n++) {
      out.push(i);
      if (i === end) return out;
      i = (i + 1) % 7;
    }
    return out;
  }
  const single = DAY_INDEX[lower];
  return single !== undefined ? [single] : [];
}

function parseHours(hours: string): Period[] {
  const out: Period[] = [];
  const segments = hours.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  for (const seg of segments) {
    const split = seg.match(/^([A-Za-z][A-Za-z\s\-–]*?)\s+(\d.*)$/);
    if (!split) continue;
    const days = parseDays(split[1]);
    if (days.length === 0) continue;
    const timeMatch = split[2].match(
      /^(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|–|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)$/i,
    );
    if (!timeMatch) continue;
    const open = parseTime(timeMatch[1]);
    const close = parseTime(timeMatch[2]);
    if (open === null || close === null) continue;
    out.push({ days, open, close });
  }
  return out;
}

function formatTimeLabel(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  const ap = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${ap}` : `${h12}:${m.toString().padStart(2, "0")}${ap}`;
}

type ClinicStatus =
  | { kind: "open"; closesAt: number }
  | { kind: "closed"; opensNext?: { day: number; time: number; today: boolean } }
  | { kind: "unknown" };

function computeStatus(periods: Period[], now: Date): ClinicStatus {
  if (periods.length === 0) return { kind: "unknown" };
  const today = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const p of periods) {
    if (p.days.includes(today) && nowMin >= p.open && nowMin < p.close) {
      return { kind: "open", closesAt: p.close };
    }
  }
  for (let offset = 0; offset < 7; offset++) {
    const day = (today + offset) % 7;
    const candidates = periods
      .filter((p) => p.days.includes(day))
      .filter((p) => (offset === 0 ? nowMin < p.open : true))
      .sort((a, b) => a.open - b.open);
    if (candidates.length > 0) {
      return {
        kind: "closed",
        opensNext: { day, time: candidates[0].open, today: offset === 0 },
      };
    }
  }
  return { kind: "closed" };
}

function statusBadgeText(status: ClinicStatus, fallback: string): string {
  if (status.kind === "open") return `OPEN NOW — CLOSES AT ${formatTimeLabel(status.closesAt)}`;
  if (status.kind === "closed") {
    if (!status.opensNext) return "CLOSED";
    const { day, time, today } = status.opensNext;
    const when = today ? "TODAY" : DAY_LABEL[day].toUpperCase();
    return `CLOSED — OPENS ${when} ${formatTimeLabel(time)}`;
  }
  return fallback.toUpperCase();
}

function StatusBadge({
  status,
  fallback,
}: Readonly<{ status: ClinicStatus; fallback: string }>) {
  const isOpen = status.kind === "open";
  const isClosed = status.kind === "closed";
  const dotColor = isOpen ? "bg-success" : isClosed ? "bg-red-500" : "bg-white/40";
  const pingColor = isOpen ? "bg-success/50" : "bg-red-500/50";
  const text = statusBadgeText(status, fallback);
  return (
    <span className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/20 backdrop-blur">
      <span className="relative grid h-2 w-2 place-items-center">
        {(isOpen || isClosed) && (
          <span className={`absolute inset-0 animate-ping rounded-full ${pingColor}`} />
        )}
        <span className={`relative h-2 w-2 rounded-full ${dotColor}`} />
      </span>
      {text}
    </span>
  );
}

export function Navbar({
  clinicName,
  doctorName,
  logoPath,
  logoIsLight,
  phone,
  hours,
  navLinks,
  bookingCta,
}: Readonly<{
  clinicName?: string;
  doctorName?: string;
  logoPath?: string;
  logoIsLight?: boolean;
  phone?: string;
  hours?: string;
  navLinks?: string[];
  bookingCta?: string;
}>) {
  const brandName = clinicName ?? doctorName ?? "Dr Sheila Dobee";
  const rawPhone = phone ?? "5551234567";
  const displayPhone = formatPhone(rawPhone);
  const telHref = `tel:${rawPhone.replace(/\D/g, "")}`;
  const fallbackStatus = hours ?? "Open. Closes At 8PM";
  const periods = hours ? parseHours(hours) : [];
  const links = navLinks && navLinks.length > 0 ? navLinks : DEFAULT_LINKS;
  const ctaLabel = bookingCta ?? "Book Appointment";

  const renderLogo = (size: "sm" | "md") => {
    const dim = size === "md" ? "h-9 w-9" : "h-8 w-8";
    if (logoPath) {
      const wrap = logoIsLight
        ? ""
        : "rounded-md bg-white/95 ring-1 ring-white/10 p-1";
      return (
        <span className={`relative inline-grid place-items-center ${dim} ${wrap}`}>
          <Image
            src={logoPath}
            alt={`${brandName} logo`}
            fill
            sizes={size === "md" ? "36px" : "32px"}
            className={`object-contain ${wrap ? "p-0.5" : ""}`}
          />
        </span>
      );
    }
    return <Logo className={`${dim} text-white`} />;
  };

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ClinicStatus>({ kind: "unknown" });

  useEffect(() => {
    if (periods.length === 0) return;
    const tick = () => setStatus(computeStatus(periods, new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-brand-deep/85 backdrop-blur-md shadow-[0_10px_30px_-20px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="gutter-x flex items-center justify-between gap-6 py-5 text-white lg:py-6">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              {renderLogo("md")}
              <span className="font-display text-[18px] font-medium uppercase tracking-[0.04em]">
                {brandName}
              </span>
            </Link>
            <nav className="hidden items-center gap-7 lg:flex">
              {links.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="flex items-center gap-1.5 text-[15px] font-normal text-white/95 transition hover:text-white"
                >
                  {label}
                  <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <a
              href={telHref}
              className="hidden items-center gap-2 text-[14px] text-white/90 transition hover:text-white md:inline-flex"
            >
              <Phone className="h-4 w-4" />
              {displayPhone}
            </a>
            <div className="hidden xl:inline-flex">
              <StatusBadge status={status} fallback={fallbackStatus} />
            </div>
            <div className="hidden lg:block">
              <Cta variant="blue" href="#booking">
                {ctaLabel}
              </Cta>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Off-canvas mobile menu */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* backdrop */}
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className={`absolute inset-0 bg-ink/55 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* drawer */}
        <aside
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-[360px] flex-col bg-brand-deep text-white shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2.5">
              {renderLogo("sm")}
              <span className="font-display text-[16px] font-medium uppercase tracking-[0.04em]">
                {brandName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/20"
              aria-label="Close menu"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-6">
            {links.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[16px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
              >
                <span>{label}</span>
                <ChevronDown className="h-4 w-4 -rotate-90 opacity-60" />
              </button>
            ))}

            <div className="mt-4 space-y-3 border-t border-white/10 pt-4 pb-[max(env(safe-area-inset-bottom),16px)]">
              <div className="px-2">
                <StatusBadge status={status} fallback={fallbackStatus} />
              </div>
              <a
                href={telHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-[15px] font-medium text-white ring-1 ring-white/15"
              >
                <Phone className="h-4 w-4" />
                {displayPhone}
              </a>
              <a
                href="#booking"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-pill bg-white px-5 py-3 text-[15px] font-medium text-brand"
              >
                {ctaLabel}
              </a>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
