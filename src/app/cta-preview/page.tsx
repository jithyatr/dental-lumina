import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Close,
  Logo,
  Sparkle,
  Star,
} from "../components/icons";
import { Footer } from "../components/Footer";

const CALENDLY_URL = "https://calendly.com/renish-tw-webandcrafts/30min";

export const metadata = {
  title: "Calendly CTA · Design Variants",
};

export default function CtaPreviewPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-mute text-navy">
      {/* Editorial backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 80% -10%, rgba(0,118,184,0.10), transparent 60%), radial-gradient(60% 50% at -10% 30%, rgba(251,177,3,0.08), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.95'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative mx-auto max-w-[1240px] px-6 py-16 lg:px-12 lg:py-24">
        <PageHeader />

        <div className="mt-24 space-y-32">
          <VariantCase
            number="01"
            kicker="The Pulse"
            title="Floating Action Pill"
            description="Always present, never blocking. A glowing bottom-right pill that follows scroll and quietly announces itself with a paced ring pulse. The pattern doctors already recognize from Stripe, Linear, Intercom — adapted to the brand's pill geometry."
            recommendation="Best for: high-intent doctors who scroll. Lowest visual cost."
          >
            <PreviewFrame variant="floating">
              <FakeSite />
              <VariantA />
            </PreviewFrame>
          </VariantCase>

          <VariantCase
            number="02"
            kicker="The Headline"
            title="Top Announcement Bar"
            description="A slender meta-strip stacked above the navbar. Reads as 'this is a preview, not the live site' which gives the agency permission to insert itself without competing with the patient CTAs below. Subtle horizontal shimmer keeps it alive without nagging."
            recommendation="Best for: framing the entire experience as a curated demo from the first frame."
          >
            <PreviewFrame variant="topbar">
              <VariantB />
              <FakeSite topOffset />
            </PreviewFrame>
          </VariantCase>

          <VariantCase
            number="03"
            kicker="The Confidante"
            title="Sticky Bottom Demo Bar"
            description="Pinned to the bottom edge with a soft slide-up, this strip pairs warm context ('Built for Angell Family Dentistry') with the call to act. The duality — observation + invitation — makes it feel like a collaborator, not an ad. Dismissible to respect autonomy."
            recommendation="Best for: anchoring the conversation when the doctor reaches the end of the page."
          >
            <PreviewFrame variant="bottom">
              <FakeSite />
              <VariantC />
            </PreviewFrame>
          </VariantCase>

          <VariantCase
            number="04"
            kicker="The Conversation"
            title="Intercom-style Persona Card"
            description="A small business card from the bottom-left, with a real avatar and a human note from Renish at WAC. This is the highest-conversion pattern in B2B because it transforms a page click into a 1:1 invitation. Best when the agency wants to feel like a partner, not a vendor."
            recommendation="Best for: signaling premium / hand-crafted service. Pairs well with a small concierge follow-up."
          >
            <PreviewFrame variant="persona">
              <FakeSite />
              <VariantD />
            </PreviewFrame>
          </VariantCase>

          <VariantCase
            number="05"
            kicker="The Margin"
            title="Side Rail"
            description="A slim vertical ribbon clinging to the right edge of the viewport, just below the fold. Operates on a different spatial axis than every other variant — never collides with the patient CTA, sticky mobile bar, or any future overlays. Rotated typography reads as 'a stamp from the maker' rather than an ad."
            recommendation="Best for: keeping the floor clean while staying ambient. Pair with a hover state that expands into the full pill."
          >
            <PreviewFrame variant="rail">
              <FakeSite />
              <VariantE />
            </PreviewFrame>
          </VariantCase>

          <VariantCase
            number="06"
            kicker="The Bridge"
            title="Inline Section Interlude"
            description="Instead of floating over the page, this variant lives between two sections of content — a full-width card that reads like a curator's note. Because it flows with the document instead of overlaying it, the reader meets it mid-scroll, when curiosity is already engaged. Lowest pressure, highest narrative."
            recommendation="Best for: doctors who scroll. Removes the 'is this an ad?' tension entirely."
          >
            <PreviewFrame variant="interlude">
              <FakeSiteWithInterlude />
            </PreviewFrame>
          </VariantCase>

          <VariantCase
            number="07"
            kicker="The Signature"
            title="Corner Watermark"
            description="A whisper — a tiny pill in the top-right that names the studio and offers a click. Borrows the visual logic of 'Made with Vercel' or 'Built on Notion': permanent, never in the way, only legible to someone deliberately looking. Maximum trust, minimum air."
            recommendation="Best for: a fully launched live demo where the agency wants to retain credit without selling. Combine with one other variant for active conversion."
          >
            <PreviewFrame variant="watermark">
              <FakeSite />
              <VariantG />
            </PreviewFrame>
          </VariantCase>

          <VariantCase
            number="08"
            kicker="The Open Calendar"
            title="Inline Slot Preview"
            description="A real glimpse of the calendar — three or four upcoming time chips visible inside a card on the page. Clicking any chip opens Calendly already prefilled. Removes the abstraction of 'book a call'; replaces it with 'is Thursday at 3pm good?'. The boldest possible commitment to the action."
            recommendation="Best for: maximum intent and conversion. Works only when slot times feel current — needs a small refresh signal."
          >
            <PreviewFrame variant="slots">
              <FakeSite />
              <VariantH />
            </PreviewFrame>
          </VariantCase>
        </div>
      </div>

      <Footer clinicName="Lumina Dental Care" />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Editorial chrome                                                            */
/* -------------------------------------------------------------------------- */

function PageHeader() {
  return (
    <header className="relative">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-white">
          <Sparkle className="h-4 w-4" />
        </span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.28em] text-navy/55">
          WAC · Demo CTA Concepts
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <h1 className="font-display text-[clamp(44px,7vw,84px)] font-medium leading-[0.98] tracking-[-0.035em] text-navy">
            Four ways to open <br />
            <span className="italic text-brand">the conversation.</span>
          </h1>
          <p className="mt-7 max-w-[560px] text-[17px] leading-[1.6] text-navy/65">
            A meta-CTA layered on top of the regenerated demo site so the
            clinician can book a 30-minute call with Web and Crafts. The page
            already converts patients — this layer is for the doctor. Each
            variant is shown inside a faux browser at native scale so you can
            judge presence, hierarchy, and breathing room.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-navy/55">
            <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-line">
              Single href · target=_blank
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-line">
              Tokens: brand · navy · gold
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-line">
              No new components shipped
            </span>
          </div>
        </div>

        <aside className="lg:col-span-4">
          <div className="rounded-3xl bg-white p-6 ring-1 ring-line shadow-card">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
              <span className="relative grid h-2 w-2 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
                <span className="relative h-2 w-2 rounded-full bg-success" />
              </span>
              Live preview
            </div>
            <p className="mt-3 text-[14px] leading-[1.55] text-navy/70">
              All four buttons below are real links. Click any one to open the
              actual Calendly slot picker in a new tab.
            </p>
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-brand transition hover:gap-3"
            >
              calendly.com/renish-tw-webandcrafts
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </aside>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Case study layout                                                           */
/* -------------------------------------------------------------------------- */

function VariantCase({
  number,
  kicker,
  title,
  description,
  recommendation,
  children,
}: Readonly<{
  number: string;
  kicker: string;
  title: string;
  description: string;
  recommendation: string;
  children: ReactNode;
}>) {
  return (
    <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-4">
        <div className="flex items-start gap-5">
          <div className="font-display text-[88px] font-medium leading-none tracking-[-0.05em] text-brand/85">
            {number}
          </div>
          <div className="mt-2 h-px w-12 bg-navy/20" />
        </div>
        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.28em] text-navy/45">
          {kicker}
        </p>
        <h2 className="mt-3 font-display text-[clamp(28px,3.2vw,42px)] font-medium leading-[1.05] tracking-[-0.02em] text-navy">
          {title}
        </h2>
        <p className="mt-5 text-[15.5px] leading-[1.65] text-navy/65">
          {description}
        </p>
        <div className="mt-6 rounded-2xl bg-white p-4 ring-1 ring-line">
          <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.24em] text-gold">
            <Star className="h-3 w-3" />
            Designer note
          </div>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-navy/75">
            {recommendation}
          </p>
        </div>
      </div>

      <div className="lg:col-span-8">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Faux browser frame                                                          */
/* -------------------------------------------------------------------------- */

function PreviewFrame({
  variant,
  children,
}: Readonly<{ variant: string; children: ReactNode }>) {
  return (
    <div className="relative">
      <div className="absolute -inset-3 -z-10 rounded-[36px] bg-gradient-to-br from-brand/15 via-transparent to-gold/10 blur-2xl" />

      <div className="overflow-hidden rounded-[28px] bg-white ring-1 ring-line shadow-[0_30px_80px_-30px_rgba(11,5,15,0.35)]">
        {/* Faux chrome */}
        <div className="flex items-center justify-between border-b border-line bg-mute/60 px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF6058]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2F]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#29C740]" />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] text-navy/55 ring-1 ring-line">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              angellfamilydentistry.lumina.app
            </div>
          </div>
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-navy/40">
            Variant {variant.toUpperCase().slice(0, 1) ? variant : ""}
          </div>
        </div>

        {/* Inner scene — fixed height so layout is comparable */}
        <div className="relative h-[520px] overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mock landing-page backdrop (re-rendered identically in every frame)         */
/* -------------------------------------------------------------------------- */

function FakeSite({ topOffset = false }: { topOffset?: boolean } = {}) {
  return (
    <div className={`absolute inset-0 bg-brand-deep text-white ${topOffset ? "pt-9" : ""}`}>
      {/* Atmosphere */}
      <div className="pointer-events-none absolute -left-32 -top-24 h-[360px] w-[360px] rounded-full bg-[#138acc] opacity-60 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-[320px] w-[320px] rounded-full bg-[#0099d0] opacity-70 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-10 left-1/3 h-[260px] w-[460px] rounded-full bg-brand-deep opacity-70 blur-[140px]" />

      {/* Faux navbar */}
      <div className="relative flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-white/95 p-1">
            <Logo className="h-5 w-5 text-brand" />
          </span>
          <span className="font-display text-[14px] font-medium uppercase tracking-[0.04em]">
            Angell Family Dentistry
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-[12px] text-white/85 md:flex">
          <span>About</span>
          <span>Services</span>
          <span>Patients</span>
          <span>Media</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/20 md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Closed
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand px-3 py-1.5 text-[11px] font-medium">
            Book Appointment
          </span>
        </div>
      </div>

      {/* Hero body */}
      <div className="relative grid grid-cols-12 gap-6 px-8 pt-2">
        <div className="col-span-7">
          <h3 className="font-display text-[40px] font-medium leading-[1.02] tracking-[-0.03em]">
            Gentle care, <br />
            <span className="text-white">modern smiles.</span>
          </h3>
          <p className="mt-4 max-w-[360px] text-[12.5px] leading-[1.55] text-white/80">
            Experience patient-focused dentistry in Columbia Heights — same-day
            crowns, dental implants, pediatric care, and flexible financing.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-pill bg-white px-4 py-2 text-[12px] font-medium text-navy">
              Book Free Consultation
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand">
                <ArrowUpRight className="h-3 w-3 text-white" />
              </span>
            </span>
          </div>
          <div className="mt-6 flex items-center gap-4 text-[10.5px] text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3 w-3" /> No insurance? No problem
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3 w-3" /> 0% financing
            </span>
          </div>
        </div>
        <div className="col-span-5 relative">
          <div className="ml-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden rounded-2xl ring-1 ring-white/15">
            <div className="h-full w-full bg-[linear-gradient(135deg,#3a8fbe,#0b3b5f)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VARIANT A — Floating action pill, bottom-right                              */
/* -------------------------------------------------------------------------- */

function VariantA() {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group absolute bottom-6 right-6 z-20"
      aria-label="Book a 30-minute call with Web and Crafts"
    >
      {/* Outer paced ping ring */}
      <span className="pointer-events-none absolute inset-0 -m-2 rounded-pill bg-brand/40 opacity-70 [animation:ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
      <span className="pointer-events-none absolute inset-0 -m-1 rounded-pill bg-brand/30 opacity-80 [animation:ping_2.4s_cubic-bezier(0,0,0.2,1)_0.6s_infinite]" />

      <span className="relative inline-flex items-center gap-3 rounded-pill bg-brand-gradient pl-3 pr-1.5 py-1.5 text-white shadow-[0_20px_50px_-20px_rgba(0,118,184,0.95)] ring-1 ring-white/30 transition-transform duration-300 group-hover:-translate-y-0.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur">
          <Calendar className="h-4 w-4" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/75">
            Web and Crafts
          </span>
          <span className="text-[14px] font-medium">Book a 30-min call</span>
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-brand transition group-hover:rotate-12">
          <ArrowUpRight className="h-4 w-4" />
        </span>

        {/* corner sparkle */}
        <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-gold text-navy ring-2 ring-brand-deep">
          <Sparkle className="h-2.5 w-2.5" />
        </span>
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* VARIANT B — Top announcement bar                                            */
/* -------------------------------------------------------------------------- */

function VariantB() {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="absolute inset-x-0 top-0 z-20 block"
    >
      <div className="relative flex h-9 items-center justify-center gap-3 overflow-hidden bg-navy text-[11.5px] font-medium text-white">
        {/* Shimmer line */}
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-brand/40 to-transparent"
          style={{
            animation: "ctaShimmer 5s linear infinite",
          }}
        />

        <span className="relative inline-flex items-center gap-2">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-gold text-navy">
            <Sparkle className="h-2.5 w-2.5" />
          </span>
          <span className="text-white/75">Like what you see?</span>
          <span className="hidden text-white/35 md:inline">·</span>
          <span className="font-display text-[13px] italic tracking-tight text-white">
            Built for Angell Family Dentistry in 4 minutes.
          </span>
        </span>

        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/20 transition hover:bg-white hover:text-navy">
          <Calendar className="h-3 w-3" />
          Book 30-min call
          <ArrowRight className="h-3 w-3" />
        </span>

        <button
          type="button"
          aria-label="Dismiss"
          className="relative ml-1 grid h-5 w-5 place-items-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white"
        >
          <Close className="h-3 w-3" />
        </button>
      </div>

      {/* keyframes (scoped inline) */}
      <style>{`
        @keyframes ctaShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* VARIANT C — Sticky bottom demo bar                                          */
/* -------------------------------------------------------------------------- */

function VariantC() {
  return (
    <div className="absolute inset-x-0 bottom-0 z-20">
      <div
        className="relative mx-4 mb-4 rounded-2xl border border-white/15 bg-navy/95 px-5 py-4 text-white shadow-[0_24px_60px_-20px_rgba(11,5,15,0.55)] backdrop-blur"
        style={{ animation: "ctaSlideUp 0.6s cubic-bezier(0.2,0.8,0.2,1) both" }}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <Sparkle className="h-4 w-4 text-gold" />
            </span>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/55">
                Web and Crafts · Demo site
              </p>
              <p className="mt-1 font-display text-[16px] leading-tight tracking-[-0.01em]">
                Built for{" "}
                <span className="italic text-brand-3">
                  Angell Family Dentistry
                </span>{" "}
                — want one for your practice?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-pill bg-brand-gradient px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_14px_30px_-14px_rgba(0,118,184,0.95)] transition hover:-translate-y-0.5"
            >
              <Calendar className="h-4 w-4" />
              Book a 30-min call
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-brand transition group-hover:rotate-12">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </a>
            <button
              type="button"
              aria-label="Dismiss"
              className="grid h-8 w-8 place-items-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"
            >
              <Close className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ctaSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VARIANT D — Persona card, bottom-left                                       */
/* -------------------------------------------------------------------------- */

function VariantD() {
  return (
    <div
      className="absolute bottom-6 left-6 z-20 w-[320px]"
      style={{ animation: "ctaCardIn 0.55s cubic-bezier(0.2,0.8,0.2,1) both" }}
    >
      <div className="relative rounded-3xl bg-white p-4 ring-1 ring-navy/10 shadow-[0_30px_60px_-20px_rgba(11,5,15,0.35)]">
        {/* small tail */}
        <span className="absolute -bottom-1.5 left-10 h-3 w-3 rotate-45 bg-white ring-1 ring-navy/10 [clip-path:polygon(100%_0,100%_100%,0_100%)]" />

        <div className="flex items-start gap-3">
          <div className="relative">
            <span
              aria-hidden
              className="grid h-11 w-11 place-items-center rounded-full text-[13px] font-semibold uppercase tracking-wide text-white"
              style={{
                background:
                  "linear-gradient(135deg,#0076b8 0%,#329acf 55%,#63bee5 100%)",
              }}
            >
              RW
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-white">
              <span className="relative grid h-2.5 w-2.5 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-success" />
              </span>
            </span>
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/45">
              Web and Crafts
            </p>
            <p className="mt-0.5 text-[14px] font-medium text-navy">
              Renish · Studio Lead
            </p>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            className="grid h-7 w-7 place-items-center rounded-full text-navy/35 transition hover:bg-mute hover:text-navy"
          >
            <Close className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="mt-4 text-[13.5px] leading-[1.55] text-navy/75">
          Hi Dr. Angell — this site was generated for{" "}
          <span className="font-medium text-navy">your practice</span> overnight.
          Want to bring it live? Pick a 30-minute slot and we&rsquo;ll walk
          through next steps together.
        </p>

        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 flex w-full items-center justify-between rounded-2xl bg-navy px-4 py-3 text-white transition hover:bg-brand-deep"
        >
          <span className="inline-flex items-center gap-2 text-[13px] font-medium">
            <Calendar className="h-4 w-4 text-brand-3" />
            Book a 30-min call
          </span>
          <ArrowUpRight className="h-4 w-4 text-brand-3 transition group-hover:rotate-12 group-hover:text-white" />
        </a>

        <div className="mt-3 flex items-center justify-between text-[10.5px] text-navy/45">
          <span className="inline-flex items-center gap-1.5">
            <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-success/10 text-success">
              <Check className="h-2.5 w-2.5" />
            </span>
            Replies in &lt; 2h
          </span>
          <span>Free · No obligation</span>
        </div>
      </div>

      <style>{`
        @keyframes ctaCardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VARIANT E — Side rail, right edge                                           */
/* -------------------------------------------------------------------------- */

function VariantE() {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group absolute right-0 top-1/2 z-20 -translate-y-1/2"
      aria-label="Book a 30-minute call"
    >
      <span className="pointer-events-none absolute -inset-1 rounded-l-2xl bg-brand/30 opacity-70 blur-md" />
      <span
        className="relative flex flex-col items-center gap-3 rounded-l-2xl bg-brand-gradient px-2.5 py-5 text-white shadow-[-12px_18px_40px_-18px_rgba(0,118,184,0.85)] ring-1 ring-white/30 transition-transform duration-300 group-hover:-translate-x-1"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15 ring-1 ring-white/30">
          <Calendar className="h-3.5 w-3.5" />
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Book a 30-min call
        </span>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-brand">
          <ArrowUpRight className="h-3 w-3 -rotate-90" />
        </span>
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* VARIANT F — Inline section interlude (lives between sections)               */
/* -------------------------------------------------------------------------- */

function FakeSiteWithInterlude() {
  return (
    <div className="absolute inset-0 overflow-y-hidden bg-mute">
      {/* Compressed hero (top) */}
      <div className="relative h-[200px] overflow-hidden bg-brand-deep text-white">
        <div className="pointer-events-none absolute -left-32 -top-24 h-[260px] w-[260px] rounded-full bg-[#138acc] opacity-60 blur-[110px]" />
        <div className="pointer-events-none absolute -right-20 top-10 h-[220px] w-[220px] rounded-full bg-[#0099d0] opacity-70 blur-[110px]" />

        <div className="relative flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-white/95 p-1">
              <Logo className="h-5 w-5 text-brand" />
            </span>
            <span className="font-display text-[14px] font-medium uppercase tracking-[0.04em]">
              Angell Family Dentistry
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand px-3 py-1.5 text-[11px] font-medium text-white">
            Book Appointment
          </span>
        </div>
        <div className="relative px-8 pt-2">
          <h3 className="font-display text-[28px] font-medium leading-[1.04] tracking-[-0.02em]">
            Gentle care, <span className="italic text-brand-3">modern smiles.</span>
          </h3>
          <p className="mt-2 max-w-[420px] text-[11.5px] text-white/75">
            Same-day crowns, dental implants, pediatric care, flexible financing.
          </p>
        </div>
      </div>

      {/* Interlude card (the variant itself) */}
      <div className="relative -mt-6 px-6">
        <VariantF />
      </div>

      {/* Faux next-section glimpse */}
      <div className="relative mt-6 px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/45">
          By the numbers
        </p>
        <div className="mt-3 grid grid-cols-4 gap-3 text-navy">
          {[
            { v: "18+", l: "Years" },
            { v: "4.9", l: "Rating" },
            { v: "600+", l: "Reviews" },
            { v: "Same-Day", l: "Crowns" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl bg-white p-3 ring-1 ring-line"
            >
              <p className="font-display text-[18px] font-medium leading-none">
                {s.v}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-navy/55">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VariantF() {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative overflow-hidden rounded-3xl bg-navy p-5 text-white shadow-[0_30px_60px_-30px_rgba(11,5,15,0.55)]">
        {/* Subtle gradient orb */}
        <span className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/40 blur-3xl" />
        <span className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />

        <div className="relative flex items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Sparkle className="h-5 w-5 text-gold" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/55">
                A note from Web and Crafts
              </p>
              <p className="mt-1.5 font-display text-[19px] leading-[1.2] tracking-[-0.015em]">
                We made this site for{" "}
                <span className="italic text-brand-3">Angell Family Dentistry</span>{" "}
                in one evening. Want one for yours?
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 md:block">
            <span className="inline-flex items-center gap-2.5 rounded-pill bg-white px-4 py-2.5 text-[13px] font-medium text-navy transition group-hover:-translate-y-0.5">
              <Calendar className="h-4 w-4 text-brand" />
              Book a 30-min call
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-white transition group-hover:rotate-12">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* VARIANT G — Corner watermark                                                */
/* -------------------------------------------------------------------------- */

function VariantG() {
  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group absolute right-4 top-4 z-20"
    >
      <span className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-1.5 text-[10.5px] font-medium text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white hover:text-navy">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-gold text-navy">
          <Sparkle className="h-2.5 w-2.5" />
        </span>
        <span className="text-white/85 transition group-hover:text-navy/55">
          Built by
        </span>
        <span className="font-semibold uppercase tracking-[0.16em]">
          Web and Crafts
        </span>
        <span className="mx-0.5 h-2 w-px bg-white/30 transition group-hover:bg-navy/20" />
        <span className="inline-flex items-center gap-1 text-white transition group-hover:text-brand">
          Book a call
          <ArrowUpRight className="h-3 w-3" />
        </span>
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* VARIANT H — Inline slot preview                                             */
/* -------------------------------------------------------------------------- */

const SLOTS_DEMO = [
  { day: "Thu", date: "May 23", time: "3:00 PM" },
  { day: "Fri", date: "May 24", time: "11:30 AM" },
  { day: "Mon", date: "May 27", time: "9:00 AM" },
  { day: "Tue", date: "May 28", time: "4:30 PM" },
];

function VariantH() {
  return (
    <div
      className="absolute bottom-6 right-6 z-20 w-[340px]"
      style={{ animation: "ctaCardIn 0.55s cubic-bezier(0.2,0.8,0.2,1) both" }}
    >
      <div className="rounded-3xl bg-white p-5 ring-1 ring-navy/10 shadow-[0_30px_60px_-20px_rgba(11,5,15,0.35)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-navy/45">
                Web and Crafts
              </p>
              <p className="mt-0.5 text-[13.5px] font-medium text-navy">
                Pick a 30-min slot
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-success">
            <span className="relative grid h-1.5 w-1.5 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-success/70" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Open
          </span>
        </div>

        <p className="mt-3 text-[12px] leading-[1.55] text-navy/65">
          Free 30-min walkthrough of this site &amp; what it takes to launch.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {SLOTS_DEMO.map((s) => (
            <a
              key={`${s.date}-${s.time}`}
              href={CALENDLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-xl bg-mute px-3 py-2 text-left ring-1 ring-line transition hover:bg-brand hover:text-white hover:ring-brand"
            >
              <div>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.18em] text-navy/55 transition group-hover:text-white/75">
                  {s.day} · {s.date}
                </p>
                <p className="mt-0.5 font-display text-[14px] leading-none text-navy transition group-hover:text-white">
                  {s.time}
                </p>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-navy/35 transition group-hover:text-white" />
            </a>
          ))}
        </div>

        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-between rounded-2xl bg-navy px-4 py-2.5 text-[12.5px] font-medium text-white transition hover:bg-brand-deep"
        >
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-brand-3" />
            See all available times
          </span>
          <ArrowRight className="h-3.5 w-3.5 text-brand-3" />
        </a>
      </div>
    </div>
  );
}
