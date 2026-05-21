"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const HERO_IMAGE = "/images/why-choose-image.png";

const pillars = [
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

export function WhyChoose() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % pillars.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [active]);

  const select = (i: number) => setActive(i);

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="gutter-x grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <span className="text-[13px] uppercase tracking-[0.25em] text-navy/55">
            Why Lumina
          </span>
          <h2 className="mt-3 font-display text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.1] text-navy">
            Why Choose Lumina for Dental Implants
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-[1.55] text-navy/70">
            We provide dependable daily function and a natural look that lasts a
            lifetime.
          </p>

          <ul className="mt-10 space-y-1">
            {pillars.map((p, i) => {
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
              src={HERO_IMAGE}
              alt="Why choose Lumina"
              fill
              sizes="(min-width:1024px) 55vw, 100vw"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
