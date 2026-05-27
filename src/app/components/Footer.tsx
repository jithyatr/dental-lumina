import Image from "next/image";
import { Facebook, Instagram, LinkedIn, Logo, Youtube } from "./icons";
import type { FooterColumn } from "@/types/clinic";

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: "Services",
    items: [
      "General Dentistry",
      "Cosmetic Dentistry",
      "Dental Implants",
      "Orthodontics",
      "Emergency Care",
    ],
  },
  {
    title: "Practice Info",
    items: [
      "About Us",
      "FAQ",
      "New Patients",
      "Careers",
      "Charities We Support",
      "Payment Options",
      "Patient Forms",
    ],
  },
  {
    title: "About Us",
    items: ["Awards & Accolades", "Our Doctors", "Investors"],
  },
];

const buildDefaultAbout = (name: string) =>
  `${name} blends elegance and care, crafting confident smiles since 2004. Our certified team guarantees excellence and integrity throughout your journey.`;

export function Footer({
  clinicName,
  doctorName,
  logoPath,
  logoIsLight,
  about,
  columns,
  copyright,
}: Readonly<{
  clinicName?: string;
  doctorName?: string;
  logoPath?: string;
  logoIsLight?: boolean;
  about?: string;
  columns?: FooterColumn[];
  copyright?: string;
}>) {
  const headerName = clinicName ?? doctorName ?? "Dr Sheila Dobee";
  const aboutText = about ?? buildDefaultAbout(headerName);
  const cols = columns && columns.length > 0 ? columns : DEFAULT_COLUMNS;
  const copy = copyright ?? "Copyright © 2026. All rights reserved.";

  const renderLogo = () => {
    if (logoPath) {
      const wrap = logoIsLight
        ? ""
        : "rounded-md bg-white/95 ring-1 ring-white/10 p-1";
      return (
        <span className={`relative inline-grid h-8 w-8 place-items-center ${wrap}`}>
          <Image
            src={logoPath}
            alt={`${headerName} logo`}
            fill
            sizes="32px"
            className="object-contain"
          />
        </span>
      );
    }
    return <Logo className="h-8 w-8 text-white" />;
  };

  return (
    <footer className="relative isolate overflow-hidden bg-black text-white">
      <div className="gutter-x pt-20 pb-10 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2">
              {renderLogo()}
              <span className="font-display text-[18px] font-medium uppercase tracking-[-0.03em]">
                {headerName}
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[14px] leading-[1.6] text-white/70">
              {aboutText}
            </p>
            <div className="mt-7">
              <div className="text-[14px] font-medium text-white/90">
                Stay Connected
              </div>
              <div className="mt-3 flex gap-2">
                <SocialIcon label="Facebook">
                  <Facebook className="h-3.5 w-3.5" />
                </SocialIcon>
                <SocialIcon label="Instagram">
                  <Instagram className="h-3.5 w-3.5" />
                </SocialIcon>
                <SocialIcon label="LinkedIn">
                  <LinkedIn className="h-3.5 w-3.5" />
                </SocialIcon>
                <SocialIcon label="Youtube">
                  <Youtube className="h-3.5 w-3.5" />
                </SocialIcon>
              </div>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title} className="lg:col-span-3">
              <div className="text-[15px] font-medium text-white/95">
                {c.title}
              </div>
              <ul className="mt-5 space-y-3 text-[13px] text-white/55">
                {c.items.map((it) => (
                  <li key={it}>
                    <a className="transition hover:text-white" href="#">
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start gap-4 border-t border-white/10 pt-6 text-[12px] text-white/45 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="#" className="hover:text-white">Terms & Conditions</a>
            <span className="hidden h-3 w-px bg-white/15 md:inline-block" />
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <span className="hidden h-3 w-px bg-white/15 md:inline-block" />
            <a href="#" className="hover:text-white">Disclaimer</a>
            <span className="hidden h-3 w-px bg-white/15 md:inline-block" />
            <span>{copy}</span>
          </div>
        </div>
      </div>

    </footer>
  );
}

function SocialIcon({
  children,
  label,
}: Readonly<{ children: React.ReactNode; label: string }>) {
  return (
    <a
      href="#"
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/85 transition hover:bg-white/20 hover:text-white"
    >
      {children}
    </a>
  );
}
