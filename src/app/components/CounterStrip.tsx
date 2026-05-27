import type { Stat } from "@/types/clinic";

const DEFAULT_STATS: Stat[] = [
  { value: "20+", label: "Years Serving Community" },
  { value: "500+", label: "Projects Completed Successfully" },
  { value: "1500+", label: "Satisfied Clients Worldwide" },
  { value: "120+", label: "Expert Professionals Onboard" },
  { value: "98%", label: "Customer Retention Rate" },
  { value: "85%", label: "Employee Satisfied" },
];

// Keep in sync with the `w-[220px]` on each item below.
const ITEM_WIDTH = 220;
// A single (pre-duplicate) copy must be wider than the widest viewport we
// support, otherwise the -50% loop scrolls past the content and shows a gap.
const MIN_COPY_WIDTH = 2560;
// Scroll speed in px/s — tuned to match the previous 1320px / 32s pace.
const SPEED = 41;

export function CounterStrip({ stats }: Readonly<{ stats?: Stat[] }>) {
  const items = stats && stats.length > 0 ? stats : DEFAULT_STATS;

  // Repeat the set enough times that one copy fills the viewport, then duplicate
  // that copy once so the -50% keyframe loops seamlessly with no gap.
  const repeats = Math.max(1, Math.ceil(MIN_COPY_WIDTH / (items.length * ITEM_WIDTH)));
  const copy = Array.from({ length: repeats }, () => items).flat();
  const loop = [...copy, ...copy];

  const copyWidth = copy.length * ITEM_WIDTH;
  const duration = copyWidth / SPEED;

  return (
    <section className="relative bg-white pb-14 pt-10 text-navy">
      <div className="relative overflow-hidden">
        <div
          className="flex w-max animate-marquee hover:[animation-play-state:paused]"
          style={{ animationDuration: `${duration}s` }}
        >
          {loop.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              className="flex w-[220px] shrink-0 flex-col justify-center px-6"
            >
              <div className="font-display text-[40px] leading-none tracking-[-0.02em] text-brand">
                {s.value}
              </div>
              <div className="mt-2 text-[13px] text-navy/60">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
