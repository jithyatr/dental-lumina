import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { GoogleGenAI, Type } from "@google/genai";
import type { ClinicConfig, Review, TemplateKind } from "../../src/types/clinic";
import type { ImageCandidate } from "./crawl";
import type { Procedure } from "./procedures";

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
  procedure: Procedure | null = null,
): Promise<ExtractedProfile | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required");
  const ai = new GoogleGenAI({ apiKey });

  const imageList = images
    .map((img, i) => `  ${i + 1}. url=${img.url} alt="${img.alt}" context="${img.context}"`)
    .join("\n");

  let heroSubtitleFocus: string;
  if (procedure) {
    const blurb = procedure.focusBlurb.replace(/^A /, "").replace(/^An /, "");
    heroSubtitleFocus = `${procedure.label} practice (${blurb})`;
  } else if (template === "family-dentistry") {
    heroSubtitleFocus = "family dental practice (preventive, routine, and restorative care for all ages)";
  } else {
    heroSubtitleFocus = "implant care";
  }

  const procedureBlock = procedure
    ? `

PROCEDURE FOCUS (CRITICAL): This clinic has been categorized as a **${procedure.label}** practice.
${procedure.focusBlurb}
The primary patient audience is: ${procedure.patientLanguage}.

Every field below MUST lean toward ${procedure.label} when the source text gives you any room to do so. Stay accurate to the source — don't claim services the site doesn't mention — but when the source is vague or generic, prefer wording, services, FAQ topics, symptoms, and benefits that align with a ${procedure.label} focus over generic dental copy.

When generating the procedure-specific arrays below, use these category-specific hints as a guide for both tone and content selection:
- commonSymptoms guidance (prefer concerns like these when the source supports it): ${procedure.commonSymptomsHint.join(", ")}
- implantOptions guidance (the entries should resemble these service categories, adapted to what this specific clinic offers — use as many as the source page supports, between 3 and 6): ${procedure.serviceCategoriesHint
        .map((s) => `"${s.title}" — ${s.description}`)
        .join(" | ")}
- faqItems guidance (the 6 questions should cover topics like these, adapted to this clinic): ${procedure.faqThemes.join(" | ")}
- treatmentJourney guidance (override the default journey template with this): ${procedure.journeyStages}
`
    : "";

  const prompt = `You are extracting facts from a dental clinic's existing website to populate a landing page.${procedureBlock}

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
- "clinic.hours" is a short summary of the clinic's open hours as shown on the source page (e.g. "Mon-Fri 8AM-5PM", "Mon-Thu 7AM-5PM, Fri 8AM-12PM", "Open 7 days 9AM-7PM"). Use the format that appears on the site, condensed to one line under 60 chars. Look in the footer/contact areas of the source text. Omit if no opening hours appear in the source — do NOT invent or guess.
- "clinic.tagline" is a short marketing line. Omit if absent.
- "clinic.heroSubtitle" is 1-2 sentences (max 220 chars) introducing this clinic's ${heroSubtitleFocus}, naturally weaving in 1-2 specific services/qualities from the source page (e.g., same-day crowns, 3D imaging, flexible financing, multilingual staff, family-friendly). ${procedure ? `Mention the ${procedure.label} focus naturally (not as a tag line).` : ""} Sound like marketing copy, not a list.
- "clinic.differentiators" is exactly 4 short reasons to choose this clinic, derived from what the source page actually emphasizes. Each: "title" (2-4 words, title case, e.g., "Same-Day Crown Technology", "Family-Focused Care", "Flexible Financing", "Multilingual Staff") and "description" (one sentence, 80-160 chars). Pick the most concrete, distinctive qualities mentioned on the site — not generic "experienced doctors" filler. If the page doesn't surface 4 distinct qualities, fall back to: experience/credentials, technology used, financing/insurance, patient-experience qualities.
- "clinic.stats" is exactly 4 short "by the numbers" stats for the marquee strip. Each: "value" (a short string like "20+", "5,000+", "98%", "Same-Day", "7 Days/Wk") and "label" (3-5 words like "Years Serving Patients", "Smiles Restored", "Patient Satisfaction"). Derive numbers from the source where possible: years since founding ("Since 2008" → "18+ Years"), services offered, patient counts the site mentions, ratings, technology stats. If the source is sparse, choose conservative-but-believable numbers (e.g., "18+ Years Experience" from doctor's experience, "10,000+ Smiles Restored" for any established practice, "100%" or "98%" patient satisfaction, "Same-Day" or "5 Star Rated"). DO NOT invent specific counts the site doesn't support — keep them generic and aspirational instead.
- "clinic.benefits" is exactly 6 short patient-facing benefits of choosing THIS clinic, derived from the source. Each: "title" (2-4 words, title case, e.g., "Same-Day Crowns", "Stress-Free Visits", "Insurance-Friendly", "Gentle Pediatric Care", "Modern Technology", "Flexible Financing") and "description" (one sentence, 80-160 chars, focused on the patient benefit, not the clinic). These should overlap thematically with differentiators but be MORE concrete, patient-outcome-focused, and broader in scope (a clinic can have many benefits but only a few core differentiators). Always include benefits tied to: comfort/experience, technology/quality of care, scheduling/convenience, financial accessibility, and 1-2 service-specific advantages relevant to ${template}.
- "clinic.implantOptions" is between 3 and 6 ${template === "implants" ? "implant treatment options" : "core treatment categories"} the clinic offers, derived from the source. **Use as many as the source page genuinely supports — do NOT pad to a fixed count.** If the clinic clearly offers 3 prominent services, return 3. If they offer a broad mix of 6, return 6. Each: "title" (2-4 words, title case) and "description" (one sentence, 100-180 chars explaining what it solves for the patient). ${template === "family-dentistry"
  ? `For a family-dentistry practice, typical service categories include: Preventive Care (cleanings/exams), Restorative Dentistry (fillings/crowns), Cosmetic Dentistry (whitening/veneers), Pediatric Care (kids visits), Implants, and Ortho/Invisalign. Pick the ones the site actually emphasizes.`
  : template === "implants"
  ? `For an implants practice, typical implant treatment types include: Single Tooth Implant, Multiple Tooth Implants / Implant Bridge, Full Arch / All-on-4, Implant-Supported Dentures, Mini Implants, Same-Day Implants, Zygomatic Implants. Pick the ones the site actually emphasizes.`
  : `Examples: General Dentistry, Cosmetic Dentistry, Implant Dentistry, Orthodontics, Emergency Care, Pediatric Dentistry, Periodontal Care. Pick the ones the site actually emphasizes.`}
- "clinic.faqItems" is exactly 6 patient-facing FAQ entries derived from the source's services and emphasis. Each: "question" (a real question a patient might ask, e.g. "Do you accept my dental insurance?", "How long does an implant procedure take?", "Are you accepting new patients?") and "answer" (1-3 sentences, 120-260 chars, conversational and reassuring, drawn from facts present on the source page when possible). Mix question types: insurance/financing, scheduling/new-patient, a service-specific question tied to the clinic's emphasis, comfort/anxiety, what to expect on a first visit, and one location/hours practical question. Tailor questions to ${template === "family-dentistry" ? "a family-dentistry practice (include kids/pediatric question, insurance, scheduling)" : template === "implants" ? "an implants practice (include implant procedure length, recovery, candidacy, cost/financing)" : "a general dental practice"}.
- "clinic.footerAbout" is a single sentence (max 200 chars) describing this clinic for the footer — what they do, who they serve, what they value. Sound warm and confident, not corporate. Weave in 1-2 specifics from the source (e.g., "family-owned since 2008", "serving Minneapolis families with gentle dentistry"). Do NOT use the words "we" or "our" — write in third person about the clinic ("Angell Family Dentistry has been serving...").
- "clinic.commonSymptoms" is exactly 10 short symptom or concern labels (1-3 words each, title case, e.g. "Tooth Pain", "Sensitivity", "Lost Filling", "Gum Bleeding", "Cracked Tooth", "Crooked Teeth", "Whitening", "Missing Tooth", "Jaw Pain", "Bad Breath") that patients of THIS clinic might click when describing why they're booking. Mix urgent symptoms (pain, swelling, trauma) with routine concerns (sensitivity, cosmetic) AND with concerns specific to the services the clinic emphasizes (e.g., for an implant practice include "Loose Implant"; for a family practice include "Kids' First Visit"; for cosmetic include "Stained Teeth"). Tailor the mix to the clinic's actual service emphasis.
- "clinic.treatmentJourney" is exactly 6 steps describing what a typical patient experiences at THIS clinic. Each step: "title" (3-5 words, title case) and "description" (1-2 sentences, 100-220 chars). ${template === "family-dentistry"
  ? `The 6 stages for a family-dentistry practice are: (1) welcome & new-patient exam, (2) personalized care plan / treatment options, (3) preventive cleaning & education, (4) treatment & repair (fillings/crowns/etc.), (5) optional cosmetic refinements, (6) ongoing maintenance / recall visits.`
  : `The 6 stages for a dental-implants practice are: (1) initial consultation & assessment, (2) preparation/foundation work, (3) implant placement, (4) healing/osseointegration, (5) abutment & impressions, (6) final restoration.`} Lightly weave in specifics from the clinic's source page where they fit — if the clinic has 3D imaging, mention it in step 1; if same-day technology, mention it where relevant; if sedation options, mention them where relevant. Do NOT invent technology the source page doesn't mention — if the page is sparse, write generic but professional copy for that step.
- "clinic.logoUrl" is the URL of the clinic's logo image. Pick the image whose alt text mentions "logo" or the clinic name, OR an image clearly used as a header brand mark. Omit if no clear logo image exists. Prefer SVG/PNG over JPG.
- "doctor.name" is the lead dentist's name without titles or credentials (e.g. "Steven Angell", not "Dr. Steven Angell, DDS").
- "doctor.credentials" is a short suffix like "DDS, FAGD". Omit if not stated.
- "doctor.bio" is a polished, marketing-grade bio of 3-5 sentences (max 500 chars). Compose it from the facts present in the source pages — DO NOT invent education, schools, year ranges, awards, or memberships that aren't stated. Weave in (when present in the source): (1) years of clinical experience, ideally as the opening hook (e.g., "With over X years of dental experience...") — derive years from any "since 2008" / "joined in 2008" / "X years ago" / "two decades" mentions; (2) education / dental school; (3) credentials (DDS, DMD, etc.); (4) professional memberships (ADA, AGD, state dental association); (5) areas of focus or specialty; (6) one warm sentence about their treatment philosophy or patient-care approach. Sound confident and welcoming — not a list, but flowing prose. If the source is sparse, write a shorter bio (2-3 sentences) using only what's actually there rather than padding with generic claims.
- "doctor.specialistCredentials" is exactly 4 short credential / expertise bullet points that appear next to the doctor's portrait in the "Meet [Name]" specialist section. Each is a 2-5 word title-cased phrase — NOT a sentence, NO trailing period. Mix four angles: (1) a formal credential or certification (e.g., "Board Certified Implantologist", "Fellow, AGD"), (2) a clinical area of expertise (e.g., "Expert in Full-Arch Restoration", "Pediatric Behavior Specialist"), (3) a technology or technique mastery (e.g., "Advanced 3D Guided Surgery", "Digital Smile Design"), (4) a treatment philosophy or patient-experience trait (e.g., "Patient-First Philosophy", "Gentle, Kid-Focused Care"). Derive from the source bio/about page wherever possible; if the source is sparse, write conservative, believable claims that match ${procedure ? procedure.label : `${template}`} practices — never claim specific certifications the source doesn't mention. ${procedure ? `Lean toward ${procedure.label}-relevant phrasing (e.g., for pediatric: "Pediatric Specialist", "Sensory-Aware Care"; for invisalign: "Platinum Invisalign Provider"; for all-on-4: "Same-Day Full-Arch Expert").` : ""}
- "doctor.photoUrl" is the URL of an image clearly showing the lead dentist. Strongly prefer images whose alt text contains the doctor's name, "Dr.", or the word "dentist" (e.g. alt="Dr. Anna Weber" → that's the photo). Use the URL exactly as given in the candidates list. Pick the most prominent / professional headshot if multiple. Omit only if no candidate's alt text or URL filename plausibly identifies a dentist portrait.
- "clinic.heroReferenceUrl" is the URL of an image to use as a visual reference for the AI-generated hero photo. Pick a practice / facility / interior / exterior / treatment-room photo that conveys the clinic's atmosphere. STRONGLY EXCLUDE: anything you picked as logoUrl or doctor.photoUrl, social/icon graphics, decorative SVGs, banners with text, before/after grids, and any image whose alt text or URL filename suggests a person's portrait. Prefer images whose alt text or URL filename mentions "office", "facility", "interior", "exterior", "lobby", "treatment", "operatory", or unattributed practice photos. Omit if no suitable candidate exists.
- "reviews" is an array of exactly 6 patient testimonials. **First**: scan the home and about page text above for genuine patient quotes/testimonials (look for quoted text attributed to a patient, often near words like "review", "testimonial", "patient says", or in star/rating contexts). If real ones exist, use those verbatim (light cleanup only). **If fewer than 6 real reviews exist**, generate plausible reviews based on the actual services and qualities described on the page (e.g., if the page emphasizes implants, family-friendliness, gentle care, and modern technology, write reviews that mention those specific things). For each: "name" is a generic but realistic format like "Sarah M." or "James W." (first name + last initial). "text" is 60-220 chars, in a natural patient voice, mentioning specifics from the page. "rating" is 5. Mix the angles across the 6 reviews — at least one mentions the doctor's care/manner, one mentions a specific service the clinic emphasizes, one mentions comfort/anxiety, one mentions value/insurance/financing, one mentions front-desk/scheduling experience, one mentions visible results. Always return exactly 6 reviews.

Use ONLY URLs from the image candidates list above for "clinic.logoUrl" and "doctor.photoUrl". Do not invent URLs.
Required fields: clinic.name, clinic.phone, doctor.name, doctor.bio. Omit other fields if you cannot fill them confidently from the source.`;

  return await retryOn503(async () => {
    const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 6144,
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
              hours: { type: Type.STRING },
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
              stats: {
                type: Type.ARRAY,
                minItems: 4,
                maxItems: 4,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.STRING },
                    label: { type: Type.STRING },
                  },
                  required: ["value", "label"],
                },
              },
              benefits: {
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
              implantOptions: {
                type: Type.ARRAY,
                minItems: 3,
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
              faqItems: {
                type: Type.ARRAY,
                minItems: 6,
                maxItems: 6,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                  },
                  required: ["question", "answer"],
                },
              },
              footerAbout: { type: Type.STRING },
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
              specialistCredentials: {
                type: Type.ARRAY,
                minItems: 4,
                maxItems: 4,
                items: { type: Type.STRING },
              },
            },
            required: ["name", "bio"],
          },
          reviews: {
            type: Type.ARRAY,
            minItems: 6,
            maxItems: 6,
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
