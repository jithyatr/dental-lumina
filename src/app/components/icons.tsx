import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export const ArrowDownRight = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

export const ArrowUpRight = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export const ChevronDown = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Phone = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
);

export const PlayCircle = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m10 8 6 4-6 4V8Z" fill="currentColor" />
  </svg>
);

export const MapPin = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Stethoscope = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 3v6a4 4 0 0 0 8 0V3" />
    <path d="M10 13v3a5 5 0 0 0 10 0v-2" />
    <circle cx="20" cy="11" r="2" />
  </svg>
);

export const Sparkle = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" />
  </svg>
);

export const Carousel = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="6" y="4" width="12" height="16" rx="2" />
    <path d="M3 7v10M21 7v10" />
  </svg>
);

export const Search = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const Shield = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2 4 5v6.18c0 5.13 3.41 9.92 8 10.82 4.59-.9 8-5.69 8-10.82V5l-8-3Z" />
  </svg>
);

export const SwapArrows = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 7h10M7 7l3-3M7 7l3 3" />
    <path d="M17 17H7M17 17l-3 3M17 17l-3-3" />
  </svg>
);

export const Upload = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 16V4" />
    <path d="m6 10 6-6 6 6" />
    <rect x="3" y="16" width="18" height="5" rx="2" />
  </svg>
);

export const Tooth = (props: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <defs>
      <linearGradient id="toothGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#0076B8" />
        <stop offset="100%" stopColor="#5AAAD7" />
      </linearGradient>
    </defs>
    <path
      fill="url(#toothGrad)"
      d="M22 6c-7 0-12 5-12 12 0 5 2 8 4 12 1.5 3 2 6 2.5 11s2 16 5 16 4-9 5-15c.7-4 1.5-5 5.5-5s4.8 1 5.5 5c1 6 2 15 5 15s4.5-11 5-16 1-8 2.5-11c2-4 4-7 4-12 0-7-5-12-12-12-5 0-7 2-10 2s-5-2-10-2Z"
    />
  </svg>
);

export const ToothGum = (props: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <defs>
      <linearGradient id="gumGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#F7A6A5" />
        <stop offset="100%" stopColor="#E8767A" />
      </linearGradient>
      <linearGradient id="gumTooth" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#D7E8F2" />
      </linearGradient>
    </defs>
    <path
      fill="url(#gumGrad)"
      d="M6 38c0-4 6-8 26-8s26 4 26 8-2 14-6 14-6-4-9-4-3 6-6 6h-10c-3 0-3-6-6-6s-5 4-9 4-6-10-6-14Z"
    />
    <path
      fill="url(#gumTooth)"
      d="M22 8c-5 0-9 4-9 9 0 4 2 6 3 9 1 2 1 4 2 8 .5 3 2 9 4 9s2-5 3-9c.5-3 1-3 4-3s3.5 0 4 3c.5 4 1 9 3 9s3.5-6 4-9c1-4 1-6 2-8 1-3 3-5 3-9 0-5-4-9-9-9-3 0-4 1-7 1s-4-1-7-1Z"
    />
  </svg>
);

export const ToothLoosen = (props: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <defs>
      <linearGradient id="loosenGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#0076B8" />
        <stop offset="100%" stopColor="#5AAAD7" />
      </linearGradient>
    </defs>
    <g transform="rotate(-12 32 32)">
      <path
        fill="url(#loosenGrad)"
        d="M22 6c-7 0-12 5-12 12 0 5 2 8 4 12 1.5 3 2 6 2.5 11s2 16 5 16 4-9 5-15c.7-4 1.5-5 5.5-5s4.8 1 5.5 5c1 6 2 15 5 15s4.5-11 5-16 1-8 2.5-11c2-4 4-7 4-12 0-7-5-12-12-12-5 0-7 2-10 2s-5-2-10-2Z"
      />
    </g>
    <path stroke="#F2C2C0" strokeWidth="2" strokeLinecap="round" d="M14 50h36" />
  </svg>
);

export const Implant = (props: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <defs>
      <linearGradient id="implantCrown" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#D7E8F2" />
      </linearGradient>
      <linearGradient id="implantPost" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#9AB4C4" />
        <stop offset="100%" stopColor="#5B7384" />
      </linearGradient>
      <linearGradient id="implantGum" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#F7A6A5" />
        <stop offset="100%" stopColor="#E8767A" />
      </linearGradient>
    </defs>
    {/* gum line */}
    <path fill="url(#implantGum)" d="M6 36c0-3 4-5 26-5s26 2 26 5v6c0 2-2 3-4 3-8 0-12 0-22 0s-14 0-22 0c-2 0-4-1-4-3v-6Z" />
    {/* crown sitting on the post, above the gum */}
    <path fill="url(#implantCrown)" d="M22 6c-4 0-8 4-8 9 0 4 2 7 3 11 1 3 1 5 2 9h18c1-4 1-6 2-9 1-4 3-7 3-11 0-5-4-9-8-9-3 0-4 1-6 1s-3-1-6-1Z" />
    {/* titanium post below the gum (threaded screw) */}
    <path fill="url(#implantPost)" d="M27 44h10v3l-1 1h1v2l-1 1h1v2l-1 1h1v2l-1 1h1v2l-1 1h-8l-1-1h1v-2l-1-1h1v-2l-1-1h1v-2l-1-1h1v-2l-1-1h1v-3Z" />
  </svg>
);

