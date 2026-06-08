"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Differentiator, WhyChoosePillar } from "@/types/clinic";

const HERO_IMAGE = "/images/why-choose-image.webp";

const DEFAULT_PILLARS = [
  {
    title: "Strong & Natural",
    desc: "Implants that mimic the strength and appearance of natural teeth.",
  },
  {
    title: "Long-Term Stability",
    desc: "Designed to last for decades with proper care and maintenance.",
  },
  {
    title: "Advanced Tech",
    desc: "Using 3D imaging and guided surgery for precision placement.",
  },
  {
    title: "Daily Function",
    desc: "Eat, speak, and smile with complete confidence every day.",
  },
];

const INTERVAL_MS = 2000;

function buildPillars(
  customPillars: WhyChoosePillar[] | undefined,
  differentiators: Differentiator[] | undefined,
): { title: string; desc: string }[] {
  if (customPillars && customPillars.length > 0) {
    return customPillars.map((p) => ({ title: p.title, desc: p.description }));
  }
  if (differentiators && differentiators.length > 0) {
    return differentiators.map((d) => ({ title: d.title, desc: d.description }));
  }
  return DEFAULT_PILLARS;
}

export function WhyChoose({
  label,
  headline,
  subheading,
  clinicName,
  image,
  pillars,
  differentiators,
}: Readonly<{
  label?: string;
  headline?: string;
  subheading?: string;
  clinicName?: string;
  image?: string;
  pillars?: WhyChoosePillar[];
  differentiators?: Differentiator[];
}> = {}) {
  const items = buildPillars(pillars, differentiators);
  const sectionLabel = label ?? (clinicName ? `Why ${clinicName}` : "Why Lumina");
  const title =
    headline ??
    (clinicName
      ? `Why Choose ${clinicName}`
      : "Why Choose Lumina for Dental Implants");
  const sub =
    subheading ??
    "We provide dependable daily function and a natural look that lasts a lifetime.";
  const heroImage = image ?? HERO_IMAGE;

  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [active, items.length]);

  const select = (i: number) => setActive(i);

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="gutter-x grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <span className="text-[13px] uppercase tracking-[0.25em] text-navy/55">
            {sectionLabel}
          </span>
          <h2 className="mt-3 font-display text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.1] text-navy">
            {title}
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-[1.55] text-navy/70">
            {sub}
          </p>

          <ul className="mt-10 space-y-1">
            {items.map((p, i) => {
              const on = active === i;
              return (
                <li key={p.title}>
                  <button
                    onClick={() => select(i)}
                    className="flex w-full items-start gap-5 py-4 text-left"
                  >
                    <span
                      className={`mt-1.5 block w-1 self-stretch rounded-full transition ${
                        on ? "bg-brand" : "bg-pale-blue"
                      }`}
                    />
                    <span className="flex-1">
                      <span
                        className={`block text-[20px] font-medium transition ${
                          on ? "text-navy" : "text-navy/70"
                        }`}
                      >
                        {p.title}
                      </span>
                      <span
                        className={`mt-1 block text-[14px] transition ${
                          on ? "text-navy/70" : "text-navy/50"
                        }`}
                      >
                        {p.desc}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <div className="relative w-full overflow-hidden rounded-2xl aspect-[6/5] bg-mute">
            <Image
              src={heroImage}
              alt={title}
              fill
              sizes="(min-width:1024px) 55vw, 100vw"
              className="object-cover object-top"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
