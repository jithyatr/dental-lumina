import { Phone } from "./icons";

export function MobileStickyCTA() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white px-4 pt-3 pb-3 lg:hidden"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
    >
      <div className="flex items-center gap-3">
        <a
          href="tel:5551234567"
          className="flex flex-1 items-center justify-center gap-2 rounded-pill border border-brand/30 bg-white px-4 py-3 text-[15px] font-medium text-brand active:scale-[0.98]"
        >
          <Phone className="h-4 w-4" />
          Call Now
        </a>
        <a
          href="#booking"
          className="flex flex-1 items-center justify-center rounded-pill bg-brand px-4 py-3 text-[15px] font-medium text-white active:scale-[0.98]"
        >
          Book Now
        </a>
      </div>
    </div>
  );
}
