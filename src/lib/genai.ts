import { GoogleGenAI } from "@google/genai";

/**
 * Build a GoogleGenAI client, honoring the GOOGLE_GENAI_USE_VERTEXAI toggle.
 *
 * - Vertex mode (GOOGLE_GENAI_USE_VERTEXAI="true"): authenticates via
 *   Application Default Credentials. Run once locally:
 *     gcloud auth application-default login \
 *       --client-id-file=<oauth-client>.json \
 *       --scopes=https://www.googleapis.com/auth/cloud-platform
 *   Requires GOOGLE_CLOUD_PROJECT (and optionally GOOGLE_CLOUD_LOCATION,
 *   default us-central1). No API key is used.
 * - Default mode: Gemini Developer API via GEMINI_API_KEY.
 *
 * Throws if the selected backend is missing its required configuration, so
 * callers can decide whether to skip or surface the error.
 */
export function createGenAI(): GoogleGenAI {
  if (process.env.GOOGLE_GENAI_USE_VERTEXAI === "true") {
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
    if (!project) {
      throw new Error(
        "GOOGLE_CLOUD_PROJECT is required when GOOGLE_GENAI_USE_VERTEXAI=true",
      );
    }
    return new GoogleGenAI({ vertexai: true, project, location });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is required (or set GOOGLE_GENAI_USE_VERTEXAI=true for Vertex AI)",
    );
  }
  return new GoogleGenAI({ apiKey });
}

/** True when the Vertex AI backend is selected. */
export function usingVertex(): boolean {
  return process.env.GOOGLE_GENAI_USE_VERTEXAI === "true";
}
