"use client";
import { useEffect, useState } from "react";
import { Phone } from "./icons";

export function MobileStickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-300 lg:hidden ${
        show
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-b from-transparent to-white/85" />
      <div className="relative border-t border-line bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur-md shadow-[0_-10px_30px_-15px_rgba(7,87,136,0.25)]">
        <div className="flex items-center gap-3">
          <a
            href="tel:5551234567"
            className="flex flex-1 items-center justify-center gap-2 rounded-pill border border-brand/25 bg-white px-4 py-3 text-[15px] font-medium text-brand transition active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
          <a
            href="#booking"
            className="flex flex-1 items-center justify-center gap-2 rounded-pill bg-brand-gradient px-4 py-3 text-[15px] font-medium text-white shadow-[0_14px_30px_-14px_rgba(0,118,184,0.7)] transition active:scale-[0.98]"
          >
            Book Now
          </a>
        </div>
      </div>
    </div>
  );
}
