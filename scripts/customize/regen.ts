import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI, Type } from "@google/genai";
import type {
  Benefit,
  ClinicConfig,
  Differentiator,
  FaqItem,
  ImplantOption,
  TreatmentStep,
  WhyChoosePillar,
} from "../../src/types/clinic";
import { generateSceneImage, type SceneKind } from "./image";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const CLINICS_DATA_DIR = path.join(REPO_ROOT, "data", "clinics");
const CLINICS_PUBLIC_DIR = path.join(REPO_ROOT, "public", "clinics");

const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? "gemini-3-flash-preview";

const IMAGE_TARGETS = ["hero", "specialist", "benefits", "whychoose"] as const;
type ImageTarget = (typeof IMAGE_TARGETS)[number];

const TEXT_TARGETS = [
  "doctor-bio",
  "faq-items",
  "implant-options",
  "differentiators",
  "treatment-journey",
  "benefits-items",
  "why-choose-pillars",
] as const;
type TextTarget = (typeof TEXT_TARGETS)[number];

const ALL_TARGETS: readonly string[] = [...IMAGE_TARGETS, ...TEXT_TARGETS];

interface Args {
  slug: string;
  target: string;
}

function parseArgs(argv: string[]): Args {
  let slug: string | undefined;
  let target: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--slug") slug = argv[++i];
    else if (a === "--target") target = argv[++i];
    else if (a.startsWith("--")) throw new Error(`Unknown flag: ${a}`);
  }
  if (!slug || !target) {
    throw new Error(
      `Usage: npm run regen -- --slug <slug> --target <target>\n  targets: ${ALL_TARGETS.join(", ")}`,
    );
  }
  if (!ALL_TARGETS.includes(target)) {
    throw new Error(
      `Unknown target "${target}". Available: ${ALL_TARGETS.join(", ")}`,
    );
  }
  return { slug, target };
}

const IMAGE_FIELD: Record<ImageTarget, "heroImagePath" | "benefitsImagePath" | "whyChooseImagePath"> = {
  hero: "heroImagePath",
  benefits: "benefitsImagePath",
  whychoose: "whyChooseImagePath",
} as Record<ImageTarget, "heroImagePath" | "benefitsImagePath" | "whyChooseImagePath">;

function isImageTarget(t: string): t is ImageTarget {
  return (IMAGE_TARGETS as readonly string[]).includes(t);
}

function isTextTarget(t: string): t is TextTarget {
  return (TEXT_TARGETS as readonly string[]).includes(t);
}

async function readConfig(slug: string): Promise<{ config: ClinicConfig; configPath: string }> {
  const configPath = path.join(CLINICS_DATA_DIR, `${slug}.json`);
  const raw = await fs.readFile(configPath, "utf-8");
  return { config: JSON.parse(raw) as ClinicConfig, configPath };
}

