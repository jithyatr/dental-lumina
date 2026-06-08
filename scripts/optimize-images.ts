import { execFile } from "node:child_process";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import {
  DOCTOR_REFERENCE_BASENAME,
  buildOptimizedPublicPath,
  writeDoctorReferenceJpeg,
  writeOptimizedPublicImage,
} from "./customize/assetOptimization";
import { isVariantImagePath } from "../src/lib/imageVariants";

const execFileAsync = promisify(execFile);
const REPO_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(REPO_ROOT, "public");
const IMAGE_ROOTS = [
  path.join(PUBLIC_DIR, "images"),
  path.join(PUBLIC_DIR, "clinics"),
];
const TEXT_ROOTS = [
  path.join(REPO_ROOT, "src"),
  path.join(REPO_ROOT, "scripts"),
  path.join(REPO_ROOT, "data"),
];
const TEXT_FILE_EXTENSIONS = new Set([".css", ".json", ".md", ".mjs", ".ts", ".tsx"]);
const RASTER_EXTENSIONS = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);

type Conversion = {
  oldAbsolutePath: string;
  oldPublicPath: string;
  newPublicPath: string;
};

async function walk(dir: string): Promise<string[]> {
  let out: string[] = [];
  let entries: Dirent[];

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const entry of entries) {
    const nextPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(await walk(nextPath));
      continue;
    }
    out.push(nextPath);
  }

  return out;
}

function toPublicPath(absPath: string): string {
  return `/${path.relative(PUBLIC_DIR, absPath).split(path.sep).join("/")}`;
}

function isSourceRasterImage(absPath: string): boolean {
  const lower = absPath.toLowerCase();
  const ext = path.extname(lower);
  return (
    RASTER_EXTENSIONS.has(ext) &&
    !isVariantImagePath(lower) &&
    path.basename(lower) !== DOCTOR_REFERENCE_BASENAME
  );
}

function isDoctorPhoto(publicPath: string): boolean {
  return /\/clinics\/[^/]+\/doctor\.(avif|webp|png|jpe?g)$/i.test(publicPath);
}

async function convertImage(absPath: string): Promise<Conversion> {
  const oldPublicPath = toPublicPath(absPath);
  const newPublicPath = buildOptimizedPublicPath(oldPublicPath);
  const buffer = await fs.readFile(absPath);

  if (isDoctorPhoto(oldPublicPath)) {
    await writeDoctorReferenceJpeg(buffer, path.dirname(absPath));
  }

  await writeOptimizedPublicImage(buffer, newPublicPath, PUBLIC_DIR);

  return {
    oldAbsolutePath: absPath,
    oldPublicPath,
    newPublicPath,
  };
}

async function updateReferences(conversions: Conversion[]): Promise<number> {
  const textFiles = (
    await Promise.all(TEXT_ROOTS.map((root) => walk(root)))
  ).flat().filter((filePath) => TEXT_FILE_EXTENSIONS.has(path.extname(filePath)));

  const replacements = conversions
    .filter((item) => item.oldPublicPath !== item.newPublicPath)
    .sort((a, b) => b.oldPublicPath.length - a.oldPublicPath.length);

  let touchedFiles = 0;

  for (const filePath of textFiles) {
    const original = await fs.readFile(filePath, "utf8");
    let next = original;
    for (const { oldPublicPath, newPublicPath } of replacements) {
      next = next.replaceAll(oldPublicPath, newPublicPath);
    }
    if (next === original) continue;
    await fs.writeFile(filePath, next);
    touchedFiles++;
  }

  return touchedFiles;
}

// Files that git is tracking, as absolute paths. Used to guarantee --prune only
// ever removes recoverable originals — deleting an untracked, freshly-generated
// source (e.g. a brand-new clinic's PNGs) is unrecoverable and must never happen.
async function trackedFiles(): Promise<Set<string>> {
  try {
    const { stdout } = await execFileAsync(
      "git",
      ["ls-files", "-z", "--", "public"],
      { cwd: REPO_ROOT, maxBuffer: 64 * 1024 * 1024 },
    );
    const tracked = new Set<string>();
    for (const rel of stdout.split("\0")) {
      if (rel) tracked.add(path.join(REPO_ROOT, rel));
    }
    return tracked;
  } catch {
    return new Set<string>();
  }
}

// Off by default. Originals are only removed when the caller passes --prune, and
// even then only if git is tracking them (so they can be restored). Untracked
// originals are kept and reported instead of silently destroyed.
async function pruneOriginals(conversions: Conversion[]): Promise<{
  removed: number;
  skippedUntracked: string[];
}> {
  const tracked = await trackedFiles();
  let removed = 0;
  const skippedUntracked: string[] = [];

  for (const { oldAbsolutePath, oldPublicPath, newPublicPath } of conversions) {
    if (oldPublicPath === newPublicPath) continue;
    if (!tracked.has(oldAbsolutePath)) {
      skippedUntracked.push(oldPublicPath);
      continue;
    }
    await fs.unlink(oldAbsolutePath);
    removed++;
  }

  return { removed, skippedUntracked };
}

async function totalBytes(root: string): Promise<number> {
  const files = await walk(root);
  let total = 0;
  for (const filePath of files) {
    const stat = await fs.stat(filePath);
    if (stat.isFile()) total += stat.size;
  }
  return total;
}

function formatMb(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function main() {
  const prune = process.argv.includes("--prune");
  const beforeBytes = await totalBytes(PUBLIC_DIR);
  const sourceFiles = (
    await Promise.all(IMAGE_ROOTS.map((root) => walk(root)))
  ).flat().filter(isSourceRasterImage);

  console.log(`Optimizing ${sourceFiles.length} raster images...`);

  const conversions: Conversion[] = [];
  for (const filePath of sourceFiles) {
    conversions.push(await convertImage(filePath));
  }

  const touchedFiles = await updateReferences(conversions);
  console.log(`Updated references in ${touchedFiles} text files.`);

  if (prune) {
    const { removed, skippedUntracked } = await pruneOriginals(conversions);
    console.log(`Removed ${removed} superseded (git-tracked) source files.`);
    if (skippedUntracked.length > 0) {
      console.log(
        `Kept ${skippedUntracked.length} untracked originals (not in git, would be unrecoverable):`,
      );
      for (const p of skippedUntracked) console.log(`  - ${p}`);
    }
  } else {
    const superseded = conversions.filter(
      (c) => c.oldPublicPath !== c.newPublicPath,
    ).length;
    console.log(
      `Kept all ${superseded} original sources (pass --prune to remove git-tracked ones).`,
    );
  }

  const afterBytes = await totalBytes(PUBLIC_DIR);
  console.log(`public/: ${formatMb(beforeBytes)} -> ${formatMb(afterBytes)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
