const VECTOR_IMAGE_RE = /\.svg(?:$|[?#])/i;
const RASTER_IMAGE_RE = /\.(avif|webp|png|jpe?g)(?:$|[?#])/i;
const VARIANT_IMAGE_RE = /-w\d+(?=\.[^./?#]+(?:$|[?#]))/i;

function splitSuffix(src: string): { path: string; suffix: string } {
  const match = src.match(/([?#].*)$/);
  if (!match) return { path: src, suffix: "" };
  return {
    path: src.slice(0, match.index),
    suffix: match[1],
  };
}

export function isVectorImagePath(src: string): boolean {
  return VECTOR_IMAGE_RE.test(src);
}

export function isRasterImagePath(src: string): boolean {
  return RASTER_IMAGE_RE.test(src) && !isVectorImagePath(src);
}

export function isVariantImagePath(src: string): boolean {
  return VARIANT_IMAGE_RE.test(src);
}

export function normalizeVariantBasePath(src: string): string {
  const { path, suffix } = splitSuffix(src);
  return `${path.replace(VARIANT_IMAGE_RE, "")}${suffix}`;
}
