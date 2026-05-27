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
];

export const DEFAULT_THEME_ID = "ocean";

export function getTheme(id: string | undefined): ThemePreset {
  if (id) {
    const found = THEME_PRESETS.find((t) => t.id === id);
    if (found) return found;
  }
  return THEME_PRESETS[0];
}
