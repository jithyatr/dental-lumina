import {
  ArrowDownRight,
  ToothCavity,
  ToothGum,
  ToothLoosen,
} from "./icons";
import type { ImplantOption } from "@/types/clinic";
import type { ComponentType, SVGProps } from "react";

type IconKey = "tooth-gum" | "tooth-loosen" | "tooth-cavity";
const ICONS: Record<IconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  "tooth-gum": ToothGum,
  "tooth-loosen": ToothLoosen,
  "tooth-cavity": ToothCavity,
};

const DEFAULT_OPTIONS: ImplantOption[] = [
  {
    iconName: "tooth-gum",
    title: "Single Tooth Replacement",
    description:
      "A single implant and custom crown to replace one missing tooth without affecting adjacent teeth.",
  },
  {
    iconName: "tooth-loosen",
    title: "Multiple Teeth Replacement",
    description:
      "Implant-supported bridges to replace several missing teeth in a row with stability.",
  },
  {
    iconName: "tooth-cavity",
    title: "Full Arch Restoration",
    description:
      "All-on-4 or All-on-6 solutions to replace an entire arch of teeth with just a few implants.",
  },
];

const FALLBACK_ICON_ORDER: IconKey[] = ["tooth-gum", "tooth-loosen", "tooth-cavity"];

function resolveIcon(name: string | undefined, index: number) {
  if (name && name in ICONS) return ICONS[name as IconKey];
  return ICONS[FALLBACK_ICON_ORDER[index % FALLBACK_ICON_ORDER.length]];
}

export function ImplantOptions({
  label,
  headline,
  subheading,
  options,
}: Readonly<{
  label?: string;
  headline?: string;
  subheading?: string;
  options?: ImplantOption[];
}>) {
  const items = options && options.length > 0 ? options : DEFAULT_OPTIONS;
  const sectionLabel = label ?? "Treatment Options";
  const title = headline ?? "Dental Implant Options";
  const sub =
    subheading ??
    "We offer a variety of implant solutions tailored to your specific needs and goals.";

  return (
    <section id="implant-options" className="bg-white py-24 lg:py-32">
      <div className="gutter-x">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-pill bg-brand/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brand">
            {sectionLabel}
          </span>
          <h2 className="mt-5 font-display text-[clamp(32px,4.5vw,52px)] font-medium text-navy">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[17px] text-navy/70">
            {sub}
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((option, i) => {
            const Icon = resolveIcon(option.iconName, i);
            return (
              <article
                key={option.title}
                className="group relative overflow-hidden rounded-3xl bg-mute p-7 transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(7,87,136,0.4)]"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/10 blur-2xl transition group-hover:bg-brand/20" />
                <div className="relative">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                    <Icon className="h-9 w-9" />
                  </div>
                  <h3 className="mt-7 font-display text-[24px] font-medium text-navy">
                    {option.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.5] text-navy/70">
                    {option.description}
                  </p>
                  <button className="mt-7 inline-flex items-center gap-2 text-[14px] font-medium text-brand hover:gap-3 transition-all">
                    Learn More
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-white">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
