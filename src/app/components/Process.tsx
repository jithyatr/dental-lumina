"use client";
import { useEffect, useState } from "react";

const steps = [
  {
    title: "Initial Consultation & Assessment",
    desc: "Comprehensive oral examination, 3D cone beam CT imaging, and personalized treatment planning to determine the best approach for your smile.",
  },
  {
    title: "Preparation & Foundation",
    desc: "Any necessary preparatory work — bone grafting, extractions, or gum treatment — to ensure a stable, long-lasting foundation for your implants.",
  },
  {
    title: "Implant Placement",
    desc: "Precise surgical placement of titanium implant posts into the jawbone under local anesthesia, using guided surgery for optimal positioning.",
  },
  {
    title: "Healing & Osseointegration",
    desc: "A period of 3–6 months as the implant naturally fuses with your jawbone — the biological process that makes implants permanent.",
  },
  {
    title: "Abutment Placement & Impressions",
    desc: "Once healed, an abutment connector is attached and detailed impressions are taken to craft your custom-fit restoration.",
  },
  {
    title: "Final Restoration",
    desc: "Your custom crown, bridge, or implant-supported denture is securely placed — completing your new, natural-looking smile.",
  },
];

const INTERVAL_MS = 2000;

export function Process() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % steps.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [active]);

  return (
    <section className="bg-mute py-24 lg:py-32">
      <div className="gutter-x">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.1] text-navy">
            The Implant Process,
            <br />
            step by step.
          </h2>
          <p className="mx-auto mt-5 max-w-[640px] text-[15px] text-navy/65">
            Every implant journey is different, but here's what most patients
            experience — from first consultation to a fully restored, confident
            smile.
          </p>
        </div>

        <div className="relative mx-auto mt-16 max-w-2xl">
          {/* base spine */}
          <div className="absolute left-2 top-2 bottom-2 w-px bg-navy/10" />
          {/* progress fill */}
          <div
            className="absolute left-2 top-2 w-px bg-brand transition-[height] duration-700 ease-out"
            style={{
              height: `calc(${(active / Math.max(1, steps.length - 1)) * 100}% - 4px)`,
            }}
          />

          <ol className="space-y-10">
            {steps.map((s, i) => {
              const on = active === i;
              const passed = i < active;
              return (
                <li key={s.title} className="relative pl-10">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Step ${i + 1}`}
                    className="absolute left-0 top-1.5 grid h-4 w-4 place-items-center"
                  >
                    <span
                      className={`block h-3 w-3 rounded-full transition-all duration-300 ${
                        on
                          ? "bg-white ring-4 ring-brand"
                          : passed
                          ? "bg-brand/70"
                          : "bg-navy/20"
                      }`}
                    />
                  </button>
                  <h3
                    className={`text-[18px] font-medium transition-colors duration-300 ${
                      on ? "text-navy" : "text-navy/45"
                    }`}
                  >
                    {i + 1}. {s.title}
                  </h3>
                  <p
                    className={`mt-2 max-w-xl text-[14px] leading-[1.6] transition-colors duration-300 ${
                      on ? "font-medium text-navy" : "text-navy/35"
                    }`}
                  >
                    {s.desc}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
