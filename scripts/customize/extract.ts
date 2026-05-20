import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { GoogleGenAI, Type } from "@google/genai";
import type { ClinicConfig, Review, TemplateKind } from "../../src/types/clinic";
import type { ImageCandidate } from "./crawl";

const MODEL = "gemini-3-flash-preview";

async function retryOn503<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      const isParseRetry = err instanceof ParseRetryError;
      const transient = isParseRetry || status === 503 || status === 429 || status === 500;
      if (!transient || i === attempts - 1) throw err;
      const delay = 1000 * 2 ** i + Math.floor(Math.random() * 500);
      const reason = isParseRetry ? (err as Error).message : `${status}`;
      console.warn(`[extract] retrying (${reason}) in ${delay}ms (attempt ${i + 2}/${attempts})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

class ParseRetryError extends Error {}

export interface ExtractedProfile {
  clinic: Omit<ClinicConfig["clinic"], "logoPath" | "heroImagePath"> & {
    logoUrl?: string;
    heroReferenceUrl?: string;
  };
  doctor: Omit<ClinicConfig["doctor"], "photoPath"> & { photoUrl?: string };
  reviews?: Review[];
}

export async function extractClinicProfile(
  homeText: string,
  aboutText: string,
  images: ImageCandidate[],
  template: TemplateKind = "implants",
): Promise<ExtractedProfile | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");
  const ai = new GoogleGenAI({ apiKey });

  const imageList = images
    .map((img, i) => `  ${i + 1}. url=${img.url} alt="${img.alt}" context="${img.context}"`)
    .join("\n");

  const prompt = `You are extracting facts from a dental clinic's existing website to populate a landing page.

CRITICAL: Use ONLY information explicitly present in the home/about page text and image candidates below. Do NOT invent phone numbers, addresses, names, or any other data. If a field cannot be filled from the source text, omit it (unless it is in the required list at the bottom of these rules).


Home page text:
"""
${homeText}
"""

About page text:
"""
${aboutText}
"""

Image candidates found on the site (with their alt text and surrounding heading for context):
${imageList || "  (none found)"}

Return a JSON object describing the clinic and its lead dentist. Rules:
- "clinic.name" is the clinic / practice name as it appears.
- "clinic.phone" is the primary phone of THIS clinic, formatted as it appears on the source. Pick the main office line if multiple. **Omit entirely if no phone appears in the source text — do NOT invent or guess.**
- "clinic.city" is the city only.
- "clinic.address" is the full street address — must contain a street number AND street name AND city AND state code (e.g. "123 Main St, Springfield, IL 62701" or "5500 Central Ave NE, Minneapolis, MN 55432"). Look in the home page text first (especially toward the bottom — clinic addresses are usually in the footer area), then the about page. Omit if no real postal address appears in either source. Do NOT use video fallback messages, generic location phrases like "in Minneapolis, MN", page titles, or marketing copy. The address must be a real physical location to which mail or visitors can be sent.
- "clinic.tagline" is a short marketing line. Omit if absent.
- "clinic.heroSubtitle" is 1-2 sentences (max 220 chars) introducing this clinic's ${template === "family-dentistry" ? "family dental practice (preventive, routine, and restorative care for all ages)" : "implant care"}, naturally weaving in 1-2 specific services/qualities from the source page (e.g., same-day crowns, 3D imaging, flexible financing, multilingual staff, family-friendly). Sound like marketing copy, not a list.
- "clinic.differentiators" is exactly 4 short reasons to choose this clinic, derived from what the source page actually emphasizes. Each: "title" (2-4 words, title case, e.g., "Same-Day Crown Technology", "Family-Focused Care", "Flexible Financing", "Multilingual Staff") and "description" (one sentence, 80-160 chars). Pick the most concrete, distinctive qualities mentioned on the site — not generic "experienced doctors" filler. If the page doesn't surface 4 distinct qualities, fall back to: experience/credentials, technology used, financing/insurance, patient-experience qualities.
- "clinic.commonSymptoms" is exactly 10 short symptom or concern labels (1-3 words each, title case, e.g. "Tooth Pain", "Sensitivity", "Lost Filling", "Gum Bleeding", "Cracked Tooth", "Crooked Teeth", "Whitening", "Missing Tooth", "Jaw Pain", "Bad Breath") that patients of THIS clinic might click when describing why they're booking. Mix urgent symptoms (pain, swelling, trauma) with routine concerns (sensitivity, cosmetic) AND with concerns specific to the services the clinic emphasizes (e.g., for an implant practice include "Loose Implant"; for a family practice include "Kids' First Visit"; for cosmetic include "Stained Teeth"). Tailor the mix to the clinic's actual service emphasis.
- "clinic.treatmentJourney" is exactly 6 steps describing what a typical patient experiences at THIS clinic. Each step: "title" (3-5 words, title case) and "description" (1-2 sentences, 100-220 chars). ${template === "family-dentistry"
  ? `The 6 stages for a family-dentistry practice are: (1) welcome & new-patient exam, (2) personalized care plan / treatment options, (3) preventive cleaning & education, (4) treatment & repair (fillings/crowns/etc.), (5) optional cosmetic refinements, (6) ongoing maintenance / recall visits.`
  : `The 6 stages for a dental-implants practice are: (1) initial consultation & assessment, (2) preparation/foundation work, (3) implant placement, (4) healing/osseointegration, (5) abutment & impressions, (6) final restoration.`} Lightly weave in specifics from the clinic's source page where they fit — if the clinic has 3D imaging, mention it in step 1; if same-day technology, mention it where relevant; if sedation options, mention them where relevant. Do NOT invent technology the source page doesn't mention — if the page is sparse, write generic but professional copy for that step.
- "clinic.logoUrl" is the URL of the clinic's logo image. Pick the image whose alt text mentions "logo" or the clinic name, OR an image clearly used as a header brand mark. Omit if no clear logo image exists. Prefer SVG/PNG over JPG.
- "doctor.name" is the lead dentist's name without titles or credentials (e.g. "Steven Angell", not "Dr. Steven Angell, DDS").
- "doctor.credentials" is a short suffix like "DDS, FAGD". Omit if not stated.
- "doctor.bio" is a polished, marketing-grade bio of 3-5 sentences (max 500 chars). Compose it from the facts present in the source pages — DO NOT invent education, schools, year ranges, awards, or memberships that aren't stated. Weave in (when present in the source): (1) years of clinical experience, ideally as the opening hook (e.g., "With over X years of dental experience...") — derive years from any "since 2008" / "joined in 2008" / "X years ago" / "two decades" mentions; (2) education / dental school; (3) credentials (DDS, DMD, etc.); (4) professional memberships (ADA, AGD, state dental association); (5) areas of focus or specialty; (6) one warm sentence about their treatment philosophy or patient-care approach. Sound confident and welcoming — not a list, but flowing prose. If the source is sparse, write a shorter bio (2-3 sentences) using only what's actually there rather than padding with generic claims.
- "doctor.photoUrl" is the URL of an image clearly showing the lead dentist. Strongly prefer images whose alt text contains the doctor's name, "Dr.", or the word "dentist" (e.g. alt="Dr. Anna Weber" → that's the photo). Use the URL exactly as given in the candidates list. Pick the most prominent / professional headshot if multiple. Omit only if no candidate's alt text or URL filename plausibly identifies a dentist portrait.
- "clinic.heroReferenceUrl" is the URL of an image to use as a visual reference for the AI-generated hero photo. Pick a practice / facility / interior / exterior / treatment-room photo that conveys the clinic's atmosphere. STRONGLY EXCLUDE: anything you picked as logoUrl or doctor.photoUrl, social/icon graphics, decorative SVGs, banners with text, before/after grids, and any image whose alt text or URL filename suggests a person's portrait. Prefer images whose alt text or URL filename mentions "office", "facility", "interior", "exterior", "lobby", "treatment", "operatory", or unattributed practice photos. Omit if no suitable candidate exists.
- "reviews" is an array of exactly 3 patient testimonials. **First**: scan the home and about page text above for genuine patient quotes/testimonials (look for quoted text attributed to a patient, often near words like "review", "testimonial", "patient says", or in star/rating contexts). If 3 real ones exist, use those verbatim (light cleanup only). **If fewer than 3 real reviews exist**, generate plausible reviews based on the actual services and qualities described on the page (e.g., if the page emphasizes implants, family-friendliness, gentle care, and modern technology, write reviews that mention those specific things). For each: "name" is a generic but realistic format like "Sarah M." or "James W." (first name + last initial). "text" is 60-220 chars, in a natural patient voice, mentioning specifics from the page. "rating" is 5. Always return exactly 3 reviews.

