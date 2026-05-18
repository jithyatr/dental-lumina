const stats = [
  { value: "20+", label: "Years Serving Community" },
  { value: "500+", label: "Projects Completed Successfully" },
  { value: "1500+", label: "Satisfied Clients Worldwide" },
  { value: "120+", label: "Expert Professionals Onboard" },
  { value: "98%", label: "Customer Retention Rate" },
  { value: "85%", label: "Employee Satisfied" },
];

export function CounterStrip() {
  const loop = [...stats, ...stats];
  return (
    <section className="relative bg-brand pb-14 text-white">
      <div className="relative overflow-hidden pt-6">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {loop.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              className="flex w-[220px] shrink-0 flex-col justify-center px-6"
            >
              <div className="font-display text-[40px] leading-none tracking-[-0.02em]">
                {s.value}
              </div>
              <div className="mt-2 text-[13px] text-white/80">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
