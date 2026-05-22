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
  template: TemplateKind;
}

const TEMPLATES: TemplateKind[] = ["implants", "family-dentistry", "dentist-landing"];

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  let slug: string | undefined;
  let out = DEFAULT_DIST_DIR;
  let generateHero = process.env.GENERATE_HERO_IMAGE === "1";
  let noPreview = false;
  let build = false;
  let template: TemplateKind = "dentist-landing";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--slug") slug = argv[++i];
    else if (a === "--out") out = path.resolve(argv[++i]);
    else if (a === "--generate-hero") generateHero = true;
    else if (a === "--no-preview") noPreview = true;
    else if (a === "--build") build = true;
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
      "Usage: npm run customize -- <source-url> [--slug <slug>] [--out <dir>] [--generate-hero] [--build] [--no-preview] [--template implants|family-dentistry|dentist-landing]"
    );
  }
  return {
    url: positional[0],
    slug,
    out,
    generateHero,
    noPreview,
    build,
    template,
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
    const ext = (() => {
      const fromUrl = imageUrl.match(/\.(jpe?g|png|webp|svg)(?:\?|$)/i)?.[1];
      if (fromUrl) return fromUrl.toLowerCase().replace("jpeg", "jpg");
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("svg")) return "svg";
      if (ct.includes("png")) return "png";
      if (ct.includes("webp")) return "webp";
      return "jpg";
    })();
    const dir = path.join(CLINICS_PUBLIC_DIR, slug);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${basename}.${ext}`;
    await fs.writeFile(path.join(dir, filename), buf);
    return `/clinics/${slug}/${filename}`;
  } catch (err) {
    console.warn(`[${basename}] download failed: ${(err as Error).message}`);
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const slug = args.slug ?? slugify(args.url);
  console.log(`[1/5] Crawling ${args.url} (slug: ${slug})`);

  const { homeText, aboutText, aboutUrl, firstPhone, images } = await crawl(args.url);
  console.log(
    `      home: ${homeText.length} chars; about: ${aboutText.length} chars (${aboutUrl ?? "no about page found"}); ${images.length} image candidates; first phone: ${firstPhone ?? "none"}`
  );
  if (homeText.length < 200 && aboutText.length < 200) {
    console.error(
      "      Extracted text is suspiciously short. The site may be a JS-only SPA — supply manual JSON or use a headless crawler."
    );
    process.exit(1);
  }

  console.log(`[2/5] Extracting clinic profile via Gemini (template: ${args.template})`);
  const profile = await extractClinicProfile(homeText, aboutText, images, args.template);
  if (!profile) {
    console.error("      Gemini returned no profile. Aborting.");
    process.exit(1);
  }

  let photoPath: string | undefined;
  if (profile.doctor.photoUrl) {
    const downloaded = await downloadImage(profile.doctor.photoUrl, slug, "doctor");
    if (downloaded) photoPath = downloaded;
  }
  if (!photoPath) {
    console.log("      no doctor photo found on source — Specialist section will render text-only");
  }

  let logoUrl = profile.clinic.logoUrl;
  if (!logoUrl) {
    const fallback = images.find((img) =>
      /logo|brand/i.test(img.url) || /logo|brand/i.test(img.alt)
    );
    if (fallback) {
      logoUrl = fallback.url;
      console.log(`      Gemini didn't return a logoUrl — using candidate ${fallback.url}`);
    }
  }
  let logoPath: string | undefined;
  let logoIsLight = false;
  if (logoUrl) {
    const downloaded = await downloadImage(logoUrl, slug, "logo");
    if (downloaded) {
      logoPath = downloaded;
      const localLogoPath = path.join(REPO_ROOT, "public", logoPath.replace(/^\//, ""));
      logoIsLight = await isLightOnTransparent(localLogoPath);
      if (logoIsLight) console.log(`      logo detected as light-on-transparent`);
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
      heroSubtitle: profile.clinic.heroSubtitle,
      differentiators: profile.clinic.differentiators?.slice(0, 4),
      treatmentJourney: profile.clinic.treatmentJourney?.slice(0, 6),
      commonSymptoms: profile.clinic.commonSymptoms?.slice(0, 10),
      stats: profile.clinic.stats?.slice(0, 4),
      benefits: profile.clinic.benefits?.slice(0, 6),
      implantOptions: profile.clinic.implantOptions?.slice(0, 4),
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
        ? profile.reviews.slice(0, 3)
        : undefined,
    template: args.template,
  };

  if (args.generateHero) {
    const doctorLocal =
      photoPath && photoPath.startsWith("/clinics/")
        ? path.join(REPO_ROOT, "public", photoPath.replace(/^\//, ""))
        : undefined;
    const refSummary = doctorLocal ? "doctor photo as reference" : "text-only";
    console.log(
      `[3/5] Generating hero + benefits${doctorLocal ? " + specialist" : ""} images (Nano Banana, ${refSummary})`
    );

    let specialistLocal: string | undefined;
    if (doctorLocal) {
      const specialistPath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "specialist",
        doctorPhotoLocalPath: doctorLocal,
      });
      if (specialistPath) {
        config.doctor.specialistPortraitPath = specialistPath;
        console.log(`      specialist → ${specialistPath}`);
        specialistLocal = path.join(REPO_ROOT, "public", specialistPath.replace(/^\//, ""));
      } else {
        console.log("      specialist → falling back to extracted doctor photo");
      }
    } else {
      console.log("      specialist → skipped (no source doctor photo)");
    }

    let heroImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
      scene: "hero",
      doctorPhotoLocalPath: doctorLocal,
    });
    if (!heroImagePath && specialistLocal && specialistLocal !== doctorLocal) {
      console.log("      hero → retrying with AI specialist headshot as reference");
      heroImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "hero",
        doctorPhotoLocalPath: specialistLocal,
      });
    }
    if (!heroImagePath && (doctorLocal || specialistLocal)) {
      console.log("      hero → retrying text-only");
      heroImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "hero",
      });
    }
    if (heroImagePath) {
      config.clinic.heroImagePath = heroImagePath;
      console.log(`      hero → ${heroImagePath}`);
    } else {
      console.log("      hero → falling back to default stock photo");
    }

    let benefitsImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
      scene: "benefits",
      doctorPhotoLocalPath: doctorLocal,
    });
    if (!benefitsImagePath && specialistLocal && specialistLocal !== doctorLocal) {
      console.log("      benefits → retrying with AI specialist headshot as reference");
      benefitsImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "benefits",
        doctorPhotoLocalPath: specialistLocal,
      });
    }
    if (!benefitsImagePath && (doctorLocal || specialistLocal)) {
      console.log("      benefits → retrying text-only");
      benefitsImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "benefits",
      });
    }
    if (benefitsImagePath) {
      config.clinic.benefitsImagePath = benefitsImagePath;
      console.log(`      benefits → ${benefitsImagePath}`);
    } else {
      console.log("      benefits → falling back to default stock photo");
    }

    let whyChooseImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
      scene: "whychoose",
      doctorPhotoLocalPath: doctorLocal,
    });
    if (!whyChooseImagePath && specialistLocal && specialistLocal !== doctorLocal) {
      console.log("      whychoose → retrying with AI specialist headshot as reference");
      whyChooseImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "whychoose",
        doctorPhotoLocalPath: specialistLocal,
      });
    }
    if (!whyChooseImagePath && (doctorLocal || specialistLocal)) {
      console.log("      whychoose → retrying text-only");
      whyChooseImagePath = await generateSceneImage(config, slug, CLINICS_PUBLIC_DIR, {
        scene: "whychoose",
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
      "[3/5] Skipping image generation (pass --generate-hero or set GENERATE_HERO_IMAGE=1 to enable)"
    );
  }

  await fs.mkdir(CLINICS_DATA_DIR, { recursive: true });
  const configPath = path.join(CLINICS_DATA_DIR, `${slug}.json`);
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  console.log(`[4/5] Wrote ${path.relative(REPO_ROOT, configPath)}`);

  if (args.build) {
    console.log("[5/5] Running next build (covers all doctors in this repo)");
    await buildAndBundle(slug, args.out);
    console.log(`\nDone. JSON: ${path.relative(REPO_ROOT, configPath)}`);
    console.log(`Out:  ${path.relative(REPO_ROOT, path.join(REPO_ROOT, "out"))}`);
  } else {
    console.log("[5/5] Skipping build (pass --build to run next build after writing JSON)");
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
