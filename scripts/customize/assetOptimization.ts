import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  isRasterImagePath,
  normalizeVariantBasePath,
} from "../../src/lib/imageVariants";

export const DOCTOR_REFERENCE_BASENAME = "doctor-ref.jpg";

type WebPOptions = {
  lossless?: boolean;
  quality?: number;
  maxDimension?: number;
};

function pickLossless(publicPath: string): boolean {
  return /(^|\/)logo\./i.test(publicPath);
}

export function buildOptimizedPublicPath(publicPath: string): string {
  if (!isRasterImagePath(publicPath)) return publicPath;
  return normalizeVariantBasePath(publicPath).replace(
    /\.(avif|webp|png|jpe?g)(?=$|[?#])/i,
    ".webp",
  );
}

export function pickMaxDimension(publicPath: string): number {
  if (/(^|\/)logo\./i.test(publicPath)) return 960;
  if (/(^|\/)(doctor|specialist)\./i.test(publicPath)) return 1200;
  if (/(case-|review-|testimonial|avatar)/i.test(publicPath)) return 1200;
  return 1600;
}

async function toOptimizedWebP(
  input: Buffer,
  {
    lossless = false,
    quality = 76,
    maxDimension = 1600,
  }: WebPOptions,
): Promise<Buffer> {
  const pipeline = sharp(input).rotate().resize({
    width: maxDimension,
    height: maxDimension,
    fit: "inside",
    withoutEnlargement: true,
  });

  return pipeline.webp(
    lossless
      ? {
          lossless: true,
          effort: 6,
        }
      : {
          quality,
          alphaQuality: 82,
          smartSubsample: true,
          effort: 6,
        },
  ).toBuffer();
}

export async function writeOptimizedPublicImage(
  input: Buffer,
  outputPublicPath: string,
  publicDir: string,
  options: Partial<WebPOptions> = {},
): Promise<string> {
  const finalPublicPath = buildOptimizedPublicPath(outputPublicPath);
  const finalAbsPath = path.join(publicDir, finalPublicPath.replace(/^\//, ""));
  const lossless = options.lossless ?? pickLossless(finalPublicPath);

  await fs.mkdir(path.dirname(finalAbsPath), { recursive: true });

  const masterBuffer = await toOptimizedWebP(input, {
    lossless,
    quality: options.quality,
    maxDimension: options.maxDimension ?? pickMaxDimension(finalPublicPath),
  });

  await fs.writeFile(finalAbsPath, masterBuffer);

  return finalPublicPath;
}

export async function writeDoctorReferenceJpeg(
  input: Buffer,
  outputDir: string,
): Promise<string> {
  const outputPath = path.join(outputDir, DOCTOR_REFERENCE_BASENAME);
  const jpeg = await sharp(input)
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize({
      width: 1200,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ progressive: false, quality: 92 })
    .toBuffer();
  await fs.writeFile(outputPath, jpeg);
  return outputPath;
}