async function writeConfig(configPath: string, config: ClinicConfig): Promise<void> {
  const tmp = `${configPath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmp, JSON.stringify(config, null, 2));
  await fs.rename(tmp, configPath);
}

function resolveDoctorPhotoLocal(config: ClinicConfig): string | undefined {
  const p = config.doctor.photoPath;
  if (!p) return undefined;
  return path.join(REPO_ROOT, "public", p.replace(/^\//, ""));
}

// ---- Image regen ----

async function findExistingScene(slug: string, scene: SceneKind): Promise<string | null> {
  const dir = path.join(CLINICS_PUBLIC_DIR, slug);
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const candidate = path.join(dir, `${scene}.${ext}`);
    try {
      await fs.access(candidate);
      return `/clinics/${slug}/${scene}.${ext}`;
    } catch {
      // try next ext
    }
  }
  return null;
}

async function regenImage(slug: string, target: ImageTarget): Promise<void> {
  const { config, configPath } = await readConfig(slug);
  const scene: SceneKind = target as SceneKind;
  console.log(`[1/3] Regenerating ${target} image for ${slug}`);
  let newPath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
    scene,
    doctorPhotoLocalPath: resolveDoctorPhotoLocal(config),
  });
  if (!newPath) {
    const existing = await findExistingScene(slug, scene);
    if (existing) {
      console.warn(`      generation failed, but ${existing} exists on disk — keeping it`);
      newPath = existing;
    } else {
      throw new Error(`generateSceneImage returned null for ${target} (and no existing file to fall back to)`);
    }
  }
  console.log(`[2/3] Wrote ${newPath}`);

  if (target === "specialist") {
    config.doctor.specialistPortraitPath = newPath;
  } else {
    const field = IMAGE_FIELD[target];
    if (field) (config.clinic as unknown as Record<string, unknown>)[field] = newPath;
  }
  await writeConfig(configPath, config);
  console.log(`[3/3] Updated ${path.relative(REPO_ROOT, configPath)}`);
}

// ---- Text regen ----

function clinicContext(config: ClinicConfig): string {
  const c = config.clinic;
  const d = config.doctor;
  const lines: string[] = [
    `Clinic name: ${c.name}`,
    c.tagline ? `Tagline: ${c.tagline}` : null,
    c.city ? `City: ${c.city}` : null,
    c.address ? `Address: ${c.address}` : null,
    `Template: ${config.template ?? "dentist-landing"}`,
    d.name ? `Doctor: ${d.name}${d.credentials ? `, ${d.credentials}` : ""}` : null,
    d.yearsOfExperience ? `Years of experience: ${d.yearsOfExperience}` : null,
    d.bio ? `Doctor bio (existing): ${d.bio.slice(0, 500)}` : null,
    c.heroSubtitle ? `Hero subtitle: ${c.heroSubtitle.slice(0, 250)}` : null,
    c.differentiators?.length
      ? `Known clinical emphasis / services: ${c.differentiators
          .map((x) => x.title)
          .join(", ")}`
      : null,
    c.implantOptions?.length
      ? `Known treatment categories: ${c.implantOptions.map((x) => x.title).join(", ")}`
      : null,
  ].filter((s): s is string => Boolean(s));
  return lines.join("\n");
}

function templateNote(template: ClinicConfig["template"]): string {
  if (template === "implants") {
    return "This is an IMPLANTS practice. Skew content toward dental implants, full-arch restoration, candidacy, recovery, financing.";
  }
  if (template === "family-dentistry") {
    return "This is a FAMILY DENTISTRY practice. Skew content toward general/preventive care across age groups, kids, insurance, scheduling.";
  }
  return "This is a general dental practice. Cover a balanced mix of preventive, cosmetic, and restorative care.";
}

async function callGemini<T>(prompt: string, responseSchema: object): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  const ai = new GoogleGenAI({ apiKey });

  const maxAttempts = 4;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema },
      });
      const text = response.text;
      if (!text) throw new Error("empty Gemini response");
      return JSON.parse(text) as T;
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      const transient = status === 503 || status === 429 || status === 500;
      if (!transient || attempt === maxAttempts) throw err;
      const delay = 800 * attempt + Math.floor(Math.random() * 400);
      console.warn(`[gemini] transient ${status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

// Prompt builders + schemas per text target

const TITLE_DESC_ITEMS = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
  },
  required: ["title", "description"],
};

async function regenDoctorBio(config: ClinicConfig): Promise<void> {
  const ctx = clinicContext(config);
  const prompt = `Rewrite the doctor's bio for the clinic below. Write a warm, professional, patient-first bio (3-5 sentences, 80-160 words). Be specific about approach and philosophy; do not invent specific certifications, years, or numbers that aren't supported by the context. ${templateNote(config.template)}

${ctx}

Return ONLY a JSON object: {"bio": "..."}`;
  const schema = {
    type: Type.OBJECT,
    properties: { bio: { type: Type.STRING } },
    required: ["bio"],
  };
  const result = await callGemini<{ bio: string }>(prompt, schema);
  config.doctor.bio = result.bio;
}

async function regenFaqItems(config: ClinicConfig): Promise<void> {
  const ctx = clinicContext(config);
  const prompt = `Generate exactly 6 patient-facing FAQ entries for the clinic below. Each entry: a real question a prospective patient would ask, plus a 1-3 sentence (120-260 char) warm, reassuring answer. Mix question types: insurance/financing, scheduling/new-patient, a service-specific question, comfort/anxiety, what to expect on a first visit, location/hours. ${templateNote(config.template)}

${ctx}

Return ONLY a JSON object: {"items":[{"question":"...","answer":"..."}, ...]}`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        minItems: 6,
        maxItems: 6,
        items: {
          type: Type.OBJECT,
          properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
          required: ["question", "answer"],
        },
      },
    },
    required: ["items"],
  };
  const result = await callGemini<{ items: FaqItem[] }>(prompt, schema);
  config.clinic.faqItems = result.items;
}

async function regenImplantOptions(config: ClinicConfig): Promise<void> {
  const ctx = clinicContext(config);
  const subjectNote =
    config.template === "implants"
      ? "implant treatment options"
      : "core treatment categories";
  const prompt = `Generate exactly 4 ${subjectNote} the clinic could offer. Each: a 2-4 word title (Title Case) and a one-sentence description (100-180 chars) explaining what it solves for the patient. ${templateNote(config.template)}

${ctx}

Return ONLY a JSON object: {"items":[{"title":"...","description":"..."}, ...]}`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        minItems: 4,
        maxItems: 4,
        items: TITLE_DESC_ITEMS,
      },
    },
    required: ["items"],
  };
  const result = await callGemini<{ items: ImplantOption[] }>(prompt, schema);
  config.clinic.implantOptions = result.items;
}

