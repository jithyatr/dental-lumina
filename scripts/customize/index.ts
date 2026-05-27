import fs from "node:fs/promises";
import path from "node:path";
import net from "node:net";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { crawl } from "./crawl";
import { extractClinicProfile } from "./extract";
import { generateSceneImage } from "./image";
import { buildAndBundle } from "./build";
import {
  procedureByKey,
  procedureFromDentistType,
  procedureFromSelected,
  PROCEDURE_KEYS,
  type Procedure,
} from "./procedures";
import type { ClinicConfig, TemplateKind } from "../../src/types/clinic";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const CLINICS_DATA_DIR = path.join(REPO_ROOT, "data", "clinics");
const CLINICS_PUBLIC_DIR = path.join(REPO_ROOT, "public", "clinics");
const DEFAULT_DIST_DIR = path.join(REPO_ROOT, "dist", "clinics");

const PREVIEW_BASE_PORT = Number(process.env.PREVIEW_BASE_PORT ?? 8080);

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "127.0.0.1");
  });
}

async function findFreePort(start: number): Promise<number> {
  for (let p = start; p < start + 100; p++) {
    if (await isPortFree(p)) return p;
  }
  throw new Error(`No free port found in range ${start}-${start + 99}`);
}

function startPreviewServer(bundleDir: string, port: number) {
  const proc = spawn("python3", ["-m", "http.server", String(port), "--directory", bundleDir], {
    detached: true,
    stdio: "ignore",
  });
  proc.unref();
}

interface Args {
  url: string;
  slug?: string;
  out: string;
  generateHero: boolean;
  noPreview: boolean;
  build: boolean;
  template?: TemplateKind;
  procedure?: Procedure;
  doctorPhoto?: string;
  themeColor?: string;
}

const TEMPLATES: TemplateKind[] = ["implants", "family-dentistry", "dentist-landing"];

function resolveProcedure(opts: {
  procedureKey?: string;
  dentistType?: string;
  selectedProcedure?: string;
}): Procedure | null {
  if (opts.procedureKey) {
    const proc = procedureByKey(opts.procedureKey);
    if (!proc) {
      throw new Error(
        `Unknown --procedure '${opts.procedureKey}'. Options: ${PROCEDURE_KEYS.join(", ")}`,
      );
    }
    return proc;
  }
  if (opts.selectedProcedure) {
    const proc = procedureFromSelected(opts.selectedProcedure);
    if (!proc) throw new Error(`Unknown --selected-procedure '${opts.selectedProcedure}'`);
    return proc;
  }
  if (opts.dentistType) {
    const proc = procedureFromDentistType(opts.dentistType);
    if (!proc) throw new Error(`Unknown --dentist-type '${opts.dentistType}'`);
    return proc;
  }
  return null;
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  let slug: string | undefined;
  let out = DEFAULT_DIST_DIR;
  let generateHero = process.env.GENERATE_HERO_IMAGE === "1";
  let noPreview = false;
  let build = false;
  let template: TemplateKind | undefined;
  let procedureKey: string | undefined;
  let dentistType: string | undefined;
  let selectedProcedure: string | undefined;
  let doctorPhoto: string | undefined;
  let themeColor: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--slug") slug = argv[++i];
    else if (a === "--out") out = path.resolve(argv[++i]);
    else if (a === "--generate-hero") generateHero = true;
    else if (a === "--no-preview") noPreview = true;
    else if (a === "--build") build = true;
    else if (a === "--procedure") procedureKey = argv[++i];
    else if (a === "--dentist-type") dentistType = argv[++i];
    else if (a === "--selected-procedure") selectedProcedure = argv[++i];
    else if (a === "--doctor-photo") doctorPhoto = path.resolve(argv[++i]);
    else if (a === "--theme-color") themeColor = argv[++i];
    else if (a === "--template") {
      const v = argv[++i] as TemplateKind;
      if (!TEMPLATES.includes(v)) {
        throw new Error(
          `Unknown --template '${v}'. Options: ${TEMPLATES.join(", ")}`
        );
      }
      template = v;
    } else if (a.startsWith("--")) throw new Error(`Unknown flag: ${a}`);
    else positional.push(a);
  }
  if (positional.length !== 1) {
    throw new Error(
      "Usage: npm run customize -- <source-url> [--slug <slug>] [--out <dir>] [--generate-hero] [--build] [--no-preview] [--template implants|family-dentistry|dentist-landing] [--procedure <key>] [--dentist-type <type>] [--selected-procedure <name>] [--doctor-photo <path>] [--theme-color <hex>]"
    );
  }
  if (themeColor && !/^#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(themeColor)) {
    throw new Error(`--theme-color must be a hex like "#1B8D8D" or "1b8d8d"; got '${themeColor}'`);
  }
  const procedure = resolveProcedure({ procedureKey, dentistType, selectedProcedure });
  if (procedure && !template) template = procedure.template;
  return {
    url: positional[0],
    slug,
    out,
    generateHero,
    noPreview,
    build,
    template: template ?? "dentist-landing",
    procedure: procedure ?? undefined,
    doctorPhoto,
    themeColor,
  };
}

