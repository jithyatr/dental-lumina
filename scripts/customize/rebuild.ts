import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAndBundle } from "./build";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const CLINICS_DATA_DIR = path.join(REPO_ROOT, "data", "clinics");
const DEFAULT_DIST_DIR = path.join(REPO_ROOT, "dist", "clinics");

interface Args {
  slug: string;
  out: string;
}

function parseArgs(argv: string[]): Args {
  const positional: string[] = [];
  let slug: string | undefined;
  let out = DEFAULT_DIST_DIR;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--slug") slug = argv[++i];
    else if (a === "--out") out = path.resolve(argv[++i]);
    else if (a.startsWith("--")) throw new Error(`Unknown flag: ${a}`);
    else positional.push(a);
  }
  if (!slug && positional.length === 1) slug = positional[0];
  if (!slug || positional.length > 1) {
    throw new Error("Usage: npm run rebuild-site -- <slug> [--out <dir>]");
  }
  return { slug, out };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const configPath = path.join(CLINICS_DATA_DIR, `${args.slug}.json`);
  try {
    await fs.access(configPath);
  } catch {
    console.error(
      `No config at ${path.relative(REPO_ROOT, configPath)}. Run \`yarn customize\` first to create it.`
    );
    process.exit(1);
  }
  console.log(`[1/2] Using ${path.relative(REPO_ROOT, configPath)}`);

  console.log("[2/2] Running next build + bundling");
  const bundleDir = await buildAndBundle(args.slug, args.out);
  console.log(`\nDone. Bundle: ${path.relative(REPO_ROOT, bundleDir)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