Use ONLY URLs from the image candidates list above for "clinic.logoUrl" and "doctor.photoUrl". Do not invent URLs.
Required fields: clinic.name, clinic.phone, doctor.name, doctor.bio. Omit other fields if you cannot fill them confidently from the source.`;

  return await retryOn503(async () => {
    const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clinic: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              tagline: { type: Type.STRING },
              city: { type: Type.STRING },
              phone: { type: Type.STRING },
              address: { type: Type.STRING },
              logoUrl: { type: Type.STRING },
              heroReferenceUrl: { type: Type.STRING },
              heroSubtitle: { type: Type.STRING },
              differentiators: {
                type: Type.ARRAY,
                minItems: 4,
                maxItems: 4,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["title", "description"],
                },
              },
              treatmentJourney: {
                type: Type.ARRAY,
                minItems: 6,
                maxItems: 6,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["title", "description"],
                },
              },
              commonSymptoms: {
                type: Type.ARRAY,
                minItems: 10,
                maxItems: 10,
                items: { type: Type.STRING },
              },
            },
            required: ["name"],
          },
          doctor: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              credentials: { type: Type.STRING },
              bio: { type: Type.STRING },
              photoUrl: { type: Type.STRING },
            },
            required: ["name", "bio"],
          },
          reviews: {
            type: Type.ARRAY,
            minItems: 3,
            maxItems: 3,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                text: { type: Type.STRING },
                rating: { type: Type.INTEGER },
              },
              required: ["name", "text"],
            },
          },
        },
        required: ["clinic", "doctor"],
      },
    },
  });

    const text = response.text;
    if (!text) throw new ParseRetryError("empty response");
    try {
      return JSON.parse(text) as ExtractedProfile;
    } catch (err) {
      const dumpPath = path.join(os.tmpdir(), `gemini-response-${Date.now()}.json`);
      await fs.writeFile(dumpPath, text);
      const finishReason = response.candidates?.[0]?.finishReason;
      console.warn(
        `[extract] JSON.parse failed (${(err as Error).message}). ` +
          `Response was ${text.length} chars; finishReason=${finishReason ?? "?"}. ` +
          `Raw output saved to ${dumpPath}`,
      );
      throw new ParseRetryError(`parse failed (finishReason=${finishReason ?? "?"})`);
    }
  });
}
