import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import type { ClinicConfig } from "../../src/types/clinic";

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";

export type SceneKind = "hero" | "benefits" | "specialist" | "whychoose";

interface ScenePromptArgs {
  config: ClinicConfig;
  scene: SceneKind;
  hasDoctorReference: boolean;
  hasPracticeReference: boolean;
}

function buildPrompt({ config, scene, hasDoctorReference, hasPracticeReference }: ScenePromptArgs): string {
  const diffTitles = (config.clinic.differentiators ?? []).map((d) => d.title).join(", ");
  const services = diffTitles || "modern dental implant care, family dentistry, advanced restorative dentistry";
  const doctorName = config.doctor.name;

  const refLines: string[] = [];
  if (hasDoctorReference) {
    refLines.push(
      `The first attached photo is the dentist (Dr. ${doctorName}). Depict that same person — same face, build, age, hair, skin tone — as the dentist in the generated scene. Show them in professional dental attire (clinic uniform, mask pulled down or off, possibly gloves).`,
    );
  }
  if (hasPracticeReference) {
    refLines.push(
      `The second attached photo shows the clinic's actual interior. Match its color tones, lighting, and architectural feel; treat it as the visual setting of the new scene.`,
    );
  }

  const whyChooseScene = hasDoctorReference
    ? `Scene: a warm "why-choose-us" moment featuring THE SAME DENTIST from the reference photo (Dr. ${doctorName}) — same face, same identity. The scene should visually communicate the clinic's strengths (${services}). Pick the composition that best matches the service mix:
  - Family / general dentistry → the dentist warmly smiling beside a 7-10 year old child sitting in a clean modern dental chair, the child giving a thumbs up or relaxed smile, the dentist holding a small dental mirror or coloured toothbrush. Friendly, no fear.
  - Implants / restorative → the dentist holding up a clean dental implant model or a tablet showing implant graphics, smiling toward the camera with a confident, expert posture in a warmly lit operatory.
  - Cosmetic / whitening → the dentist confidently presenting a shade guide or a clean whitening tray, soft glowy light, a cosmetic operatory background.
  Faces ARE allowed and encouraged — but the only face shown must be the dentist's (matching the reference). Any patient in the frame must be shown from the side, partial profile, or back of head — no full patient face.
  SAFE-CROP FRAMING (CRITICAL): the image will be cropped from a square source down to a 6:5 display (taller-than-wide), so the BOTTOM ~16% of the square will be discarded. Position the dentist's head in the UPPER THIRD of the frame with the top of the hair sitting ~10% down from the top edge and visible safe padding above (NEVER crop the forehead or top of head). Fill the lower portion of the square with chair / desk / equipment / floor — content that's safe to lose. Subject placed in the right-of-center sweet spot, calm negative space on the left for the section's heading. Warm soft natural light, shallow depth of field, slightly cinematic. Background is a tastefully blurred warm dental office interior in the clinic's neutral palette (off-white, warm beige, soft sage).
  Strictly: ONLY the dentist's face from the reference photo — no other staff faces, no full patient faces, no models, no stock-photo strangers. NO clinical close-up of teeth, NO before/after grids, NO surgical or medical detail, NO text overlay, NO logos, NO watermarks.`
    : `Scene: a warm clinical still life that summarizes this clinic's strengths (${services}) — NO people, NO faces. Show gloved hands (or no hands at all) arranging a clean dental implant model, a tablet displaying a smile graphic, a small plant, and a soft cloth on a warm consultation table. Composition: 6:5 portrait orientation, subject placed right-of-center with negative space on the left for headings. Soft natural light, warm beige / off-white / sage palette, shallow depth of field. NO text, NO logos, NO watermarks, NO graphic medical detail.`;

  const sceneInstruction = scene === "hero"
    ? hasDoctorReference
      ? "Scene: a calm, modern dental office interior. The dentist is standing at a workstation reviewing a 3D dental scan on a screen, or arranging clean instruments on a tray. NO surgical or invasive activity. NO patient in the chair receiving treatment. Emphasis: confidence, modern technology, calm professionalism. SAFE-CROP FRAMING (CRITICAL): the image will be cropped from a square source down to a 4:3 horizontal display, so the BOTTOM ~12-15% of the square will be discarded. Therefore: position the dentist's head in the UPPER HALF of the frame — the top of the hair sits roughly 10% down from the top edge with safe padding above it (NEVER touch or crop the top of the head), and the dentist's body extends downward, with a tabletop / workstation / lower-cabinet area filling the bottom of the square that's safe to lose. Frame waist-up to chest-up of the dentist, do NOT include the dentist's full legs."
      : "Scene: a calm, modern dental office interior — NO people, NO dentist, NO patient, NO faces of any kind. Show ONLY the room and equipment: a clean treatment chair (empty), a workstation with a 3D dental scan glowing on the screen, a tray of clean instruments, soft cabinetry, and a window with diffused natural light. Emphasis: confidence, modern technology, calm professionalism conveyed entirely through the space itself."
    : scene === "benefits"
    ? hasDoctorReference
      ? "Scene: a warm consultation moment in a comfortable corner of the office. The dentist is holding a dental implant model (or a tablet showing implant graphics) and gesturing while speaking. A seated patient (visible only from the back or side, no face) is listening attentively. Emphasis: warm communication, reassurance, education. SAFE-CROP FRAMING (CRITICAL): the image will be cropped from a square source down to a 6:5 display (taller-than-wide), so the BOTTOM ~16% of the square will be discarded. Position the dentist's head in the UPPER THIRD of the frame with the top of the hair sitting ~10% down from the top edge and clear safe padding above (NEVER crop the forehead or top of head). Fill the lower portion of the square with desk/table surface, consultation materials, or warm office floor — content that's safe to lose."
      : "Scene: a close, warm consultation still life — NO faces, NO heads, NO full people. Show ONLY gloved hands (sterile light-blue or white nitrile gloves) holding a dental implant model OR a tablet displaying clean implant graphics, resting on a soft consultation table. Optionally include a second pair of patient hands (resting calmly, no face, no body) on the other side of the table to suggest dialogue. Soft natural light, warm office background blurred behind. Emphasis: education, reassurance, communication conveyed through hands and objects only."
    : scene === "whychoose"
    ? whyChooseScene
    : "A professional LinkedIn-style corporate headshot of the dentist alone. SQUARE 1:1 aspect ratio (do NOT generate a vertical or wider image — the output MUST be square). FRAMING RULE: head-and-shoulders crop — show the dentist from the upper chest up. The top of the head/hair must sit roughly 8-12% down from the top edge with comfortable safe padding above it (NEVER touch or crop the top of the head). The chin sits roughly at the vertical center of the square. Subject centered horizontally. Looking directly at the camera with a warm, confident, slightly-smiling expression. Even, soft studio lighting (no harsh shadows). Wearing a crisp clean white dental coat over scrubs (mask off, no gloves, no stethoscope). Sharp focus, professional photography, polished but approachable. ABSOLUTE BACKGROUND RULE: the background MUST be a single solid flat color — choose either soft sage green (#9CAF9F) OR warm cream (#E8DDD0) OR neutral gray (#D8D8D8). The background is one uniform color from edge to edge with NO objects, NO furniture, NO walls, NO chairs, NO computers, NO dental equipment, NO doors, NO shelves, NO posters, NO windows, NO architectural detail, NO depth, NO blur of a scene. Treat the background like a photography studio backdrop — flat, plain, empty. Only the dentist appears in the image; nothing else.";

  const noTextRule = scene === "specialist"
    ? "ABSOLUTE RULE: The output image must contain ZERO text, ZERO captions, ZERO labels, ZERO badges, ZERO words, ZERO numbers, ZERO logos, ZERO embroidery on clothing, ZERO signs on walls. No typography of any kind anywhere. The clinic coat must be plain — no embroidered name, no badge. Walls must have no posters or signs with text. The image is purely photographic with no graphic design overlays."
    : scene === "whychoose"
    ? "Strict requirements: the subject must be a PATIENT (not a dentist or clinic staff member, not wearing a white coat or scrubs). NO text, NO logos, NO watermarks, NO blood, NO graphic medical detail, NO clinical close-ups of teeth (a normal smile is fine and encouraged, but not a back-of-mouth shot). The image must feel warm and aspirational, never clinical."
    : hasDoctorReference
    ? "Strict requirements: NO visible patient faces (patient may be shown from the side, back, or as hands only); NO text, logos, or watermarks; NO blood, open mouths with teeth visible up close, or graphic medical detail."
    : "ABSOLUTE RULE: NO human faces of any kind in the image — no dentist face, no patient face, no staff face, no faces in the background, no reflections of faces in screens or mirrors. If a person appears at all they must be shown as gloved hands only (no arms above the wrist, no head, no torso). Prefer no people whatsoever. Also: NO text, NO logos, NO watermarks, NO blood, NO graphic medical detail.";

  const isSpecialist = scene === "specialist";
  const isWhyChoose = scene === "whychoose";
  const lines: string[] = [
    isSpecialist
      ? `A professional headshot photograph for ${config.clinic.name}'s landing page.`
      : `A professional marketing photograph for ${config.clinic.name}'s dental implants landing page.`,
    ...refLines,
    sceneInstruction,
    // Only mention clinic strengths in scene-style images; for the headshot it causes Nano Banana
    // to render the differentiator titles as visual label overlays.
    isSpecialist ? "" : `Visual elements suggesting these clinic strengths: ${services}.`,
    "Style: warm, professional, cinematic, shallow depth of field, soft natural light. NOT clinical or sterile.",
    isSpecialist ? "" : "Color palette: soft sage green, warm cream and beige, muted off-white, gentle natural tones.",
    isSpecialist || isWhyChoose ? "" : "Composition: horizontal 4:3 framing (slightly wider than tall, NOT 16:9 widescreen), the dentist and key scene elements centered safely within the inner 80% of the frame so nothing important gets cropped when displayed in a 4:3 container. Uncluttered.",
    noTextRule,
  ];
  return lines.filter(Boolean).join("\n");
}

