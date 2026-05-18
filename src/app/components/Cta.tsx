import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowDownRight } from "./icons";

type Variant = "white" | "blue" | "ghost" | "gradient";

type CtaProps = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  size?: "md" | "lg";
  type?: "button" | "submit";
};

const variantClasses: Record<Variant, string> = {
  white: "bg-white text-navy",
  blue: "bg-brand text-white",
  ghost: "bg-transparent text-navy ring-1 ring-navy/20 hover:ring-navy/40",
  gradient: "bg-brand-gradient text-white",
};

export function Cta({
  children,
  href,
  variant = "white",
  className = "",
  size = "md",
  type,
}: CtaProps) {
  const sizeClasses =
    size === "lg" ? "h-16 pl-8 pr-3 text-[18px]" : "h-12 pl-6 pr-1.5 text-[16px]";

  const arrowSize = size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const arrowBg =
    variant === "white"
      ? "bg-brand text-white"
      : variant === "ghost"
      ? "bg-navy text-white"
      : "bg-white text-brand";

  const inner = (
    <span
      className={`group inline-flex items-center gap-3 rounded-pill font-medium transition will-change-transform hover:-translate-y-0.5 ${sizeClasses} ${variantClasses[variant]} ${className}`}
    >
      <span className="whitespace-nowrap">{children}</span>
      <span
        className={`grid place-items-center rounded-full ${arrowSize} ${arrowBg} transition group-hover:rotate-12`}
      >
        <ArrowDownRight className="h-4 w-4" />
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {inner}
      </Link>
    );
  }

  return (
    <button type={type ?? "button"} className="inline-flex cursor-pointer">
      {inner}
    </button>
  );
}

export function CtaWide({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex w-full items-center justify-center gap-3 rounded-chip bg-brand-gradient px-8 py-4 text-base font-medium text-white shadow-[0_18px_40px_-18px_rgba(0,118,184,.7)] transition hover:-translate-y-0.5 ${className}`}
    >
      <span>{children}</span>
      <ArrowDownRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </button>
  );
}