const YEARS_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30,
};

function extractYearsFromBio(bio: string): number | undefined {
  const numeric = bio.match(/(?:over|nearly|almost|more than)?\s*(\d{1,2})\s*\+?\s*years?\b/i);
  if (numeric) {
    const n = Number(numeric[1]);
    if (n >= 1 && n <= 70) return n;
  }
  const word = bio.match(/(?:over|nearly|almost|more than)?\s*(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty)\s*\+?\s*years?\b/i);
  if (word) {
    const n = YEARS_WORDS[word[1].toLowerCase()];
    if (n) return n;
  }
  if (/(?:two\s*decades?|20\s*years?)/i.test(bio)) return 20;
  if (/(?:almost|nearly)\s*two\s*decades?/i.test(bio)) return 20;
  const sinceMatch = bio.match(
    /(?:since|joined\s+(?:the\s+practice\s+)?in|practicing\s+since|founded\s+in|started\s+in|established\s+in|opened\s+in|graduated\s+in)\s+(19\d{2}|20[0-2]\d)\b/i
  );
  if (sinceMatch) {
    const year = Number(sinceMatch[1]);
    const currentYear = new Date().getFullYear();
    const diff = currentYear - year;
    if (diff >= 1 && diff <= 70) return diff;
  }
  return undefined;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function detectLogoIsWordmark(filePath: string): Promise<boolean> {
  try {
    const meta = await sharp(filePath).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    if (w === 0 || h === 0) return false;
    // Wordmarks (logo+name lockups) are reliably wider than tall.
    // Pure icon marks (monograms, tooth icons) are ≤ ~1.0 ratio.
    return w / h >= 1.1;
  } catch {
    return false;
  }
}

async function isLightOnTransparent(filePath: string): Promise<boolean> {
  try {
    const meta = await sharp(filePath).metadata();
    if (!meta.hasAlpha) return false;
    const { data, info } = await sharp(filePath)
      .flatten({ background: { r: 0, g: 0, b: 0 } })
      .raw()
      .toBuffer({ resolveWithObject: true });
    const channelCount = info.channels;
    let brightCount = 0;
    let opaqueCount = 0;
    const alpha = await sharp(filePath).extractChannel("alpha").raw().toBuffer();
    for (let i = 0; i < alpha.length; i++) {
      if (alpha[i] < 128) continue;
      opaqueCount++;
      const px = i * channelCount;
      const r = data[px];
      const g = channelCount >= 3 ? data[px + 1] : r;
      const b = channelCount >= 3 ? data[px + 2] : r;
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      if (luma > 200) brightCount++;
    }
    if (opaqueCount === 0) return false;
    return brightCount / opaqueCount > 0.6;
  } catch {
    return false;
  }
}

async function downloadImage(
  imageUrl: string,
  slug: string,
  basename: string
): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.warn(`[${basename}] fetch returned ${res.status} for ${imageUrl}`);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const dir = path.join(CLINICS_PUBLIC_DIR, slug);
    await fs.mkdir(dir, { recursive: true });

    // Doctor photos are fed to Gemini as identity references; webp, animated frames,
    // and Adobe APP14-marked JPEGs cause IMAGE_OTHER bailouts on the specialist scene.
    // Re-encode to clean baseline JPEG (header ffd8ffdb) at ingest time.
    if (basename === "doctor") {
      const normalized = await sharp(buf)
        .rotate()
        .flatten({ background: "#ffffff" })
        .jpeg({ progressive: false, quality: 92 })
        .toBuffer();
      const filename = "doctor.jpg";
      await fs.writeFile(path.join(dir, filename), normalized);
      return `/clinics/${slug}/${filename}`;
    }

    const ext = (() => {
      const fromUrl = imageUrl.match(/\.(jpe?g|png|webp|svg)(?:\?|$)/i)?.[1];
      if (fromUrl) return fromUrl.toLowerCase().replace("jpeg", "jpg");
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("svg")) return "svg";
      if (ct.includes("png")) return "png";
      if (ct.includes("webp")) return "webp";
      return "jpg";
    })();
    const filename = `${basename}.${ext}`;
    await fs.writeFile(path.join(dir, filename), buf);
    return `/clinics/${slug}/${filename}`;
  } catch (err) {
    console.warn(`[${basename}] download failed: ${(err as Error).message}`);
    return null;
  }
}

