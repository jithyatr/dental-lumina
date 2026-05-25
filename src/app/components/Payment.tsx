"use client";
import { useMemo, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { Check, Search, Shield } from "./icons";
import type { PaymentOption } from "@/types/clinic";

const Wallet = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h13l3 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    <path d="M16 13h3" />
    <circle cx="17" cy="13" r="0.6" fill="currentColor" />
  </svg>
);

const CreditCard = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <path d="M7 15h4" />
  </svg>
);

const PAYMENT_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  shield: Shield,
  wallet: Wallet,
  "credit-card": CreditCard,
};
const PAYMENT_ICON_ORDER = ["shield", "wallet", "credit-card"];

const DEFAULT_PROVIDERS = [
  "Delta Dental",
  "Cigna",
  "Aetna",
  "MetLife",
  "Guardian",
  "UnitedHealthcare",
  "Humana",
  "Anthem Blue Cross Blue Shield",
  "Principal",
  "Ameritas",
  "Sun Life",
  "Lincoln Financial",
];

const DEFAULT_CARDS = [
  {
    Icon: Shield,
    title: "Insurance",
    desc: "We work with most major PPO insurance providers to maximize your benefits.",
    badge: "Direct Billing Available",
  },
  {
    Icon: Wallet,
    title: "In-House Financing",
    desc: "Break up your treatment cost into predictable, interest-free monthly payments.",
    badge: "0% APR Options",
  },
  {
    Icon: CreditCard,
    title: "Third Party Credit",
    desc: "We accept CareCredit and other financing for smile makeovers.",
    badge: "Instant Approval",
  },
];

function buildCards(custom: PaymentOption[] | undefined) {
  if (!custom || custom.length === 0) return DEFAULT_CARDS;
  return custom.map((o, i) => {
    const iconKey =
      o.iconName && o.iconName in PAYMENT_ICONS
        ? o.iconName
        : PAYMENT_ICON_ORDER[i % PAYMENT_ICON_ORDER.length];
    return {
      Icon: PAYMENT_ICONS[iconKey],
      title: o.title,
      desc: o.description,
      badge: o.badge ?? "",
    };
  });
}

type Result = { provider: string; accepted: boolean };

export function Payment({
  headline,
  subheading,
  providers,
  options,
}: Readonly<{
  headline?: string;
  subheading?: string;
  providers?: string[];
  options?: PaymentOption[];
}> = {}) {
  const acceptedProviders =
    providers && providers.length > 0 ? providers : DEFAULT_PROVIDERS;
  const cards = buildCards(options);
  const titleText = headline ?? "Flexible Payment\nOptions";
  const titleLines = titleText.split("\n");
  const sub =
    subheading ??
    "We believe everyone deserves a healthy smile. We offer various financing plans to fit your budget.";

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return acceptedProviders
      .filter((p) => p.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query, acceptedProviders]);

  const checkCoverage = (raw?: string) => {
    const name = (raw ?? query).trim();
    if (!name) return;
    const match = acceptedProviders.find(
      (p) => p.toLowerCase() === name.toLowerCase()
    );
    setQuery(match ?? name);
    setOpen(false);
    setResult({ provider: match ?? name, accepted: Boolean(match) });
  };

  const reset = () => {
    setResult(null);
    setQuery("");
  };

  return (
    <section
      className="relative z-10 py-24 text-white lg:py-32"
      style={{
        background:
          "linear-gradient(180deg, #0076B8 0%, #479CCC 50%, #B0D4E9 85%, #FFFFFF 100%)",
      }}
    >
      <div className="gutter-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[clamp(34px,5vw,56px)] font-medium leading-[1.08]">
            {titleLines.map((line, i) => (
              <span key={`${line}-${i}`}>
                {line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] text-white/80">
            {sub}
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {cards.map(({ Icon, title, desc, badge }) => (
            <article
              key={title}
              className="group flex flex-col rounded-3xl bg-white p-4 text-center text-navy shadow-[0_30px_70px_-30px_rgba(7,87,136,0.55)] transition hover:-translate-y-1"
            >
              <div
                className="flex h-40 items-center justify-center rounded-2xl text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #0076B8 0%, #479CCC 60%, #6FB4DC 100%)",
                }}
              >
                <Icon className="h-8 w-8" />
              </div>
              <div className="flex flex-1 flex-col px-4 pb-2 pt-6">
                <h3 className="text-[18px] font-medium text-navy">{title}</h3>
                <p className="mt-3 text-[13.5px] leading-[1.6] text-navy/60">
                  {desc}
                </p>
                <div className="mt-auto w-full pt-5">
                  <div className="mb-4 h-px w-full bg-navy/10" />
                  <p className="text-[12px] font-medium text-navy/55">{badge}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Insurance Checker */}
        <div className="mx-auto mt-14 max-w-2xl text-center">
          <h3 className="font-display text-[22px] font-medium text-white">
            Digital Insurance Checker
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              checkCoverage();
            }}
            className="relative mt-5"
          >
            <div className="flex flex-col gap-2 rounded-3xl bg-white p-2 shadow-[0_18px_40px_-18px_rgba(7,87,136,0.55)] sm:flex-row sm:items-center sm:rounded-full sm:pl-5">
              <div className="flex flex-1 items-center gap-2 pl-3 sm:pl-0">
                <Search className="h-4 w-4 shrink-0 text-navy/50" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    if (result) setResult(null);
                  }}
                  onFocus={() => setOpen(true)}
                  onBlur={() => setTimeout(() => setOpen(false), 150)}
                  placeholder="e.g, Delta Dental, Cigna"
                  className="w-full flex-1 bg-transparent py-2 text-[14px] text-navy placeholder:text-navy/50 outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-full bg-brand px-5 text-[13px] font-medium text-white transition hover:bg-brand-deep sm:h-10 sm:w-auto"
              >
                Check Your Coverage
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {open && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-white text-left text-navy shadow-[0_24px_60px_-20px_rgba(7,87,136,0.5)]">
                {suggestions.map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        checkCoverage(p);
                      }}
                      className="flex w-full items-center gap-2 px-5 py-3 text-[14px] hover:bg-mute"
                    >
                      <Check className="h-3.5 w-3.5 text-success" />
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Result card */}
          {result && (
            <div
              className={`mx-auto mt-5 flex max-w-xl items-start gap-3 rounded-2xl p-4 text-left ${
                result.accepted
                  ? "bg-white text-navy shadow-[0_18px_40px_-18px_rgba(7,87,136,0.55)]"
                  : "bg-white/95 text-navy shadow-[0_18px_40px_-18px_rgba(7,87,136,0.55)]"
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
                  result.accepted
                    ? "bg-success/15 text-success"
                    : "bg-brand/10 text-brand"
                }`}
              >
                {result.accepted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Shield className="h-5 w-5" />
                )}
              </span>
              <div className="flex-1">
                {result.accepted ? (
                  <>
                    <div className="text-[15px] font-medium">
                      Yes — we accept {result.provider}
                    </div>
                    <p className="mt-1 text-[13px] text-navy/65">
                      We're in-network with direct billing. Bring your card to
                      your visit and we'll handle the paperwork.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-[15px] font-medium">
                      We're not in-network with {result.provider}
                    </div>
                    <p className="mt-1 text-[13px] text-navy/65">
                      You can still use your out-of-network benefits — we'll
                      provide claim forms and help you get reimbursed. Or pick
                      one of our financing options above.
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={reset}
                aria-label="Clear"
                className="text-navy/40 transition hover:text-navy"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M6 6l12 12M6 18 18 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
