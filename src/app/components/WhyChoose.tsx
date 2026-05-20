"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { WhyChoosePillar, Differentiator } from "@/types/clinic";

const DEFAULT_PILLARS: WhyChoosePillar[] = [
  {
    title: "Strong & Natural",
    description: "Implants that mimic the strength and appearance of natural teeth.",
    image: "/images/why-choose-image.png",
  },
  {
    title: "Long-Term Stability",
    description: "Designed to last for decades with proper care and maintenance.",
    image: "/images/benefits-implant.png",
  },
  {
    title: "Advanced Tech",
    description: "Using 3D imaging and guided surgery for precision placement.",
    image: "/images/implant-placement-after.png",
  },
  {
    title: "Daily Function",
    description: "Eat, speak, and smile with complete confidence every day.",
    image: "/images/smile-makeover-after.png",
  },
];

const DEFAULT_IMAGES = DEFAULT_PILLARS.map((p) => p.image as string);

function buildPillars(
  pillars: WhyChoosePillar[] | undefined,
  differentiators: Differentiator[] | undefined
): WhyChoosePillar[] {
  if (pillars && pillars.length > 0) return pillars;
  if (differentiators && differentiators.length > 0) {
    return differentiators.map((d, i) => ({
      title: d.title,
      description: d.description,
      image: DEFAULT_IMAGES[i % DEFAULT_IMAGES.length],
    }));
  }
  return DEFAULT_PILLARS;
}

const INTERVAL_MS = 2000;

export function WhyChoose({
  label,
  headline,
  subheading,
  pillars,
  differentiators,
}: Readonly<{
  label?: string;
  headline?: string;
  subheading?: string;
  pillars?: WhyChoosePillar[];
  differentiators?: Differentiator[];
}>) {
  const items = buildPillars(pillars, differentiators);
  const sectionLabel = label ?? "Why Lumina";
  const title = headline ?? "Why Choose Lumina for Dental Implants";
  const sub =
    subheading ??
    "We provide dependable daily function and a natural look that lasts a lifetime.";

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
                        {p.description}
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
            {items.map((p, i) => (
              <Image
                key={p.title}
                src={p.image ?? DEFAULT_IMAGES[i % DEFAULT_IMAGES.length]}
                alt={p.title}
                fill
                sizes="(min-width:1024px) 55vw, 100vw"
                className={`object-cover transition-opacity duration-700 ease-out ${
                  active === i ? "opacity-100" : "opacity-0"
                }`}
                priority={i === 0}
              />
            ))}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute right-7 top-7 font-display text-[clamp(48px,8vw,96px)] font-semibold text-white/95 leading-none tracking-[-0.03em]">
              0{active + 1}
            </div>
            <div className="absolute bottom-7 left-7 right-7 text-white">
              <div className="text-[13px] uppercase tracking-[0.25em] text-white/75">
                Reason {active + 1} of {items.length}
              </div>
              <div className="mt-2 font-display text-[26px] font-medium leading-tight">
                {items[active].title}
              </div>
              <p className="mt-2 max-w-md text-[14px] text-white/80">
                {items[active].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
