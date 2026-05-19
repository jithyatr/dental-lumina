"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Logo, Phone } from "./icons";
import { Cta } from "./Cta";

const links = ["About", "Services", "Patients", "Media"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-brand-deep/85 backdrop-blur-md shadow-[0_10px_30px_-20px_rgba(0,0,0,0.5)]"
          : "bg-transparent"
      }`}
    >
      <div className="gutter-x flex items-center justify-between gap-6 py-5 text-white lg:py-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="h-9 w-9 text-white" />
            <span className="font-display text-[18px] font-medium uppercase tracking-[0.04em]">
              Dr Sheila Dobee
            </span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((label) => (
              <button
                key={label}
                type="button"
                className="flex items-center gap-1.5 text-[15px] font-normal text-white/95 transition hover:text-white"
              >
                {label}
                <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="tel:5551234567"
            className="hidden items-center gap-2 text-[14px] text-white/90 transition hover:text-white md:inline-flex"
          >
            <Phone className="h-4 w-4" />
            (555) 123-4567
          </a>
          <div className="hidden items-center gap-2 text-[14px] text-white/90 xl:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Open. Closes At 8PM
          </div>
          <Cta variant="blue" href="#booking">
            Book Appointment
          </Cta>
        </div>
      </div>
    </header>
  );
}
