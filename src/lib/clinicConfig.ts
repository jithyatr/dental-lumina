import { promises as fs } from "node:fs";
import path from "node:path";
import type { ClinicConfig } from "@/types/clinic";

const REPO_ROOT = path.resolve(process.cwd());
const CLINICS_DATA_DIR = path.join(REPO_ROOT, "data", "clinics");

const LUMINA_DEFAULTS: ClinicConfig = {
  clinic: {
    name: "Lumina Dental",
    city: "",
    phone: "5551234567",
    hours: "Open. Closes At 8PM",
    address: "",
    logoIsLight: false,
  },
  doctor: {
    name: "Dr Sheila Dobee",
    credentials: "DDS",
    bio: "Dr. Sheila Dobee is a highly specialized implantologist with over a decade of experience in dental implants, full-arch restoration, and advanced 3D guided surgery. Her patient-first philosophy and meticulous care have helped hundreds of patients restore confidence in their smile.",
    yearsOfExperience: 12,
    photoPath: "/images/dr-sheila-dobee.png",
    specialistPortraitPath: "/images/dr-sheila-dobee.png",
  },
  template: "dentist-landing",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return (override as T) ?? base;
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(override)) {
    result[key] = deepMerge(
      (base as Record<string, unknown>)[key],
      (override as Record<string, unknown>)[key]
    );
  }
  return result as T;
}

const cache = new Map<string, ClinicConfig>();

export async function getClinicConfig(slug?: string): Promise<ClinicConfig> {
  const key = slug ?? "__defaults__";
  const cached = cache.get(key);
  if (cached) return cached;

  if (!slug) {
    cache.set(key, LUMINA_DEFAULTS);
    return LUMINA_DEFAULTS;
  }

  const configPath = path.join(CLINICS_DATA_DIR, `${slug}.json`);
  try {
    const raw = await fs.readFile(configPath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ClinicConfig>;
    const merged = deepMerge(LUMINA_DEFAULTS, parsed);
    cache.set(key, merged);
    return merged;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`[clinicConfig] No config for slug "${slug}" at ${configPath} — using Lumina defaults`);
      cache.set(key, LUMINA_DEFAULTS);
      return LUMINA_DEFAULTS;
    }
    throw err;
  }
}

export async function listKnownSlugs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(CLINICS_DATA_DIR);
    return entries
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.replace(/\.json$/, ""));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

export function getDefaults(): ClinicConfig {
  return LUMINA_DEFAULTS;
}
