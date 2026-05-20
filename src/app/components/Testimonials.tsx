"use client";
import { useEffect, useRef, useState } from "react";
import { Star } from "./icons";
import { Cta } from "./Cta";

type Testimonial = {
  headline: string;
  quote: string;
  author: string;
};

const items: Testimonial[] = [
  {
    headline: "They Brought My Smile Back",
    quote:
      '"After a complex dental procedure, I felt completely at ease. The dentists were incredibly patient and attentive. I walked out with renewed confidence and a healthier smile."',
    author: "LA, Rekha M",
  },
  {
    headline: "A Truly Comforting Practice",
    quote:
      '"From the moment I stepped in, every detail was considered. The team explained every step, and the results exceeded what I imagined."',
    author: "NY, Daniel K",
  },
  {
    headline: "Implants That Feel Natural",
    quote:
      '"I was nervous about getting implants, but the process was painless and the result is stunning. I keep forgetting they aren\'t my real teeth."',
    author: "TX, Marcus J",
  },
  {
    headline: "A Dentist I Finally Trust",
    quote:
      '"After years of dental anxiety, this team changed how I think about going to the dentist. Calm, kind, and incredibly skilled at what they do."',
    author: "FL, Priya S",
  },
  {
    headline: "Worth Every Single Visit",
    quote:
      '"The attention to detail is unmatched. From digital scans to the final fitting, every step felt premium and personal. I recommend them to everyone."',
    author: "CA, Helena R",
  },
  {
    headline: "Confidence In Every Smile",
    quote:
      '"My whitening treatment was quick, comfortable, and the results were beyond what I expected. I smile in photos again — that says everything."',
    author: "WA, Jonas P",
  },
];

