import Image from "next/image";
import { Sparkle4 } from "./icons";
import type { Benefit } from "@/types/clinic";

const DEFAULT_BENEFITS: Benefit[] = [
  {
    title: "Preserve Jawbone",
    description:
      "Implants stimulate the bone, preventing the bone loss that occurs with missing teeth.",
  },
  {
    title: "No Slips or Clicks",
    description:
      "Unlike dentures, implants are fixed and won't move while eating or speaking.",
  },
  {
    title: "Protect Healthy Teeth",
    description:
      "Implants don't require grinding down adjacent teeth like bridges do.",
  },
  {
    title: "Youthful Appearance",
    description:
      "By preventing bone loss, implants help maintain your natural facial structure.",
  },
];

export function Benefits({
  headline,
  items,
  image,
}: Readonly<{ headline?: string; items?: Benefit[]; image?: string }>) {
  const benefits = items && items.length > 0 ? items : DEFAULT_BENEFITS;
  const title = headline ?? "Benefits Of Dental\nImplants";
  const titleLines = title.split("\n");
  const imageSrc = image ?? "/images/benefits-implant.png";

  return (
    <section className="bg-white py-24 lg:py-32">
      <div className="gutter-x grid gap-14 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-6">
          <h2 className="font-display text-[clamp(32px,4vw,44px)] font-medium leading-[1.15] text-navy">
            {titleLines.map((line, i) => (
              <span key={`${line}-${i}`}>
                {line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h2>

          <ul className="mt-10 space-y-7">
            {benefits.map((b) => (
              <li key={b.title} className="flex gap-3">
                <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center text-brand">
                  <Sparkle4 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-[16px] font-medium text-navy">{b.title}</h3>
                  <p className="mt-1.5 max-w-md text-[14px] leading-[1.55] text-navy/60">
                    {b.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <div className="relative w-full overflow-hidden rounded-2xl aspect-[6/5] bg-mute">
            <Image
              src={imageSrc}
              alt="Benefits of dental implants"
              fill
              sizes="(min-width:1024px) 50vw, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
