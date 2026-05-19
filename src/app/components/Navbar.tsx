"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Close, Logo, Menu, Phone } from "./icons";
import { Cta } from "./Cta";

const links = ["About", "Services", "Patients", "Media"];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
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
            <div className="hidden lg:block">
              <Cta variant="blue" href="#booking">
                Book Appointment
              </Cta>
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/25 backdrop-blur lg:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Off-canvas mobile menu */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* backdrop */}
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className={`absolute inset-0 bg-ink/55 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* drawer */}
        <aside
          className={`absolute right-0 top-0 flex h-full w-[86%] max-w-[360px] flex-col bg-brand-deep text-white shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2.5">
              <Logo className="h-8 w-8 text-white" />
              <span className="font-display text-[16px] font-medium uppercase tracking-[0.04em]">
                Dr Sheila Dobee
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/20"
              aria-label="Close menu"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-2 flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-6">
            {links.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-[16px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
              >
                <span>{label}</span>
                <ChevronDown className="h-4 w-4 -rotate-90 opacity-60" />
              </button>
            ))}

            <div className="mt-4 space-y-3 border-t border-white/10 pt-4 pb-[max(env(safe-area-inset-bottom),16px)]">
              <div className="flex items-center gap-2 px-2 text-[13px] text-white/75">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Open. Closes At 8PM
              </div>
              <a
                href="tel:5551234567"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-[15px] font-medium text-white ring-1 ring-white/15"
              >
                <Phone className="h-4 w-4" />
                (555) 123-4567
              </a>
              <a
                href="#booking"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-pill bg-white px-5 py-3 text-[15px] font-medium text-brand"
              >
                Book Appointment
              </a>
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
