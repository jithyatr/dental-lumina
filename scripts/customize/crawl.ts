import * as cheerio from "cheerio";
import { chromium, type Browser, type Page } from "playwright";

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

function looksLikeChallenge(html: string, title: string): boolean {
  // The interstitial is identified by its title; the in-page "challenge-platform"
  // / "cf-chl" script tags also appear on normal Cloudflare-fronted pages, so we
  // must NOT key off those. Body phrases below only show on the block/challenge page.
  if (/just a moment|attention required|access denied|you have been blocked/i.test(title)) return true;
  return /enable javascript and cookies to continue|verify you are human by completing/i.test(html);
}

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

// Page-builder themes (WordPress, Elementor, Divi) frequently render the hero /
// doctor / team photo as a CSS `background-image` on a <div> rather than an
// <img>. cheerio only sees the static HTML and never resolves those (the URL
// often lives in an external stylesheet), so collectImages() misses them
// entirely. Pull them off the live page via computed styles instead. Runs in
// the browser context — keep it self-contained (no outer-scope references).
async function collectBackgroundImages(page: Page): Promise<ImageCandidate[]> {
  return page.evaluate(() => {
    const out: { url: string; alt: string; context: string }[] = [];
    const seen = new Set<string>();
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("*"))) {
      const bg = getComputedStyle(el).backgroundImage;
      if (!bg || bg === "none") continue;
      const rect = el.getBoundingClientRect();
      // Skip tiny decorative tiles, icons, and gradient/texture chrome.
      if (rect.width < 120 || rect.height < 120) continue;
      const matches = bg.match(/url\((['"]?)(.*?)\1\)/g);
      if (!matches) continue;
      for (const raw of matches) {
        const url = raw.replace(/^url\((['"]?)/, "").replace(/(['"]?)\)$/, "");
        if (!/^https?:/i.test(url)) continue; // skip data: URIs
        if (!/\.(jpe?g|png|webp|avif)(\?|$)/i.test(url)) continue; // photos only (no gif/svg)
        if (seen.has(url)) continue;
        seen.add(url);
        const heading = el.closest("section, article, header, div")?.querySelector("h1, h2, h3")?.textContent?.trim() || "";
        const aria = (el.getAttribute("aria-label") || el.getAttribute("title") || "").trim();
        const cls = typeof el.className === "string" ? el.className.trim().slice(0, 60) : "";
        const context = [aria, heading, cls ? `class=${cls}` : ""].filter(Boolean).join(" | ").slice(0, 200);
        out.push({ url, alt: aria.slice(0, 120), context });
      }
    }
    return out.slice(0, 20);
  });
}

// Scroll the full page in steps so intersection-observer / lazy-load widgets
// mount their content, then return to the top. scrollHeight is re-read each
// tick so growth from newly-loaded sections is covered; a tick cap bounds the
// time for pages that keep growing (infinite scroll).
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const step = 600;
      let scrolled = 0;
      let ticks = 0;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        scrolled += step;
        ticks += 1;
        if (scrolled >= document.body.scrollHeight + 1200 || ticks > 60) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
}

interface FetchedPage {
  html: string;
  backgrounds: ImageCandidate[];
}

async function fetchPage(url: string, browser: Browser): Promise<FetchedPage> {
  const context = await browser.newContext({
    userAgent: BROWSER_USER_AGENT,
    locale: "en-US",
    viewport: { width: 1366, height: 900 },
  });
  const page: Page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    // Cloudflare (and similar) serve a JS interstitial first, then redirect to
    // the real page once their challenge script runs. Wait for it to clear.
    await page
      .waitForFunction(
        () =>
          !/just a moment|attention required/i.test(document.title) &&
          (document.body?.innerText?.trim().length ?? 0) > 200,
        { timeout: 20000 },
      )
      .catch(() => {
        /* validated below */
      });

    // Many themes lazy-mount the doctor/team photos only once the section
    // scrolls into view — third-party widgets (Elfsight "Team Showcase",
    // sliders, intersection-observer sections) fetch and render on demand. If
    // we capture straight after load, those <img>s simply don't exist yet.
    // Walk the page top-to-bottom to trigger them, then settle and return to
    // the top before reading content.
    await autoScroll(page);
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});

    const html = await page.content();
    const title = await page.title().catch(() => "");
    if (looksLikeChallenge(html, title)) {
      throw new Error(`Fetch ${url} blocked by anti-bot challenge (could not be solved in time)`);
    }
    const backgrounds = await collectBackgroundImages(page).catch(() => [] as ImageCandidate[]);
    return { html, backgrounds };
  } finally {
    await context.close();
  }
}

export async function crawl(sourceUrl: string): Promise<CrawlResult> {
  const baseUrl = new URL(sourceUrl);
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });
  try {
    const { html: homeHtml, backgrounds: homeBackgrounds } = await fetchPage(sourceUrl, browser);
    const homeText = cleanText(homeHtml);
    // <img> candidates first (they carry alt text), then CSS background-image
    // photos the page builder hides from the static HTML (hero/doctor/team).
    const homeImages = [...collectImages(homeHtml, baseUrl), ...homeBackgrounds];
    const firstPhone = findFirstPhone(homeHtml);

    const aboutUrl = findAboutUrl(homeHtml, baseUrl);
    let aboutText = "";
    let aboutImages: ImageCandidate[] = [];
    if (aboutUrl) {
      try {
        const { html: aboutHtml, backgrounds: aboutBackgrounds } = await fetchPage(aboutUrl, browser);
        aboutText = cleanText(aboutHtml);
        aboutImages = [...collectImages(aboutHtml, new URL(aboutUrl)), ...aboutBackgrounds];
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
  } finally {
    await browser.close();
  }
}