async function ingestLocalDoctorPhoto(localPath: string, slug: string): Promise<string | null> {
  try {
    const buf = await fs.readFile(localPath);
    const dir = path.join(CLINICS_PUBLIC_DIR, slug);
    await fs.mkdir(dir, { recursive: true });
    const normalized = await sharp(buf)
      .rotate()
      .flatten({ background: "#ffffff" })
      .jpeg({ progressive: false, quality: 92 })
      .toBuffer();
    await fs.writeFile(path.join(dir, "doctor.jpg"), normalized);
    return `/clinics/${slug}/doctor.jpg`;
  } catch (err) {
    console.warn(`[doctor] local photo ingest failed (${localPath}): ${(err as Error).message}`);
    return null;
  }
}

export interface RunCustomizeArgs {
  url: string;
  slug?: string;
  template?: TemplateKind;
  procedure?: Procedure | null;
  generateHero?: boolean;
  doctorPhoto?: string;
  themeColor?: string;
}

export interface RunCustomizeResult {
  slug: string;
  configPath: string;
  config: ClinicConfig;
}

function applyProcedureHeadlines(config: ClinicConfig, procedure: Procedure): void {
  const h = procedure.sectionHeadlines;
  const c = config.clinic;
  // Only fill headlines that aren't already explicitly set on the clinic.
  if (h.heroHeadline && !c.heroHeadline) c.heroHeadline = h.heroHeadline;
  if (h.heroCta && !c.heroCta) c.heroCta = h.heroCta;
  if (h.implantOptionsLabel && !c.implantOptionsLabel) c.implantOptionsLabel = h.implantOptionsLabel;
  if (h.implantOptionsHeadline && !c.implantOptionsHeadline) c.implantOptionsHeadline = h.implantOptionsHeadline;
  if (h.implantOptionsSubheading && !c.implantOptionsSubheading) c.implantOptionsSubheading = h.implantOptionsSubheading;
  if (h.whyChooseLabel && !c.whyChooseLabel) c.whyChooseLabel = h.whyChooseLabel;
  if (h.whyChooseHeadline && !c.whyChooseHeadline) c.whyChooseHeadline = h.whyChooseHeadline;
  if (h.whyChooseSubheading && !c.whyChooseSubheading) c.whyChooseSubheading = h.whyChooseSubheading;
  if (h.processHeadline && !c.processHeadline) c.processHeadline = h.processHeadline;
  if (h.processSubheading && !c.processSubheading) c.processSubheading = h.processSubheading;
  if (h.benefitsHeadline && !c.benefitsHeadline) c.benefitsHeadline = h.benefitsHeadline;
  if (h.faqLabel && !c.faqLabel) c.faqLabel = h.faqLabel;
  if (h.faqHeadline && !c.faqHeadline) c.faqHeadline = h.faqHeadline;
  if (h.faqSubheading && !c.faqSubheading) c.faqSubheading = h.faqSubheading;
  if (h.symptomCheckerHeadline && !c.symptomCheckerHeadline) c.symptomCheckerHeadline = h.symptomCheckerHeadline;
  if (h.symptomCheckerSubheading && !c.symptomCheckerSubheading) c.symptomCheckerSubheading = h.symptomCheckerSubheading;
  if (h.testimonialsHeadline && !c.testimonialsHeadline) c.testimonialsHeadline = h.testimonialsHeadline;
  if (h.testimonialsSubheading && !c.testimonialsSubheading) c.testimonialsSubheading = h.testimonialsSubheading;
  if (h.beforeAfterHeadline && !c.beforeAfterHeadline) c.beforeAfterHeadline = h.beforeAfterHeadline;
  if (h.beforeAfterSubheading && !c.beforeAfterSubheading) c.beforeAfterSubheading = h.beforeAfterSubheading;
  if (h.beforeAfterCases && h.beforeAfterCases.length > 0 && (!c.beforeAfterCases || c.beforeAfterCases.length === 0)) {
    c.beforeAfterCases = h.beforeAfterCases.map((bc) => ({ ...bc }));
  }
  if (h.smileSimulatorHeadline && !c.smileSimulatorHeadline) c.smileSimulatorHeadline = h.smileSimulatorHeadline;
  if (h.smileSimulatorSubheading && !c.smileSimulatorSubheading) c.smileSimulatorSubheading = h.smileSimulatorSubheading;
  if (h.bookingHeadline && !c.bookingHeadline) c.bookingHeadline = h.bookingHeadline;
  if (h.bookingSubheading && !c.bookingSubheading) c.bookingSubheading = h.bookingSubheading;

  if (procedure.heroAssurances.length > 0 && (!c.heroAssurances || c.heroAssurances.length === 0)) {
    c.heroAssurances = [...procedure.heroAssurances];
  }
  if (procedure.smileSimulatorGoals.length > 0 && (!c.smileSimulatorGoals || c.smileSimulatorGoals.length === 0)) {
    c.smileSimulatorGoals = [...procedure.smileSimulatorGoals];
  }
  if (procedure.whyChoosePillars.length > 0 && (!c.whyChoosePillars || c.whyChoosePillars.length === 0)) {
    c.whyChoosePillars = procedure.whyChoosePillars.map((p) => ({ title: p.title, description: p.description }));
  }
}

