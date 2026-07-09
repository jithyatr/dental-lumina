import type { CSSProperties } from "react";

// Ambient background glows used to be solid circles under `filter: blur(160-200px)`.
// Safari allocates an offscreen IOSurface per blurred element, sized to the element
// plus the blur spread, at device resolution — on an iPhone that runs to hundreds of
// megabytes and OOM-kills the WebContent process. These gradients paint straight into
// the section's existing layer instead.
//
// The stops are fitted to the original Gaussian, not guessed: a disc blurred by a
// radius near its own radius flattens into a wide, low-peak bump, so peak alpha lands
// at opacity x 0.72 rather than opacity. Fitted by RMS pixel diff against the real
// blur (RMS 2.4 of 255). The profile is backdrop-independent, so it holds for every
// clinic theme.
const PEAK_ALPHA_RATIO = 0.72;

// position % -> how much of the base color survives at that radius
const STOPS: ReadonlyArray<readonly [number, number]> = [
  [0, 100],
  [20, 89.3],
  [40, 63.9],
  [58, 39.5],
  [74, 20.4],
  [88, 8.1],
  [100, 0],
];

/**
 * Build the style for one ambient glow.
 *
 * @param color   any CSS color — pass `var(--color-brand-2)` to stay theme-aware
 * @param opacity the `opacity-*` value the original blurred blob carried (0-1)
 */
export function ambientGlow(color: string, opacity: number): CSSProperties {
  const stops = STOPS.map(
    ([at, pct]) => `color-mix(in srgb, ${color} ${pct}%, transparent) ${at}%`,
  ).join(", ");

  return {
    opacity: opacity * PEAK_ALPHA_RATIO,
    background: `radial-gradient(closest-side, ${stops})`,
  };
}

/**
 * Grow a blob's box by the blur's bleed (3 sigma, sigma = radius / 2) so the gradient
 * center stays where the blurred circle's center was.
 */
export function glowBleed(blurRadiusPx: number): number {
  return 1.5 * blurRadiusPx;
}
