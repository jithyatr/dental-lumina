import type { SVGProps } from "react";
import { Search, Shield } from "./icons";

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

const cards = [
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

export function Payment() {
  return (
    <section className="relative isolate overflow-hidden bg-brand py-24 text-white lg:py-32">
      <div className="gutter-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-[clamp(34px,5vw,56px)] font-medium leading-[1.08]">
            Flexible Payment
            <br />
            Options
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] text-white/80">
            We believe everyone deserves a healthy smile. We offer various
            financing plans to fit your budget.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
          {cards.map(({ Icon, title, desc, badge }) => (
            <article
              key={title}
              className="group flex flex-col items-center rounded-3xl bg-white p-8 text-center text-navy shadow-[0_30px_70px_-30px_rgba(7,87,136,0.55)] transition hover:-translate-y-1"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white shadow-[0_10px_24px_-10px_rgba(0,118,184,0.6)]">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-[18px] font-medium text-navy">{title}</h3>
              <p className="mt-3 max-w-[260px] text-[13.5px] leading-[1.6] text-navy/60">
                {desc}
              </p>
              <span className="mt-auto inline-flex rounded-full bg-mute px-4 py-1.5 text-[12px] font-medium text-navy/70">
                {badge}
              </span>
            </article>
          ))}
        </div>

        {/* Insurance Checker */}
        <div className="mx-auto mt-14 max-w-2xl text-center">
          <h3 className="font-display text-[22px] font-medium text-white">
            Digital Insurance Checker
          </h3>
          <form className="mt-5 flex items-center gap-2 rounded-full bg-white p-2 pl-5 shadow-[0_18px_40px_-18px_rgba(7,87,136,0.55)]">
            <Search className="h-4 w-4 shrink-0 text-navy/50" />
            <input
              type="text"
              placeholder="e.g, Delta Dental, Cigna"
              className="flex-1 bg-transparent py-2 text-[14px] text-navy placeholder:text-navy/50 outline-none"
            />
            <button className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-brand px-5 text-[13px] font-medium text-white hover:bg-brand-deep transition">
              Check Your Coverage
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