const AUTOPLAY_MS = 3000;

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const activePageRef = useRef(0);
  const programmaticRef = useRef(false);
  const programmaticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hoverPaused || offscreen || focused;

  const getLayout = () => {
    const track = trackRef.current;
    if (!track) return null;
    const first = track.children[0] as HTMLElement | undefined;
    const second = track.children[1] as HTMLElement | undefined;
    if (!first) return null;
    const step =
      second ? second.offsetLeft - first.offsetLeft : first.getBoundingClientRect().width;
    if (!step) return null;
    const cardsPerPage = Math.max(1, Math.floor(track.clientWidth / step));
    const pages = Math.max(1, Math.ceil(items.length / cardsPerPage));
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    return { step, cardsPerPage, pages, maxScroll };
  };

  const pageScrollLeft = (page: number, layout: NonNullable<ReturnType<typeof getLayout>>) => {
    const { step, cardsPerPage, pages, maxScroll } = layout;
    if (page >= pages - 1) return maxScroll;
    return Math.min(page * cardsPerPage * step, maxScroll);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const recompute = () => {
      const layout = getLayout();
      if (!layout) return;
      setPageCount(layout.pages);
      if (activePageRef.current > layout.pages - 1) {
        activePageRef.current = layout.pages - 1;
        setActivePage(layout.pages - 1);
      }
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      if (programmaticRef.current) return;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const layout = getLayout();
        if (!layout) return;
        const { step, cardsPerPage, pages, maxScroll } = layout;
        const pageWidth = cardsPerPage * step;
        let page: number;
        if (track.scrollLeft >= maxScroll - 1) {
          page = pages - 1;
        } else {
          page = Math.round(track.scrollLeft / pageWidth);
        }
        const clamped = Math.max(0, Math.min(pages - 1, page));
        activePageRef.current = clamped;
        setActivePage(clamped);
      });
    };
    const onEnter = () => setHoverPaused(true);
    const onLeave = () => setHoverPaused(false);
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("mouseenter", onEnter);
    track.addEventListener("mouseleave", onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (programmaticTimerRef.current !== null) {
        globalThis.clearTimeout(programmaticTimerRef.current);
      }
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("mouseenter", onEnter);
      track.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const goToPage = (p: number) => {
    const track = trackRef.current;
    if (!track) return;
    const layout = getLayout();
    if (!layout) return;
    const { pages } = layout;
    const clamped = ((p % pages) + pages) % pages;
    programmaticRef.current = true;
    activePageRef.current = clamped;
    setActivePage(clamped);
    track.scrollTo({ left: pageScrollLeft(clamped, layout), behavior: "smooth" });
    if (programmaticTimerRef.current !== null) {
      globalThis.clearTimeout(programmaticTimerRef.current);
    }
    programmaticTimerRef.current = globalThis.setTimeout(() => {
      programmaticRef.current = false;
      programmaticTimerRef.current = null;
    }, 800);
  };

  useEffect(() => {
    if (paused) return;
    if (pageCount <= 1) return;
    const prefersReduced = globalThis.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;
    const id = globalThis.setInterval(() => {
      if (document.hidden) return;
      goToPage(activePageRef.current + 1);
    }, AUTOPLAY_MS);
    return () => globalThis.clearInterval(id);
  }, [paused, pageCount]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="Patient testimonials"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
      className="bg-mute py-24 lg:py-32"
    >
      <div className="gutter-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2 className="font-display text-[clamp(32px,4.5vw,52px)] font-medium text-navy">
              Kind Words From Our Patients
            </h2>
            <p className="mt-4 max-w-md text-[17px] text-navy/70">
              Real stories from real patients who have experienced the Lumina
              Dental difference.
            </p>
          </div>
          <Cta variant="blue">All Testimonials</Cta>
        </div>

        <div
          ref={trackRef}
          aria-label="Testimonial slides"
          className="mt-12 flex gap-6 overflow-x-auto scroll-clean pb-2 snap-x snap-mandatory"
        >
          {items.map((t, i) => (
            <article
              key={`${t.author}-${i}`}
              data-slide
              className="flex w-[min(90vw,520px)] shrink-0 snap-start flex-col justify-between rounded-3xl bg-white p-8 shadow-[0_18px_40px_-30px_rgba(7,87,136,0.35)] ring-1 ring-black/4"
            >
              <div>
                <div className="flex items-center gap-0.5 text-gold">
                  {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                    <Star key={k} className="h-4 w-4" />
                  ))}
                </div>
                <h3 className="mt-5 font-display text-[26px] leading-tight text-navy">
                  {t.headline}
                </h3>
                <blockquote className="mt-4 font-display text-[20px] leading-[1.4] text-navy/85">
                  {t.quote}
                </blockquote>
              </div>
              <div className="mt-8 flex items-center justify-between border-t border-line pt-5">
                <div className="text-[15px] font-medium text-navy">
                  {t.author}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-navy/50">
                  Verified · Google
                </div>
              </div>
            </article>
          ))}
        </div>

        {pageCount > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={`dot-${i}`}
                onClick={() => goToPage(i)}
                aria-label={`Go to page ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  activePage === i ? "w-8 bg-brand" : "w-2 bg-navy/20 hover:bg-navy/40"
                }`}
              />
            ))}
          </div>
        )}

        {pageCount > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3 md:hidden">
            <SliderArrow direction="prev" onClick={() => goToPage(activePage - 1)} />
            <SliderArrow direction="next" onClick={() => goToPage(activePage + 1)} />
          </div>
        )}
      </div>
    </section>
  );
}

function SliderArrow({
  direction,
  onClick,
}: Readonly<{
  direction: "prev" | "next";
  onClick: () => void;
}>) {
  return (
    <button
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous testimonial" : "Next testimonial"}
      className="grid h-11 w-11 place-items-center rounded-full border border-navy/15 bg-white text-navy transition hover:border-brand hover:bg-brand hover:text-white"
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 ${direction === "prev" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m13 5 7 7-7 7" />
      </svg>
    </button>
  );
}
