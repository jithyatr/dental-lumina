import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const EXPORT_OUT = path.join(REPO_ROOT, "out");

function runNextBuild(slug: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("npx", ["next", "build"], {
      cwd: REPO_ROOT,
      stdio: "inherit",
      env: { ...process.env, CLINIC_SLUG: slug },
    });
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`next build exited with code ${code}`));
    });
  });
}

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const s = path.join(src, entry.name);
      const d = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(s, d);
      } else if (entry.isSymbolicLink()) {
        const real = await fs.realpath(s);
        const stat = await fs.stat(real);
        if (stat.isDirectory()) await copyDir(real, d);
        else await fs.copyFile(real, d);
      } else {
        await fs.copyFile(s, d);
      }
    }),
  );
}

// Path rewriting deliberately omitted: Next's RSC payload (in *.txt) expects
// absolute "/_next/..." paths, so the bundle is meant to be hosted at site root.

export async function buildAndBundle(slug: string, distDir: string): Promise<string> {
  await runNextBuild(slug);

  const indexHtml = path.join(EXPORT_OUT, "index.html");
  try {
    await fs.access(indexHtml);
  } catch {
    throw new Error(`Build did not produce ${indexHtml}. Did the JSON config write correctly?`);
  }

  const bundleDir = path.join(distDir, slug);
  await fs.rm(bundleDir, { recursive: true, force: true });
  await fs.mkdir(bundleDir, { recursive: true });

  await copyDir(EXPORT_OUT, bundleDir);

  return bundleDir;
}