async function regenDifferentiators(config: ClinicConfig): Promise<void> {
  const ctx = clinicContext(config);
  const prompt = `Generate exactly 4 reasons-to-choose this clinic ("differentiators"). Each: a 2-5 word title and one-sentence description (90-180 chars). Focus on technology, experience, patient experience, or specialty mix — whatever fits the context best. ${templateNote(config.template)}

${ctx}

Return ONLY a JSON object: {"items":[{"title":"...","description":"..."}, ...]}`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      items: { type: Type.ARRAY, minItems: 4, maxItems: 4, items: TITLE_DESC_ITEMS },
    },
    required: ["items"],
  };
  const result = await callGemini<{ items: Differentiator[] }>(prompt, schema);
  config.clinic.differentiators = result.items;
}

async function regenTreatmentJourney(config: ClinicConfig): Promise<void> {
  const ctx = clinicContext(config);
  const prompt = `Generate exactly 6 sequential treatment-journey steps a patient at this clinic would experience, from initial visit through ongoing care. Each step: a 3-6 word title (Title Case) and a one-sentence description (90-180 chars). ${templateNote(config.template)}

${ctx}

Return ONLY a JSON object: {"items":[{"title":"...","description":"..."}, ...]}`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      items: { type: Type.ARRAY, minItems: 6, maxItems: 6, items: TITLE_DESC_ITEMS },
    },
    required: ["items"],
  };
  const result = await callGemini<{ items: TreatmentStep[] }>(prompt, schema);
  config.clinic.treatmentJourney = result.items;
}

async function regenBenefitsItems(config: ClinicConfig): Promise<void> {
  const ctx = clinicContext(config);
  const prompt = `Generate exactly 6 patient-facing benefits of choosing this clinic. Each: a 2-5 word title (Title Case) and a one-sentence description (80-150 chars). Focus on tangible patient outcomes (comfort, time saved, clarity, peace of mind), not generic marketing. ${templateNote(config.template)}

${ctx}

Return ONLY a JSON object: {"items":[{"title":"...","description":"..."}, ...]}`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      items: { type: Type.ARRAY, minItems: 6, maxItems: 6, items: TITLE_DESC_ITEMS },
    },
    required: ["items"],
  };
  const result = await callGemini<{ items: Benefit[] }>(prompt, schema);
  config.clinic.benefits = result.items;
}

async function regenWhyChoosePillars(config: ClinicConfig): Promise<void> {
  const ctx = clinicContext(config);
  const prompt = `Generate exactly 4 "why-choose-us" pillars for the clinic. Each: a 2-5 word title (Title Case) and a one-sentence description (90-180 chars). Pillars should each emphasize a distinct strength (technology, team, comfort, results) — avoid overlap. ${templateNote(config.template)}

${ctx}

Return ONLY a JSON object: {"items":[{"title":"...","description":"..."}, ...]}`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        minItems: 4,
        maxItems: 4,
        items: TITLE_DESC_ITEMS,
      },
    },
    required: ["items"],
  };
  const result = await callGemini<{ items: WhyChoosePillar[] }>(prompt, schema);
  // Preserve any existing image paths on the corresponding pillars.
  const existing = config.clinic.whyChoosePillars ?? [];
  config.clinic.whyChoosePillars = result.items.map((item, i) => ({
    ...item,
    image: existing[i]?.image,
  }));
}

async function regenText(slug: string, target: TextTarget): Promise<void> {
  const { config, configPath } = await readConfig(slug);
  console.log(`[1/3] Regenerating text target "${target}" for ${slug}`);
  switch (target) {
    case "doctor-bio":
      await regenDoctorBio(config);
      break;
    case "faq-items":
      await regenFaqItems(config);
      break;
    case "implant-options":
      await regenImplantOptions(config);
      break;
    case "differentiators":
      await regenDifferentiators(config);
      break;
    case "treatment-journey":
      await regenTreatmentJourney(config);
      break;
    case "benefits-items":
      await regenBenefitsItems(config);
      break;
    case "why-choose-pillars":
      await regenWhyChoosePillars(config);
      break;
  }
  console.log(`[2/3] Got fresh content from Gemini`);
  await writeConfig(configPath, config);
  console.log(`[3/3] Updated ${path.relative(REPO_ROOT, configPath)}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (isImageTarget(args.target)) {
    await regenImage(args.slug, args.target);
  } else if (isTextTarget(args.target)) {
    await regenText(args.slug, args.target);
  } else {
    throw new Error(`Target "${args.target}" is recognized but has no handler.`);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
