"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BeforeAfterCase } from "@/types/clinic";

const DEFAULT_CASES: BeforeAfterCase[] = [
  {
    tag: "Whitening",
    title: "Full Smile Makeover",
    subtitle: "Completed in 4 months",
    beforeImage: "/images/smile-makeover-before.png",
    afterImage: "/images/smile-makeover-after.png",
  },
  {
    tag: "Orthopaedics",
    title: "Dental Implant Placement",
    subtitle: "Procedure duration: 2 hours",
    beforeImage: "/images/implant-placement-before.png",
    afterImage: "/images/implant-placement-after.png",
  },
  {
    tag: "Makeover",
    title: "Teeth Whitening Treatment",
    subtitle: "Results visible after 1 session",
    beforeImage: "/images/whitening-before.png",
    afterImage: "/images/whitening-after.png",
  },
];

type Card = BeforeAfterCase;

function CompareCard({ card }: Readonly<{ card: Card }>) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState(50);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, next)));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      if (e.pointerType === "mouse" || e.cancelable) e.preventDefault();
      updateFromClientX(e.clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [updateFromClientX]);

  return (
    <article className="group w-full">
      <div
        ref={wrapRef}
        onPointerDown={(e) => {
          // mouse: tap-to-jump enabled; touch: require explicit handle grab so page scroll still works
          if (e.pointerType !== "mouse") return;
          draggingRef.current = true;
          updateFromClientX(e.clientX);
        }}
        style={{ touchAction: "pan-y" }}
        className="relative aspect-[5/4] cursor-ew-resize overflow-hidden rounded-2xl bg-mute select-none"
      >
        {/* After (full background) */}
        <Image
          src={card.afterImage}
          alt={`${card.title} after`}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 360px, 320px"
          className="object-cover"
          draggable={false}
        />

        {/* Before (clipped to pos% from the left via clip-path) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        >
          <Image
            src={card.beforeImage}
            alt={`${card.title} before`}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 768px) 360px, 320px"
            className="object-cover"
            draggable={false}
          />
        </div>

        {/* Category badge */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-brand px-2.5 py-1 text-[11px] font-medium text-white">
          {card.tag}
        </span>

        {/* Divider + handle */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-white/85"
          style={{ left: `${pos}%`, transform: "translateX(-0.5px)" }}
        />
        <button
          type="button"
          aria-label="Drag to compare"
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            draggingRef.current = true;
            updateFromClientX(e.clientX);
          }}
          className="absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-white text-navy shadow-[0_8px_20px_-6px_rgba(0,0,0,0.35)] ring-1 ring-black/5 transition hover:scale-105"
          style={{ left: `${pos}%`, touchAction: "none" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>

      <div className="px-1 pt-5">
        <h3 className="font-display text-[20px] text-navy">{card.title}</h3>
        <p className="mt-1 text-[13px] text-navy/60">{card.subtitle}</p>
      </div>
    </article>
  );
}

export function BeforeAfter({
  headline,
  subheading,
  cases,
}: Readonly<{
  headline?: string;
  subheading?: string;
  cases?: BeforeAfterCase[];
}>) {
  const items = cases && cases.length > 0 ? cases : DEFAULT_CASES;
  const title = headline ?? "See the Smiles We've Crafted With Precision";
  const sub =
    subheading ??
    "Real transformations, real people, every smile tells a story of renewed confidence.";

  const tabs = ["All", ...Array.from(new Set(items.map((c) => c.tag)))];
  const [tab, setTab] = useState<string>("All");
  const visible = items.filter((c) => tab === "All" || c.tag === tab);

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="gutter-x">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[clamp(34px,5vw,56px)] font-medium text-navy">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[15px] text-navy/65">
            {sub}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-pill px-5 py-2 text-[14px] transition ${
                  tab === t
                    ? "bg-brand text-white shadow-[0_10px_24px_-12px_rgba(0,118,184,0.6)]"
                    : "border border-navy/15 text-navy/70 hover:border-navy/40 hover:text-navy"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of comparison cards */}
      <div className="gutter-x mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => (
          <CompareCard key={c.title} card={c} />
        ))}
      </div>
    </section>
  );
}
