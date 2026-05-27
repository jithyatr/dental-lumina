// Brand-color palettes for clinic landing pages.
//
// Each preset overrides the brand CSS variables defined in
// `src/app/globals.css` (--color-brand, --color-brand-2, --color-brand-3,
// --color-brand-deep, --color-pale-blue, --color-icy). The variable names
// stay "blue"-flavored for historical reasons; only the *values* change.
//
// To add a preset: pick a `brand` midtone, derive `brand-2` and `brand-3`
// as progressively lighter/desaturated steps, `brand-deep` a darker
// shadow, and `pale`/`icy` as very pale tints for backgrounds.

export interface ThemePalette {
  brand: string;
  brand2: string;
  brand3: string;
  brandDeep: string;
  paleBlue: string;
  icy: string;
}

export interface ThemePreset {
  id: string;
  label: string;
  palette: ThemePalette;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "ocean",
    label: "Ocean Blue",
    palette: {
      brand: "#0076b8",
      brand2: "#329acf",
      brand3: "#63bee5",
      brandDeep: "#075788",
      paleBlue: "#cee1f7",
      icy: "#cde4ff",
    },
  },
  {
    id: "forest",
    label: "Forest",
    palette: {
      brand: "#2f7d5f",
      brand2: "#4ea584",
      brand3: "#82c8a9",
      brandDeep: "#205a44",
      paleBlue: "#d0ead9",
      icy: "#dff4e6",
    },
  },
  {
    id: "coral",
    label: "Coral",
    palette: {
      brand: "#d96d4a",
      brand2: "#e88f6f",
      brand3: "#f3b59b",
      brandDeep: "#a14d33",
      paleBlue: "#fadbcd",
      icy: "#fceadd",
    },
  },
  {
    id: "slate",
    label: "Slate",
    palette: {
      brand: "#475569",
      brand2: "#64748b",
      brand3: "#94a3b8",
      brandDeep: "#2f3a4d",
      paleBlue: "#d4dae3",
      icy: "#e6ebf2",
    },
  },
  {
    id: "plum",
    label: "Plum",
    palette: {
      brand: "#7c3aed",
      brand2: "#9a64f0",
      brand3: "#b893f4",
      brandDeep: "#5d22b8",
      paleBlue: "#e3d6fa",
      icy: "#ede4fc",
    },
  },
  {
    id: "sand",
    label: "Sand",
    palette: {
      brand: "#b48a52",
      brand2: "#c8a472",
      brand3: "#dcbf95",
      brandDeep: "#8a663a",
      paleBlue: "#ecdcc4",
      icy: "#f3e8d6",
    },
  },
  {
    id: "sage",
    label: "Sage",
    palette: {
      brand: "#577565",
      brand2: "#779387",
      brand3: "#a4baad",
      brandDeep: "#3f5749",
      paleBlue: "#d3dfd7",
      icy: "#e3ebe5",
    },
  },
  {
    id: "teal",
    label: "Teal",
    palette: {
      brand: "#02b6ad",
      brand2: "#2fd1c9",
      brand3: "#60e1db",
      brandDeep: "#01847d",
      paleBlue: "#c6f0ee",
      icy: "#d8f3f2",
    },
  },
];

export const DEFAULT_THEME_ID = "ocean";
export const CUSTOM_THEME_ID = "custom";

export function getTheme(
  themeId: string | undefined,
  customThemeColor?: string | undefined,
): ThemePreset {
  if (themeId === CUSTOM_THEME_ID && customThemeColor) {
    return {
      id: CUSTOM_THEME_ID,
      label: "Custom",
      palette: derivePalette(customThemeColor),
    };
  }
  if (themeId) {
    const found = THEME_PRESETS.find((t) => t.id === themeId);
    if (found) return found;
  }
  return THEME_PRESETS[0];
}

// Derive a 6-shade palette from a single brand hex. Heuristic tuned against
// the hand-picked presets above; kept byte-identical to the dashboard's
// wac-clinic-dashboard/lib/themes.ts so previews match the rendered site.
export function derivePalette(hex: string): ThemePalette {
  const { h, s, l } = hexToHsl(hex);
  return {
    brand: normalizeHex(hex),
    brand2: hslToHex(h, clamp(s * 0.65, 0, 1), clamp(l + 0.14, 0, 0.92)),
    brand3: hslToHex(h, clamp(s * 0.7, 0, 1), clamp(l + 0.27, 0, 0.92)),
    brandDeep: hslToHex(h, s, clamp(l - 0.1, 0.05, 1)),
    paleBlue: hslToHex(h, clamp(s * 0.6, 0, 1), 0.86),
    icy: hslToHex(h, clamp(s * 0.55, 0, 1), 0.9),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function normalizeHex(hex: string): string {
  const m = hex.trim().replace(/^#/, "");
  if (m.length === 3) {
    return `#${m[0]}${m[0]}${m[1]}${m[1]}${m[2]}${m[2]}`.toLowerCase();
  }
  return `#${m.toLowerCase()}`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const norm = normalizeHex(hex).slice(1);
  const r = Number.parseInt(norm.slice(0, 2), 16) / 255;
  const g = Number.parseInt(norm.slice(2, 4), 16) / 255;
  const b = Number.parseInt(norm.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
