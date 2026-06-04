import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { GoogleGenAI } from "@google/genai";
import { createGenAI } from "../../src/lib/genai";
import type { ClinicConfig } from "../../src/types/clinic";
import type { Procedure } from "./procedures";

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";

// Every generated scene must be a 1:1 square at this size, matching all other
// clinics. The image model (Nano Banana) ignores the prompt's "square 1:1"
// instruction and instead inherits the aspect ratio of whatever reference image
// it's given — so a portrait doctor photo yields portrait scenes. We enforce the
// ratio on both ends: square the reference before sending, square the output
// before saving.
const TARGET_SIZE = 1024;

export type SceneKind = "hero" | "benefits" | "specialist" | "whychoose";

interface ScenePromptArgs {
  config: ClinicConfig;
  scene: SceneKind;
  hasDoctorReference: boolean;
  hasPracticeReference: boolean;
  procedure: Procedure | null;
}

export function buildPrompt({ config, scene, hasDoctorReference, hasPracticeReference, procedure }: ScenePromptArgs): string {
  const diffTitles = (config.clinic.differentiators ?? []).map((d) => d.title).join(", ");
  const services = diffTitles || "modern dental implant care, family dentistry, advanced restorative dentistry";
  const doctorName = config.doctor.name;

  // Specialist headshot + reference photo: Gemini's text-to-image path silently
  // refuses ("IMAGE_OTHER", no safetyRatings) when asked to *generate* a tight
  // portrait of an identifiable real person. Nano Banana's image-EDIT path
  // tolerates the same input — restyle background/clothing/lighting while
  // keeping the face. Build a separate edit-task prompt for this case and
  // short-circuit the rest of the scene composition.
  if (scene === "specialist" && hasDoctorReference) {
    // The other scenes (hero/benefits/whychoose) render the dentist in a warm
    // in-office setting (sage walls, dental coat over teal scrubs, decorative
    // shelving, soft natural light, cinematic shallow DoF). A flat studio
    // backdrop here would feel visually disconnected from those, so the
    // specialist portrait targets the same in-office aesthetic — just framed
    // as a portrait crop instead of a consultation scene.
    const editLines: string[] = [
      `EDIT TASK: Restyle the attached photograph of Dr. ${doctorName} into a warm professional in-office portrait for ${config.clinic.name}'s landing page. This portrait will appear alongside other in-office consultation images, so it must match their look and feel.`,
      "Preserve the person's face, hair, build, and skin tone exactly as in the reference. Do not change their identity or facial features.",
      "Background change: place the subject in a warm dental office interior — soft sage-green wall behind them, a glimpse of decorative shelving with a small plant or framed certificates on one side, blurred out with shallow depth of field. Window light from one side suggested through soft highlights. No flat studio backdrop.",
      "Clothing change: dress the subject in a crisp white dental coat worn open over teal or sage-green scrubs (the same uniform style as a typical clinic dentist). NO mask at all — no mask on the face, no mask pulled down around the neck, no mask hanging from one ear, no mask straps visible anywhere. The neck and collar area must be clean. No gloves, no stethoscope.",
      "Lighting and style: warm, cinematic, soft natural light (as if from a side window). Shallow depth of field with the face in sharp focus and the office softly blurred behind. Color palette: warm beige, soft sage green, muted off-white, gentle natural tones — matching the other landing-page scenes.",
      "Framing: square 1:1 aspect ratio, head-and-shoulders crop showing the subject from the upper chest up. Top of the head sits roughly 8-12% down from the top edge with clear space above. Chin sits roughly at the vertical center. Subject centered horizontally, looking toward the camera with a warm, confident, slightly-smiling expression.",
      "ABSOLUTE RULE: The output must contain ZERO text, ZERO captions, ZERO labels, ZERO badges, ZERO words, ZERO numbers, ZERO logos, ZERO embroidery on clothing, ZERO readable signs or posters in background. The white coat must be plain — no embroidered name, no badge. Any framed items on shelves must be too blurred to read.",
    ];
    return editLines.join("\n");
  }

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

  // whychoose-specific scene wording (dentist alone smiling at camera, with
  // heavy positional / "trust & expertise" rhetoric) consistently made
  // gemini-2.5-flash-image give up with finishReason=IMAGE_OTHER (no safety
  // ratings populated — it's not a policy block, the model just doesn't
  // produce an image for that combination). The proven benefits "consultation
  // moment" prompt generates reliably, so whychoose reuses it. The two images
  // end up visually similar; if you need them more distinct, change one prop
  // (e.g. "shade guide" / "smile graphic on tablet") rather than rewriting
  // the whole scene.
  const whyChooseScene = hasDoctorReference
    ? "Scene: a warm consultation moment in a comfortable corner of the office. The dentist is holding a dental implant model (or a tablet showing implant graphics) and gesturing while speaking. A seated patient (visible only from the back or side, no face) is listening attentively. Emphasis: warm communication, reassurance, education. SAFE-CROP FRAMING (CRITICAL): the image will be cropped from a square source down to a 6:5 display (taller-than-wide), so the BOTTOM ~16% of the square will be discarded. Position the dentist's head in the UPPER THIRD of the frame with the top of the hair sitting ~10% down from the top edge and clear safe padding above (NEVER crop the forehead or top of head). Fill the lower portion of the square with desk/table surface, consultation materials, or warm office floor — content that's safe to lose."
    : `Scene: a warm clinical still life that summarizes this clinic's strengths (${services}) — NO people, NO faces. Show gloved hands (or no hands at all) arranging a clean dental implant model, a tablet displaying a smile graphic, a small plant, and a soft cloth on a warm consultation table. Composition: 6:5 portrait orientation, subject placed right-of-center with negative space on the left for headings. Soft natural light, warm beige / off-white / sage palette, shallow depth of field. NO text, NO logos, NO watermarks, NO graphic medical detail.`;

  const sceneInstruction = scene === "hero"
    ? hasDoctorReference
      ? whyChooseScene
      : "Scene: a bright, modern dental office interior, empty of people. Show the room: a clean treatment chair, a workstation with a tablet on a stand, soft cabinetry, a small plant, and a window with diffused natural light. The mood is confident, modern, calm — conveyed entirely through the space."
    : scene === "benefits"
    ? hasDoctorReference
      ? whyChooseScene
      : "Scene: a close, warm consultation still life with no faces or heads visible. Show gloved hands (sterile light-blue or white nitrile gloves) holding a dental implant model OR a tablet displaying clean implant graphics, resting on a soft consultation table. A second pair of patient hands may rest calmly on the other side of the table to suggest dialogue. Soft natural light, warm office background blurred behind. The mood is education and reassurance conveyed through hands and objects only."
    : scene === "whychoose"
    ? whyChooseScene
    : "A professional LinkedIn-style corporate headshot of the dentist alone. Square 1:1 aspect ratio. Framing: head-and-shoulders crop showing the dentist from the upper chest up. The top of the head sits roughly 8-12% down from the top edge with comfortable space above it. The chin sits roughly at the vertical center of the square. Subject centered horizontally, looking directly at the camera with a warm, confident, slightly-smiling expression. Even, soft studio lighting with no harsh shadows. Wearing a crisp clean white dental coat over scrubs (mask off, no gloves, no stethoscope). Sharp focus, professional photography, polished but approachable. Background: a single solid flat color — choose either soft sage green (#9CAF9F), warm cream (#E8DDD0), or neutral gray (#D8D8D8). The background is one uniform color from edge to edge, like a photography studio backdrop — no furniture, equipment, walls, posters, windows, or scene detail. Only the dentist appears; nothing else in the frame.";

  const noTextRule = scene === "specialist"
    ? "ABSOLUTE RULE: The output image must contain ZERO text, ZERO captions, ZERO labels, ZERO badges, ZERO words, ZERO numbers, ZERO logos, ZERO embroidery on clothing, ZERO signs on walls. No typography of any kind anywhere. The clinic coat must be plain — no embroidered name, no badge. Walls must have no posters or signs with text. The image is purely photographic with no graphic design overlays."
    : scene === "whychoose"
    ? "Strict requirements: NO visible patient faces (patient may be shown from the side, back, or as hands only); NO text, logos, or watermarks; NO blood, open mouths with teeth visible up close, or graphic medical detail."
    : hasDoctorReference
    ? "Strict requirements: NO visible patient faces (patient may be shown from the side, back, or as hands only); NO text, logos, or watermarks; NO blood, open mouths with teeth visible up close, or graphic medical detail."
    : "ABSOLUTE RULE: NO human faces of any kind in the image — no dentist face, no patient face, no staff face, no faces in the background, no reflections of faces in screens or mirrors. If a person appears at all they must be shown as gloved hands only (no arms above the wrist, no head, no torso). Prefer no people whatsoever. Also: NO text, NO logos, NO watermarks, NO blood, NO graphic medical detail.";

  const isSpecialist = scene === "specialist";

  let procedureSceneHint = "";
  if (procedure && !isSpecialist) {
    let sceneHint: string | undefined;
    if (scene === "hero") sceneHint = procedure.imageScenes.hero;
    else if (scene === "benefits") sceneHint = procedure.imageScenes.benefits;
    else sceneHint = procedure.imageScenes.whychoose;
    if (sceneHint) {
      procedureSceneHint = `PROCEDURE-SPECIFIC SETTING: This clinic specializes in ${procedure.label}. The scene's environment, equipment, and visual mood should evoke a ${procedure.label} practice — specifically: ${sceneHint}. Adapt the scene above to fit this setting (without contradicting the framing/safety rules).`;
    }
  }

  const practiceDescriptor = procedure
    ? `${procedure.label.toLowerCase()} practice`
    : "dental practice";

  const lines: string[] = [
    isSpecialist
      ? `A professional headshot photograph for ${config.clinic.name}'s landing page.`
      : `A professional marketing photograph for ${config.clinic.name}'s ${practiceDescriptor} landing page.`,
    ...refLines,
    sceneInstruction,
    procedureSceneHint,
    // Only mention clinic strengths in scene-style images; for the headshot it causes Nano Banana
    // to render the differentiator titles as visual label overlays.
    isSpecialist ? "" : `Visual elements suggesting these clinic strengths: ${services}.`,
    "Style: warm, professional, cinematic, shallow depth of field, soft natural light — approachable, not sterile.",
    isSpecialist ? "" : "Color palette: soft sage green, warm cream and beige, muted off-white, gentle natural tones.",
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

// Crop a reference image to a centered 1:1 square so the model produces a square
// scene. Portrait shots are head-and-shoulders, so crop from near the top to
// avoid clipping the head; landscape/other crop from the center.
async function toSquareReference(img: FetchedImage): Promise<FetchedImage> {
  try {
    const input = Buffer.from(img.data, "base64");
    const meta = await sharp(input).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    let pipeline = sharp(input);
    if (w && h && w !== h) {
      const side = Math.min(w, h);
      const left = Math.round((w - side) / 2);
      const top =
        h > w ? Math.round(Math.min(h - side, side * 0.03)) : Math.round((h - side) / 2);
      pipeline = pipeline.extract({ left, top, width: side, height: side });
    }
    const out = await pipeline
      .resize(TARGET_SIZE, TARGET_SIZE, { fit: "fill" })
      .png()
      .toBuffer();
    return { data: out.toString("base64"), mimeType: "image/png" };
  } catch {
    return img; // fall back to the original reference if sharp fails
  }
}

// Guarantee the saved scene is exactly TARGET_SIZE square regardless of what the
// model returned. The squared reference makes the output square already, so this
// is a clean no-op resize in the normal case; the center cover-crop is a safety
// net for the rare time the model deviates.
async function toSquareOutput(raw: Buffer): Promise<Buffer> {
  try {
    return await sharp(raw)
      .resize(TARGET_SIZE, TARGET_SIZE, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
  } catch {
    return raw;
  }
}

export interface GenerateOptions {
  scene: SceneKind;
  doctorPhotoLocalPath?: string;
  practiceReferenceUrl?: string;
  procedure?: Procedure | null;
}

export async function generateSceneImage(
  config: ClinicConfig,
  slug: string,
  publicClinicsDir: string,
  options: GenerateOptions,
): Promise<string | null> {
  let ai: GoogleGenAI;
  try {
    ai = createGenAI();
  } catch (err) {
    console.warn(`[${options.scene}] ${(err as Error).message} — skipping image generation`);
    return null;
  }

  let doctorRef: FetchedImage | null = null;
  if (options.doctorPhotoLocalPath) {
    doctorRef = await fetchAsBase64(options.doctorPhotoLocalPath);
    if (!doctorRef) console.warn(`[${options.scene}] doctor photo read failed at ${options.doctorPhotoLocalPath}`);
    else doctorRef = await toSquareReference(doctorRef);
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
    procedure: options.procedure ?? null,
  });
  if (process.env.DEBUG_PROMPT === "1") {
    console.log(`\n[${options.scene}] prompt:\n${prompt}\n---`);
  }

  const parts: ({ text: string } | { inlineData: FetchedImage })[] = [];
  if (doctorRef) parts.push({ inlineData: doctorRef });
  if (practiceRef) parts.push({ inlineData: practiceRef });
  parts.push({ text: prompt });

  const maxAttempts = Math.max(1, Number(process.env.IMAGE_MAX_ATTEMPTS ?? 5));
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
        if (process.env.DEBUG_SAFETY) {
          const c = response.candidates?.[0] as unknown as Record<string, unknown> | undefined;
          console.error(`[${options.scene}] DEBUG safetyRatings:`, JSON.stringify(c?.safetyRatings ?? null));
          console.error(`[${options.scene}] DEBUG finishMessage:`, JSON.stringify(c?.finishMessage ?? null));
          console.error(`[${options.scene}] DEBUG promptFeedback:`, JSON.stringify((response as unknown as Record<string, unknown>).promptFeedback ?? null));
          const textParts = candidateParts.filter((p) => typeof p.text === "string").map((p) => p.text);
          if (textParts.length) console.error(`[${options.scene}] DEBUG text parts:`, JSON.stringify(textParts));
        }
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

      // Normalize to a 1024x1024 PNG so every scene is square regardless of what
      // the model returned (see TARGET_SIZE note above).
      const buf = await toSquareOutput(Buffer.from(imagePart.inlineData.data, "base64"));

      const dir = path.join(publicClinicsDir, slug);
      await fs.mkdir(dir, { recursive: true });
      const filename = `${options.scene}.png`;
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