async function generateSceneWithFallback(
  config: ClinicConfig,
  slug: string,
  scene: "hero" | "benefits" | "whychoose",
  doctorLocal: string | undefined,
  specialistLocal: string | undefined,
  procedure: Procedure | null,
): Promise<string | null> {
  let imagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
    scene,
    doctorPhotoLocalPath: doctorLocal,
    procedure,
  });
  if (!imagePath && specialistLocal && specialistLocal !== doctorLocal) {
    console.log(`      ${scene} → retrying with AI specialist headshot as reference`);
    imagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
      scene,
      doctorPhotoLocalPath: specialistLocal,
      procedure,
    });
  }
  if (!imagePath && (doctorLocal || specialistLocal)) {
    console.log(`      ${scene} → retrying text-only`);
    imagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
      scene,
      procedure,
    });
  }
  return imagePath;
}

export async function runCustomize(args: RunCustomizeArgs): Promise<RunCustomizeResult> {
  const slug = args.slug ?? slugify(args.url);
  const procedure = args.procedure ?? null;
  const template = args.template ?? procedure?.template ?? "dentist-landing";
  const generateHero = args.generateHero ?? false;

  const procedureLabel = procedure ? ` | procedure: ${procedure.label}` : "";
  console.log(`[1/4] Crawling ${args.url} (slug: ${slug}${procedureLabel})`);

  const { homeText, aboutText, aboutUrl, firstPhone, images } = await crawl(args.url);
  console.log(
    `      home: ${homeText.length} chars; about: ${aboutText.length} chars (${aboutUrl ?? "no about page found"}); ${images.length} image candidates; first phone: ${firstPhone ?? "none"}`,
  );
  if (homeText.length < 200 && aboutText.length < 200) {
    throw new Error(
      "Extracted text is suspiciously short. The site may be a JS-only SPA — supply manual JSON or use a headless crawler.",
    );
  }

  console.log(`[2/4] Extracting clinic profile via Gemini (template: ${template}${procedureLabel})`);
  const profile = await extractClinicProfile(homeText, aboutText, images, template, procedure);
  if (!profile) throw new Error("Gemini returned no profile.");

  let photoPath: string | undefined;
  if (args.doctorPhoto) {
    const ingested = await ingestLocalDoctorPhoto(args.doctorPhoto, slug);
    if (ingested) {
      photoPath = ingested;
      console.log(`      doctor photo: using local override ${args.doctorPhoto} → ${ingested}`);
    }
  } else if (profile.doctor.photoUrl) {
    const downloaded = await downloadImage(profile.doctor.photoUrl, slug, "doctor");
    if (downloaded) photoPath = downloaded;
  }
  if (!photoPath) {
    console.log("      no doctor photo found on source — Specialist section will render text-only");
  }

  let logoUrl = profile.clinic.logoUrl;
  if (!logoUrl) {
    const fallback = images.find((img) =>
      /logo|brand/i.test(img.url) || /logo|brand/i.test(img.alt),
    );
    if (fallback) {
      logoUrl = fallback.url;
      console.log(`      Gemini didn't return a logoUrl — using candidate ${fallback.url}`);
    }
  }
  let logoPath: string | undefined;
  let logoIsLight = false;
  let logoIsWordmark = false;
  if (logoUrl) {
    const downloaded = await downloadImage(logoUrl, slug, "logo");
    if (downloaded) {
      logoPath = downloaded;
      const localLogoPath = path.join(REPO_ROOT, "public", logoPath.replace(/^\//, ""));
      logoIsLight = await isLightOnTransparent(localLogoPath);
      logoIsWordmark = await detectLogoIsWordmark(localLogoPath);
      if (logoIsLight) console.log(`      logo detected as light-on-transparent`);
      if (logoIsWordmark) console.log(`      logo detected as wordmark (includes clinic name)`);
    }
  }

  const config: ClinicConfig = {
    clinic: {
      name: profile.clinic.name,
      tagline: profile.clinic.tagline,
      city: profile.clinic.city,
      phone: firstPhone ?? profile.clinic.phone,
      address: profile.clinic.address,
      hours: profile.clinic.hours,
      logoPath,
      logoIsLight,
      logoIsWordmark,
      heroSubtitle: profile.clinic.heroSubtitle,
      differentiators: profile.clinic.differentiators?.slice(0, 4),
      treatmentJourney: profile.clinic.treatmentJourney?.slice(0, 6),
      commonSymptoms: profile.clinic.commonSymptoms?.slice(0, 10),
      stats: profile.clinic.stats?.slice(0, 4),
      benefits: profile.clinic.benefits?.slice(0, 6),
      implantOptions: profile.clinic.implantOptions?.slice(0, 6),
      faqItems: profile.clinic.faqItems?.slice(0, 6),
      footerAbout: profile.clinic.footerAbout,
    },
    doctor: {
      name: profile.doctor.name,
      credentials: profile.doctor.credentials,
      bio: profile.doctor.bio,
      yearsOfExperience: extractYearsFromBio(profile.doctor.bio),
      ...(photoPath ? { photoPath } : {}),
    },
    reviews:
      profile.reviews && profile.reviews.length > 0
        ? profile.reviews.slice(0, 6)
        : undefined,
    template,
    ...(procedure ? { procedure: procedure.key } : {}),
  };

  if (procedure) applyProcedureHeadlines(config, procedure);

  if (args.themeColor) {
    config.themeId = "custom";
    config.customThemeColor = args.themeColor.startsWith("#") ? args.themeColor : `#${args.themeColor}`;
    console.log(`      theme: custom ${config.customThemeColor}`);
  }

  if (generateHero) {
    const doctorLocal =
      photoPath && photoPath.startsWith("/clinics/")
        ? path.join(REPO_ROOT, "public", photoPath.replace(/^\//, ""))
        : undefined;
    const refSummary = doctorLocal ? "doctor photo as reference" : "text-only";
    console.log(
      `[3/4] Generating hero + benefits${doctorLocal ? " + specialist" : ""} images (Nano Banana, ${refSummary})`,
    );

    let specialistLocal: string | undefined;
    if (doctorLocal) {
      const specialistPath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "specialist",
        doctorPhotoLocalPath: doctorLocal,
        procedure,
      });
      if (specialistPath) {
        config.doctor.specialistPortraitPath = specialistPath;
        console.log(`      specialist → ${specialistPath}`);
        specialistLocal = path.join(REPO_ROOT, "public", specialistPath.replace(/^\//, ""));
      } else if (photoPath) {
        // Gemini refuses to recreate a specific real person's identifiable
        // face (returns finishReason=IMAGE_OTHER on the tight headshot). Carry
        // the real extracted doctor photo into specialistPortraitPath so the
        // Specialist section renders the actual dentist instead of relying on
        // the component's implicit `?? photoPath` and leaving the field empty.
        // Also reuse it as the doctor reference for hero/benefits/whychoose.
        config.doctor.specialistPortraitPath = photoPath;
        specialistLocal = doctorLocal;
        console.log(`      specialist → falling back to extracted doctor photo (${photoPath})`);
      } else {
        console.log("      specialist → falling back to extracted doctor photo");
      }
    } else {
      console.log("      specialist → skipped (no source doctor photo)");
    }

    const heroImagePath = await generateSceneWithFallback(config, slug, "hero", doctorLocal, specialistLocal, procedure);
    if (heroImagePath) {
      config.clinic.heroImagePath = heroImagePath;
      console.log(`      hero → ${heroImagePath}`);
    } else {
      console.log("      hero → falling back to default stock photo");
    }

    const benefitsImagePath = await generateSceneWithFallback(config, slug, "benefits", doctorLocal, specialistLocal, procedure);
    if (benefitsImagePath) {
      config.clinic.benefitsImagePath = benefitsImagePath;
      console.log(`      benefits → ${benefitsImagePath}`);
    } else {
      console.log("      benefits → falling back to default stock photo");
    }

    // WhyChoose specifically needs the dentist in the frame. The shared
    // text-only fallback in generateSceneWithFallback produces a no-people
    // still-life (gloved hands + implant model), which leaves the section
    // without a doctor. Prefer reusing an already-generated sibling scene
    // (hero, then benefits) which we know contains the dentist, before
    // accepting the text-only fallback.
    let whyChooseImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
      scene: "whychoose",
      doctorPhotoLocalPath: doctorLocal,
      procedure,
    });
    if (!whyChooseImagePath && specialistLocal && specialistLocal !== doctorLocal) {
      console.log("      whychoose → retrying with AI specialist headshot as reference");
      whyChooseImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "whychoose",
        doctorPhotoLocalPath: specialistLocal,
        procedure,
      });
    }
    if (!whyChooseImagePath) {
      const reuse = heroImagePath ?? benefitsImagePath;
      if (reuse) {
        console.log(`      whychoose → reusing ${reuse} (AI gen blocked; doctor present in that scene)`);
        whyChooseImagePath = reuse;
      }
    }
    if (!whyChooseImagePath && (doctorLocal || specialistLocal)) {
      console.log("      whychoose → retrying text-only (last resort, no doctor)");
      whyChooseImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "whychoose",
        procedure,
      });
    }
    if (whyChooseImagePath) {
      config.clinic.whyChooseImagePath = whyChooseImagePath;
      console.log(`      whychoose → ${whyChooseImagePath}`);
    } else {
      console.log("      whychoose → falling back to default stock photo");
    }
  } else {
    console.log(
      "[3/4] Skipping image generation (pass --generate-hero or set GENERATE_HERO_IMAGE=1 to enable)",
    );
  }

  await fs.mkdir(CLINICS_DATA_DIR, { recursive: true });
  const configPath = path.join(CLINICS_DATA_DIR, `${slug}.json`);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  console.log(`[4/4] Wrote ${path.relative(REPO_ROOT, configPath)}`);

  return { slug, configPath, config };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { slug, configPath } = await runCustomize({
    url: args.url,
    slug: args.slug,
    template: args.template,
    procedure: args.procedure,
    generateHero: args.generateHero,
    doctorPhoto: args.doctorPhoto,
    themeColor: args.themeColor,
  });

  if (args.build) {
    console.log("[build] Running next build (covers all doctors in this repo)");
    await buildAndBundle(slug, args.out);
    console.log(`\nDone. JSON: ${path.relative(REPO_ROOT, configPath)}`);
    console.log(`Out:  ${path.relative(REPO_ROOT, path.join(REPO_ROOT, "out"))}`);
  } else {
    console.log("[build] Skipping (pass --build to run next build after writing JSON)");
    console.log(`\nDone. JSON: ${path.relative(REPO_ROOT, configPath)}`);
    console.log(`Doctor will be live at /${slug}/ after the next master build.`);
  }

  if (!args.noPreview && args.build) {
    const port = await findFreePort(PREVIEW_BASE_PORT);
    startPreviewServer(path.join(REPO_ROOT, "out"), port);
    await new Promise((r) => setTimeout(r, 400));
    console.log(`Preview: http://localhost:${port}/${slug}/`);
  }
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
