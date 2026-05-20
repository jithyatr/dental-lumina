import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import type { ClinicConfig } from "../../src/types/clinic";

const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";

export type SceneKind = "hero" | "benefits" | "specialist";

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

  const sceneInstruction = scene === "hero"
    ? hasDoctorReference
      ? "Scene: a calm, modern dental office interior. The dentist is standing at a workstation reviewing a 3D dental scan on a screen, or arranging clean instruments on a tray. NO surgical or invasive activity. NO patient in the chair receiving treatment. Emphasis: confidence, modern technology, calm professionalism."
      : "Scene: a calm, modern dental office interior — NO people, NO dentist, NO patient, NO faces of any kind. Show ONLY the room and equipment: a clean treatment chair (empty), a workstation with a 3D dental scan glowing on the screen, a tray of clean instruments, soft cabinetry, and a window with diffused natural light. Emphasis: confidence, modern technology, calm professionalism conveyed entirely through the space itself."
    : scene === "benefits"
    ? hasDoctorReference
      ? "Scene: a warm consultation moment in a comfortable corner of the office. The dentist is holding a dental implant model (or a tablet showing implant graphics) and gesturing while speaking. A seated patient (visible only from the back or side, no face) is listening attentively. Emphasis: warm communication, reassurance, education."
      : "Scene: a close, warm consultation still life — NO faces, NO heads, NO full people. Show ONLY gloved hands (sterile light-blue or white nitrile gloves) holding a dental implant model OR a tablet displaying clean implant graphics, resting on a soft consultation table. Optionally include a second pair of patient hands (resting calmly, no face, no body) on the other side of the table to suggest dialogue. Soft natural light, warm office background blurred behind. Emphasis: education, reassurance, communication conveyed through hands and objects only."
    : "A professional LinkedIn-style corporate headshot of the dentist alone. Vertical 4:5 aspect ratio, framed tight from upper chest to top of head — face fills the upper third of the frame. Subject is centered, looking directly at the camera with a warm, confident, slightly-smiling expression. Even, soft studio lighting (no harsh shadows). Wearing a crisp clean white dental coat over scrubs (mask off, no gloves, no stethoscope). Sharp focus, professional photography, polished but approachable. ABSOLUTE BACKGROUND RULE: the background MUST be a single solid flat color — choose either soft sage green (#9CAF9F) OR warm cream (#E8DDD0) OR neutral gray (#D8D8D8). The background is one uniform color from edge to edge with NO objects, NO furniture, NO walls, NO chairs, NO computers, NO dental equipment, NO doors, NO shelves, NO posters, NO windows, NO architectural detail, NO depth, NO blur of a scene. Treat the background like a photography studio backdrop — flat, plain, empty. Only the dentist appears in the image; nothing else.";

  const noTextRule = scene === "specialist"
    ? "ABSOLUTE RULE: The output image must contain ZERO text, ZERO captions, ZERO labels, ZERO badges, ZERO words, ZERO numbers, ZERO logos, ZERO embroidery on clothing, ZERO signs on walls. No typography of any kind anywhere. The clinic coat must be plain — no embroidered name, no badge. Walls must have no posters or signs with text. The image is purely photographic with no graphic design overlays."
    : hasDoctorReference
    ? "Strict requirements: NO visible patient faces (patient may be shown from the side, back, or as hands only); NO text, logos, or watermarks; NO blood, open mouths with teeth visible up close, or graphic medical detail."
    : "ABSOLUTE RULE: NO human faces of any kind in the image — no dentist face, no patient face, no staff face, no faces in the background, no reflections of faces in screens or mirrors. If a person appears at all they must be shown as gloved hands only (no arms above the wrist, no head, no torso). Prefer no people whatsoever. Also: NO text, NO logos, NO watermarks, NO blood, NO graphic medical detail.";

  const isSpecialist = scene === "specialist";
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
    isSpecialist ? "" : "Composition: wide horizontal framing (16:9), uncluttered.",
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