export const Aligner = (props: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <defs>
      <linearGradient id="alignerGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#CEE1F7" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#7FB0E4" stopOpacity="0.95" />
      </linearGradient>
    </defs>
    {/* upper aligner tray shape, slightly U-curved */}
    <path
      fill="url(#alignerGrad)"
      stroke="#5A93C4"
      strokeWidth="1.4"
      d="M10 22c0-6 6-10 22-10s22 4 22 10c0 4-2 7-4 8l-2 2c-1 2-3 3-5 3-2 0-3-2-5-2s-3 1-6 1-4-1-6-1-3 2-5 2c-2 0-4-1-5-3l-2-2c-2-1-4-4-4-8Z"
    />
    {/* inner cavity hint */}
    <path
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeOpacity="0.85"
      d="M16 22c0-3 5-6 16-6s16 3 16 6"
    />
  </svg>
);

export const ToothCavity = (props: IconProps) => (
  <svg viewBox="0 0 64 64" fill="none" {...props}>
    <defs>
      <linearGradient id="cavityGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#0076B8" />
        <stop offset="100%" stopColor="#5AAAD7" />
      </linearGradient>
    </defs>
    <path
      fill="url(#cavityGrad)"
      d="M22 6c-7 0-12 5-12 12 0 5 2 8 4 12 1.5 3 2 6 2.5 11s2 16 5 16 4-9 5-15c.7-4 1.5-5 5.5-5s4.8 1 5.5 5c1 6 2 15 5 15s4.5-11 5-16 1-8 2.5-11c2-4 4-7 4-12 0-7-5-12-12-12-5 0-7 2-10 2s-5-2-10-2Z"
    />
    <circle cx="24" cy="22" r="4" fill="#0B3B5F" />
    <circle cx="40" cy="30" r="3" fill="#0B3B5F" />
    <circle cx="32" cy="40" r="2" fill="#0B3B5F" />
  </svg>
);

export const Sparkle4 = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2c.6 4.7 3.3 7.4 8 8-4.7.6-7.4 3.3-8 8-.6-4.7-3.3-7.4-8-8 4.7-.6 7.4-3.3 8-8Z" />
  </svg>
);

export const Star = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="m12 2 2.9 6.7L22 10l-5.5 4.7L18 22l-6-3.6L6 22l1.5-7.3L2 10l7.1-1.3L12 2Z" />
  </svg>
);

export const Plus = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Minus = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14" />
  </svg>
);

export const Check = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m5 12 5 5 9-11" />
  </svg>
);

export const Calendar = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

export const Clock = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.2 2" />
  </svg>
);

export const ArrowRight = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

export const Menu = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Close = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Logo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none" aria-hidden>
    <circle cx="18" cy="18" r="17" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M14 9c-3 0-5 2-5 5 0 2 .8 3 1.6 5 .6 1.5.8 3 1 5s.8 7 2.2 7 1.6-4 2-7c.3-2 .6-2 2.2-2s1.9.4 2.2 2c.4 3 .8 7 2.2 7s1.8-5 2-7c.2-2 .4-3.5 1-5 .8-2 1.6-3 1.6-5 0-3-2-5-5-5-2 0-3 1-4 1s-2-1-4-1Z"
      fill="currentColor"
    />
  </svg>
);

export const SocialDot = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <a
    href="#"
    aria-label={label}
    className="grid place-items-center w-10 h-10 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/40 transition"
  >
    {children}
  </a>
);

export const Instagram = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

export const Facebook = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v8h4v-8h3l1-4h-4V9c0-.6.4-1 1-1Z" />
  </svg>
);

export const Twitter = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2H21l-6.5 7.43L22 22h-6.83l-4.78-6.27L4.8 22H2l7-8L2 2h6.83l4.36 5.78L18.244 2Zm-1.2 18h1.55L7.05 4H5.4l11.65 16Z" />
  </svg>
);

export const LinkedIn = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0H13v1.6c.6-1 1.95-1.85 3.7-1.85 3.95 0 4.8 2.6 4.8 6V21h-4v-5.05c0-1.2-.02-2.75-1.68-2.75-1.68 0-1.93 1.31-1.93 2.66V21h-4V9.5Z" />
  </svg>
);

export const Youtube = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 8.5s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C16 5.2 12 5.2 12 5.2s-4 0-7.1.3c-.4.1-1.3.1-2.1.9C2.2 7 2 8.5 2 8.5S1.8 10.3 1.8 12v.6c0 1.7.2 3.5.2 3.5s.2 1.5.8 2.1c.8.8 1.8.8 2.3.9 1.7.1 7 .2 7 .2s4 0 7.1-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1S22 14.3 22 12.6V12c0-1.7-.2-3.5-.2-3.5ZM10 15V9l5 3-5 3Z" />
  </svg>
);
