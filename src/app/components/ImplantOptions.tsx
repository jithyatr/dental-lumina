import {
  Aligner,
  ArrowDownRight,
  Implant,
  Search,
  Shield,
  Sparkle4,
  Stethoscope,
  SwapArrows,
  Tooth,
  ToothCavity,
  ToothGum,
  ToothLoosen,
} from "./icons";
import type { ImplantOption } from "@/types/clinic";
import type { ComponentType, SVGProps } from "react";

type IconKey =
  | "tooth"
  | "tooth-gum"
  | "tooth-loosen"
  | "tooth-cavity"
  | "implant"
  | "aligner"
  | "sparkle"
  | "shield"
  | "stethoscope"
  | "search"
  | "swap";

const ICONS: Record<IconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  tooth: Tooth,
  "tooth-gum": ToothGum,
  "tooth-loosen": ToothLoosen,
  "tooth-cavity": ToothCavity,
  implant: Implant,
  aligner: Aligner,
  sparkle: Sparkle4,
  shield: Shield,
  stethoscope: Stethoscope,
  search: Search,
  swap: SwapArrows,
};

// Most specific patterns first — matched against title + description.
// Ordering matters: compound terms (e.g. "implant bridge", "implant-retained denture")
// should hit their "bridge"/"denture" mapping before the bare /implant/ catch-all,
// so a row of treatments shows visually distinct icons.
const KEYWORD_ICONS: { test: RegExp; icon: IconKey }[] = [
  { test: /all[\s-]?on[\s-]?[46]|full[\s-]?arch|teeth[\s-]?in[\s-]?a[\s-]?day|jaw[\s-]?in[\s-]?a[\s-]?day|zygomatic/i, icon: "implant" },
  { test: /aligner|invisalign|clear[\s-]?tray|ortho|braces/i, icon: "aligner" },
  { test: /denture|prosthetic|prosthodont/i, icon: "tooth-gum" },
  { test: /bridge|crown/i, icon: "tooth" },
  { test: /\bimplant/i, icon: "implant" },
  { test: /veneer|whitening|cosmetic|smile[\s-]?(design|makeover)/i, icon: "sparkle" },
  { test: /sealant|fluoride|preventive|cleaning|hygien|exam|checkup/i, icon: "sparkle" },
  { test: /wisdom|extract|surgery|surgical/i, icon: "tooth-loosen" },
  { test: /root[\s-]?canal|endodont|apicoect|microscope/i, icon: "tooth-cavity" },
  { test: /filling|cavity|decay/i, icon: "tooth-cavity" },
  { test: /pediatric|kid|child|young/i, icon: "tooth" },
  { test: /emergency|urgent|trauma|pain|same[\s-]?day/i, icon: "shield" },
  { test: /sedation|anesthe|iv\b/i, icon: "stethoscope" },
  { test: /scan|imaging|cbct|3d|consult|evaluation|diagnos/i, icon: "search" },
  { test: /tmj|bite|jaw|grinding|occlus/i, icon: "tooth-loosen" },
  { test: /maxillofacial|restora|rehabilit|reconstruct/i, icon: "tooth-gum" },
];

function pickIconKey(title: string, description: string): IconKey {
  // Title is authoritative — match it first. Only fall back to the
  // description when no pattern matches the title (e.g. an unusual title
  // like "Smile Restoration" where the description carries the specifics).
  for (const { test, icon } of KEYWORD_ICONS) {
    if (test.test(title)) return icon;
  }
  for (const { test, icon } of KEYWORD_ICONS) {
    if (test.test(description)) return icon;
  }
  return "tooth";
}

const DEFAULT_OPTIONS: ImplantOption[] = [
  {
    iconName: "implant",
    title: "Single Tooth Implant",
    description:
      "A single implant and custom crown to replace one missing tooth without affecting adjacent teeth.",
  },
  {
    iconName: "tooth-gum",
    title: "Multiple Teeth Replacement",
    description:
      "Implant-supported bridges to replace several missing teeth in a row with stability.",
  },
  {
    iconName: "implant",
    title: "Full Arch Restoration",
    description:
      "All-on-4 or All-on-6 solutions to replace an entire arch of teeth with just a few implants.",
  },
];

function resolveIcon(option: ImplantOption) {
  if (option.iconName && option.iconName in ICONS) {
    return ICONS[option.iconName as IconKey];
  }
  return ICONS[pickIconKey(option.title, option.description)];
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
          {items.map((option) => {
            const Icon = resolveIcon(option);
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
