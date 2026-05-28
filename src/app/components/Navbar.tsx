"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown, Close, Logo, Menu, Phone } from "./icons";
import { Cta } from "./Cta";

const DEFAULT_LINKS = ["About", "Services", "Patients", "Media"];

// Split a long brand name across two visually-balanced lines.
function splitBrandName(name: string): { line1: string; line2?: string } {
  const trimmed = name.trim();
  if (trimmed.length <= 18) return { line1: trimmed };
  const words = trimmed.split(/\s+/);
  if (words.length < 2) return { line1: trimmed };
  let bestSplit = 1;
  let bestDelta = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ").length;
    const b = words.slice(i).join(" ").length;
    const delta = Math.abs(a - b);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestSplit = i;
    }
  }
  return {
    line1: words.slice(0, bestSplit).join(" "),
    line2: words.slice(bestSplit).join(" "),
  };
}

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
  const text = statusBadgeText(status, fallback);
  const isOpen =
    status.kind === "open" ||
    (status.kind === "unknown" && /^open\b/i.test(text));
  const isClosed =
    status.kind === "closed" ||
    (status.kind === "unknown" && /^closed\b/i.test(text));
  const dotColor = isOpen ? "bg-success" : isClosed ? "bg-red-500" : "bg-white/40";
  const pingColor = isOpen ? "bg-success/50" : "bg-red-500/50";
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
  logoIsWordmark,
  logoNoPlate,
  phone,
  hours,
  navLinks,
  bookingCta,
}: Readonly<{
  clinicName?: string;
  doctorName?: string;
  logoPath?: string;
  logoIsLight?: boolean;
  logoIsWordmark?: boolean;
  logoNoPlate?: boolean;
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

  // Wordmark logos already contain the clinic name baked into the image —
  // render them alone (wide, no companion text). Icon-only logos pair with text.
  // "No plate" path is taken when the logo doesn't need the white contrast
  // pill — either because it's light-on-transparent (auto-detected) or the
  // clinic explicitly opted out via logoNoPlate.
  const skipPlate = Boolean(logoIsLight) || Boolean(logoNoPlate);
  const renderLogo = (size: "sm" | "md") => {
    const iconDim = size === "md" ? "h-11 w-11" : "h-9 w-9";

    if (logoPath && logoIsWordmark) {
      const heightCls = size === "md" ? "h-14 sm:h-12" : "h-10";
      const maxWCls = size === "md" ? "max-w-[240px] sm:max-w-[260px]" : "max-w-[200px]";
      if (skipPlate) {
        return (
          <span className={`relative inline-block ${heightCls} ${maxWCls}`}>
            <Image
              src={logoPath}
              alt={`${brandName} logo`}
              height={size === "md" ? 56 : 40}
              width={size === "md" ? 260 : 200}
              sizes={size === "md" ? "260px" : "200px"}
              className="h-full w-auto object-contain object-left"
            />
          </span>
        );
      }
      const padCls =
        size === "md" ? "px-2.5 py-1 sm:px-3 sm:py-1.5" : "px-3 py-1.5";
      return (
        <span
          className={`relative inline-flex items-center ${heightCls} ${maxWCls} ${padCls} rounded-2xl bg-gradient-to-b from-white to-white/90 ring-1 ring-white/40 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.9)]`}
        >
          <Image
            src={logoPath}
            alt={`${brandName} logo`}
            height={size === "md" ? 56 : 40}
            width={size === "md" ? 260 : 200}
            sizes={size === "md" ? "260px" : "200px"}
            className="h-full w-auto object-contain"
          />
        </span>
      );
    }

    if (logoPath) {
      if (skipPlate) {
        return (
          <span className={`relative inline-grid place-items-center ${iconDim}`}>
            <Image
              src={logoPath}
              alt={`${brandName} logo`}
              fill
              sizes={size === "md" ? "44px" : "36px"}
              className="object-contain"
            />
          </span>
        );
      }
      return (
        <span
          className={`relative inline-grid place-items-center ${iconDim} rounded-2xl bg-gradient-to-b from-white to-white/85 p-[7px] ring-1 ring-white/40 shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.9)]`}
        >
          <Image
            src={logoPath}
            alt={`${brandName} logo`}
            fill
            sizes={size === "md" ? "44px" : "36px"}
            className="object-contain p-[3px]"
          />
        </span>
      );
    }
    return (
      <span
        className={`relative inline-grid place-items-center ${iconDim} rounded-2xl bg-white/10 ring-1 ring-white/25 backdrop-blur shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18)]`}
      >
        <Logo className={size === "md" ? "h-6 w-6 text-white" : "h-5 w-5 text-white"} />
      </span>
    );
  };

  const useWordmarkOnly = Boolean(logoPath && logoIsWordmark);

  const nameParts = splitBrandName(brandName);
  const renderBrandText = (size: "sm" | "md") => {
    const baseSize = size === "md" ? "text-[15px]" : "text-[13px]";
    return (
      <span className="flex min-w-0 flex-col leading-[1.08]">
        <span
          className={`font-display ${baseSize} font-semibold uppercase tracking-[0.09em] text-white whitespace-nowrap`}
        >
          {nameParts.line1}
        </span>
        {nameParts.line2 && (
          <span
            className={`font-display ${baseSize} font-medium uppercase tracking-[0.14em] text-white/65 whitespace-nowrap`}
          >
            {nameParts.line2}
          </span>
        )}
      </span>
    );
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
    if (!open) return;
    const scrollY = window.scrollY;
    const { body } = document;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
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
        <div className="gutter-x flex items-center justify-between gap-6 py-3 text-white lg:py-4">
          <div className="flex items-center gap-10">
            <div
              className="flex items-center gap-3"
              aria-label={brandName}
            >
              {renderLogo("md")}
              {!useWordmarkOnly && (
                <>
                  <span
                    className="hidden h-8 w-px bg-white/20 sm:block"
                    aria-hidden
                  />
                  {renderBrandText("md")}
                </>
              )}
            </div>
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
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2.5">
              {renderLogo("sm")}
              {!useWordmarkOnly && renderBrandText("sm")}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/20"
              aria-label="Close menu"
            >
              <Close className="h-4 w-4" />
            </button>
          </div>

          <nav className="mt-1 flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-5">
            {links.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
              >
                <span>{label}</span>
                <ChevronDown className="h-3.5 w-3.5 -rotate-90 opacity-60" />
              </button>
            ))}

            <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3.5 pb-[max(env(safe-area-inset-bottom),16px)]">
              <div className="px-1">
                <StatusBadge status={status} fallback={fallbackStatus} />
              </div>
              <a
                href={telHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5 text-[14px] font-medium text-white ring-1 ring-white/15"
              >
                <Phone className="h-3.5 w-3.5" />
                {displayPhone}
              </a>
              <a
                href="#booking"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-pill bg-white px-4 py-2.5 text-[14px] font-medium text-brand"
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