interface FetchedImage {
  data: string;
  mimeType: string;
}

async function fetchAsBase64(source: string): Promise<FetchedImage | null> {
  try {
    if (source.startsWith("http")) {
      const res = await fetch(source);
      if (!res.ok) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      const mimeType = res.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
      if (!mimeType.startsWith("image/")) return null;
      return { data: buf.toString("base64"), mimeType };
    }
    const buf = await fs.readFile(source);
    const ext = path.extname(source).slice(1).toLowerCase();
    const mimeType =
      ext === "png" ? "image/png" :
      ext === "webp" ? "image/webp" :
      ext === "svg" ? "image/svg+xml" :
      "image/jpeg";
    return { data: buf.toString("base64"), mimeType };
  } catch {
    return null;
  }
}

export interface GenerateOptions {
  scene: SceneKind;
  doctorPhotoLocalPath?: string;
  practiceReferenceUrl?: string;
}

export async function generateSceneImage(
  config: ClinicConfig,
  slug: string,
  publicClinicsDir: string,
  options: GenerateOptions,
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn(`[${options.scene}] GEMINI_API_KEY missing — skipping image generation`);
    return null;
  }
  const ai = new GoogleGenAI({ apiKey });

  let doctorRef: FetchedImage | null = null;
  if (options.doctorPhotoLocalPath) {
    doctorRef = await fetchAsBase64(options.doctorPhotoLocalPath);
    if (!doctorRef) console.warn(`[${options.scene}] doctor photo read failed at ${options.doctorPhotoLocalPath}`);
  }

  let practiceRef: FetchedImage | null = null;
  if (options.practiceReferenceUrl) {
    practiceRef = await fetchAsBase64(options.practiceReferenceUrl);
    if (!practiceRef) console.warn(`[${options.scene}] practice ref fetch failed at ${options.practiceReferenceUrl}`);
  }

  const prompt = buildPrompt({
    config,
    scene: options.scene,
    hasDoctorReference: !!doctorRef,
    hasPracticeReference: !!practiceRef,
  });

  const parts: ({ text: string } | { inlineData: FetchedImage })[] = [];
  if (doctorRef) parts.push({ inlineData: doctorRef });
  if (practiceRef) parts.push({ inlineData: practiceRef });
  parts.push({ text: prompt });

  const maxAttempts = Math.max(1, Number(process.env.IMAGE_MAX_ATTEMPTS ?? 3));
  let lastFinishReason: string | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: parts.length > 1 ? parts : prompt,
        config: { responseModalities: ["IMAGE"] },
      });

      const candidateParts = response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = candidateParts.find((p) => p.inlineData?.data);
      if (!imagePart?.inlineData?.data) {
        lastFinishReason = response.candidates?.[0]?.finishReason ?? undefined;
        if (attempt < maxAttempts) {
          const delay = 800 * attempt + Math.floor(Math.random() * 400);
          console.warn(
            `[${options.scene}] no image (finishReason=${lastFinishReason ?? "?"}) — retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`,
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        console.warn(
          `[${options.scene}] no image returned after ${maxAttempts} attempts (finishReason=${lastFinishReason ?? "?"})`,
        );
        return null;
      }

      const mime = imagePart.inlineData.mimeType ?? "image/png";
      const ext = mime.includes("jpeg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
      const buf = Buffer.from(imagePart.inlineData.data, "base64");

      const dir = path.join(publicClinicsDir, slug);
      await fs.mkdir(dir, { recursive: true });
      const filename = `${options.scene}.${ext}`;
      await fs.writeFile(path.join(dir, filename), buf);
      if (attempt > 1) console.log(`[${options.scene}] succeeded on attempt ${attempt}`);
      return `/clinics/${slug}/${filename}`;
    } catch (err) {
      const message = (err as Error).message;
      if (attempt < maxAttempts) {
        const delay = 800 * attempt + Math.floor(Math.random() * 400);
        console.warn(
          `[${options.scene}] generation error (${message}) — retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      console.warn(`[${options.scene}] generation failed after ${maxAttempts} attempts: ${message}`);
      return null;
    }
  }
  return null;
}
