import Link from "next/link";
import { ChevronDown, Logo, Phone } from "./icons";
import { Cta } from "./Cta";

const links = ["About", "Services", "Patients", "Media"];

export function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 gutter-x py-6">
      <div className="flex items-center justify-between gap-6 text-white">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-9 w-9 text-white" />
            <span className="font-display text-[20px] font-medium uppercase tracking-[-0.03em]">
              Dr Sheila Dobee
            </span>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {links.map((label) => (
              <button
                key={label}
                className="flex items-center gap-1.5 text-[18px] text-white/90 hover:text-white"
              >
                {label}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-11 items-center gap-2 rounded-[41px] px-4 text-[15px] text-white/80 ring-1 ring-white/20 backdrop-blur md:inline-flex">
            <Phone className="h-4 w-4" />
            (555) 123-4567
          </div>
          <div className="hidden h-11 items-center gap-2 rounded-[41px] bg-white/95 px-4 text-[14px] font-medium text-navy md:inline-flex">
            <span className="relative grid h-2.5 w-2.5 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-success/60" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-success" />
            </span>
            Open. Closes at 8PM
          </div>
          <Cta variant="blue">Book Appointment</Cta>
        </div>
      </div>
    </header>
  );
}
