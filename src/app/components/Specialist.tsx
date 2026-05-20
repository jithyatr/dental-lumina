import Image from "next/image";
import { Check } from "./icons";
import { Cta } from "./Cta";
import type { DoctorInfo } from "@/types/clinic";

const DEFAULT_CREDENTIALS = [
  "Board Certified Implantologist",
  "Expert in Full-Arch Restoration",
  "Advanced 3D Guided Surgery",
  "Patient-First Philosophy",
];

const DEFAULT_BIO =
  "Dr. Sheila Dobee is a highly specialized implantologist dedicated to restoring long-term oral health. With over 15 years of experience, she combines clinical excellence with a compassionate approach to ensure every patient achieves their dream smile.";

export function Specialist({ doctor }: Readonly<{ doctor?: DoctorInfo }>) {
  const name = doctor?.name ?? "Dr Sheila Dobee";
  const bio = doctor?.bio ?? DEFAULT_BIO;
  const credentials =
    doctor?.specialistCredentials && doctor.specialistCredentials.length > 0
      ? doctor.specialistCredentials
      : DEFAULT_CREDENTIALS;
  const photo =
    doctor?.specialistPortraitPath ??
    doctor?.photoPath ??
    "/images/dr-sheila-dobee.png";
  const label = doctor?.specialistLabel ?? "Our Specialist";

  return (
    <section id="specialist" className="relative bg-white py-24 lg:py-32">
      <div className="gutter-x grid gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <div className="relative aspect-square overflow-hidden rounded-[28px] bg-mute">
            <Image
              src={photo}
              alt={name}
              fill
              sizes="(min-width:1024px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-7 lg:pl-8">
          <span className="text-[13px] text-navy/55">{label}</span>
          <h2 className="mt-2 font-display text-[clamp(32px,4vw,44px)] font-medium text-navy">
            Meet {name}
          </h2>
          <p className="mt-5 max-w-xl text-[15px] leading-[1.6] text-navy/70">
            {bio}
          </p>

          <ul className="mt-8 space-y-3">
            {credentials.map((c) => (
              <li key={c} className="flex items-center gap-3 text-[15px] text-navy">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-sm text-brand">
                  <Check className="h-4 w-4" />
                </span>
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Cta variant="blue">Schedule Consultation</Cta>
            <Cta variant="ghost">View Profile</Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
