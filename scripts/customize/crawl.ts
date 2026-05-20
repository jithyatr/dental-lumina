import * as cheerio from "cheerio";

export interface ImageCandidate {
  url: string;
  alt: string;
  context: string;
}

export interface CrawlResult {
  homeText: string;
  aboutText: string;
  aboutUrl: string | null;
  firstPhone: string | null;
  images: ImageCandidate[];
}

// Keep header/footer/nav — they often contain the address and phone we need.
const STRIP_SELECTORS = ["script", "style", "noscript", "svg"];

function cleanText(html: string): string {
  const $ = cheerio.load(html);
  STRIP_SELECTORS.forEach((sel) => $(sel).remove());
  const text = $("body").text();
  return text.replace(/\s+/g, " ").trim();
}

const PHONE_RE = /\(?([2-9]\d{2})\)?[\s.\-]?(\d{3})[\s.\-](\d{4})(?!\d)/;

function findFirstPhone(html: string): string | null {
  const $ = cheerio.load(html);
  $("script, style, noscript").remove();
  // Don't strip header/footer/nav — many sites put their phone in those.
  const visible = $("body").text();
  const m = visible.match(PHONE_RE);
  if (!m) return null;
  return `(${m[1]}) ${m[2]}-${m[3]}`;
}

function pickRealSrc(el: Parameters<cheerio.CheerioAPI>[0], $: cheerio.CheerioAPI): string | null {
  const lazySrc = $(el).attr("data-lazy-src");
  const dataSrc = $(el).attr("data-src");
  const rawSrc = $(el).attr("src");
  for (const candidate of [lazySrc, dataSrc, rawSrc]) {
    if (candidate && !candidate.startsWith("data:")) return candidate;
  }
  const srcset = $(el).attr("data-lazy-srcset") || $(el).attr("srcset");
  if (srcset) {
    const first = srcset.split(",")[0]?.trim().split(/\s+/)[0];
    if (first && !first.startsWith("data:")) return first;
  }
  return null;
}

function collectImages(html: string, baseUrl: URL): ImageCandidate[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const candidates: ImageCandidate[] = [];
  $("img").each((_, el) => {
    const src = pickRealSrc(el, $);
    if (!src) return;
    let absolute: string;
    try {
      absolute = new URL(src, baseUrl).toString();
    } catch {
      return;
    }
    if (seen.has(absolute)) return;
    seen.add(absolute);
    const alt = ($(el).attr("alt") || "").trim();
    const heading = $(el).closest("section, article, header, div").find("h1, h2, h3").first().text().trim();
    const figcaption = $(el).closest("figure").find("figcaption").text().trim();
    const context = [heading, figcaption].filter(Boolean).join(" | ").slice(0, 200);
    candidates.push({ url: absolute, alt: alt.slice(0, 120), context });
  });
  return candidates.slice(0, 40);
}

function findUrlByKeywords(
  homeHtml: string,
  baseUrl: URL,
  hrefPatterns: RegExp[],
  textPatterns: RegExp[],
): string | null {
  const $ = cheerio.load(homeHtml);
  const candidates: { score: number; href: string }[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().toLowerCase();
    let score = 0;
    for (const re of hrefPatterns) if (re.test(href)) score += 2;
    for (const re of textPatterns) if (re.test(text)) score += 2;
    if (score > 0) candidates.push({ score, href });
  });
  candidates.sort((a, b) => b.score - a.score);
  for (const c of candidates) {
    try {
      const resolved = new URL(c.href, baseUrl);
      if (resolved.hostname !== baseUrl.hostname) continue;
      if (resolved.pathname === baseUrl.pathname && !resolved.search) continue;
      return resolved.toString();
    } catch {
      // skip malformed hrefs
    }
  }
  return null;
}

function findAboutUrl(homeHtml: string, baseUrl: URL): string | null {
  const $ = cheerio.load(homeHtml);
  const candidates: { score: number; href: string }[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().toLowerCase();
    let score = 0;
    if (/about/i.test(href)) score += 2;
    if (text.includes("about")) score += 2;
    if (/meet|our[- ]team|doctor|dentist/i.test(href + " " + text)) score += 1;
    if (score > 0) candidates.push({ score, href });
  });
  candidates.sort((a, b) => b.score - a.score);
  for (const c of candidates) {
    try {
      const resolved = new URL(c.href, baseUrl);
      if (resolved.hostname !== baseUrl.hostname) continue;
      if (resolved.pathname === baseUrl.pathname && !resolved.search) continue;
      return resolved.toString();
    } catch {
      // skip malformed hrefs
    }
  }
  return null;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; ClinicCustomizer/1.0)",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) throw new Error(`Fetch ${url} returned ${res.status}`);
  return await res.text();
}

export async function crawl(sourceUrl: string): Promise<CrawlResult> {
  const baseUrl = new URL(sourceUrl);
  const homeHtml = await fetchPage(sourceUrl);
  const homeText = cleanText(homeHtml);
  const homeImages = collectImages(homeHtml, baseUrl);
  const firstPhone = findFirstPhone(homeHtml);

  const aboutUrl = findAboutUrl(homeHtml, baseUrl);
  let aboutText = "";
  let aboutImages: ImageCandidate[] = [];
  if (aboutUrl) {
    try {
      const aboutHtml = await fetchPage(aboutUrl);
      aboutText = cleanText(aboutHtml);
      aboutImages = collectImages(aboutHtml, new URL(aboutUrl));
    } catch (err) {
      console.warn(`[crawl] could not fetch about page ${aboutUrl}: ${(err as Error).message}`);
    }
  }

  const seen = new Set<string>();
  const images = [...homeImages, ...aboutImages].filter((img) => {
    if (seen.has(img.url)) return false;
    seen.add(img.url);
    return true;
  });

  return { homeText, aboutText, aboutUrl, firstPhone, images };
}
