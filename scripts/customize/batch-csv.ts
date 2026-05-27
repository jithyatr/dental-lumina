import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runCustomize } from "./index";
import { procedureFromSelected, procedureFromDentistType, type Procedure } from "./procedures";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const CLINICS_DATA_DIR = path.join(REPO_ROOT, "data", "clinics");
const DEFAULT_LOG_PATH = path.join(REPO_ROOT, "data", "batch-log.json");

interface CliArgs {
  csv: string;
  limit?: number;
  start: number;
  skipExisting: boolean;
  force: boolean;
  only?: string;
  concurrency: number;
  generateHero: boolean;
  logPath: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  let csv: string | undefined;
  let limit: number | undefined;
  let start = 0;
  let skipExisting = false;
  let force = false;
  let only: string | undefined;
  let concurrency = 1;
  let generateHero = process.env.GENERATE_HERO_IMAGE === "1";
  let logPath = DEFAULT_LOG_PATH;
  let dryRun = false;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--csv") csv = argv[++i];
    else if (a === "--limit") limit = Number(argv[++i]);
    else if (a === "--start") start = Number(argv[++i]);
    else if (a === "--skip-existing") skipExisting = true;
    else if (a === "--force") force = true;
    else if (a === "--only") only = argv[++i];
    else if (a === "--concurrency") concurrency = Math.max(1, Number(argv[++i]));
    else if (a === "--generate-hero") generateHero = true;
    else if (a === "--log") logPath = path.resolve(argv[++i]);
    else if (a === "--dry-run") dryRun = true;
    else throw new Error(`Unknown flag: ${a}`);
  }
  if (!csv) {
    throw new Error(
      "Usage: npm run customize-csv -- --csv <path> [--limit N] [--start N] [--skip-existing] [--force] [--only <domain>] [--concurrency N] [--generate-hero] [--log <path>] [--dry-run]",
    );
  }
  if (force && skipExisting) {
    throw new Error("--force and --skip-existing are mutually exclusive.");
  }
  return { csv, limit, start, skipExisting, force, only, concurrency, generateHero, logPath, dryRun };
}

// Minimal CSV parser that handles quoted fields and embedded commas.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      cell += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
      continue;
    }
    cell += ch;
    i++;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

interface CsvRow {
  website: string;
  dentistType?: string;
  selectedProcedure?: string;
  practiceName?: string;
}

function readCsv(filePath: string): Promise<CsvRow[]> {
  return fs.readFile(filePath, "utf-8").then((text) => {
    const rows = parseCsv(text).filter((r) => r.some((c) => c.trim().length > 0));
    if (rows.length === 0) return [];
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const idx = {
      website: header.indexOf("website"),
      dentistType: header.findIndex((h) => h.startsWith("dentist type")),
      selectedProcedure: header.findIndex((h) => h.startsWith("selected procedure")),
      practiceName: header.findIndex((h) => h.startsWith("practice name")),
    };
    if (idx.website < 0) throw new Error(`CSV is missing a "website" column.`);
    return rows.slice(1).map((cols) => ({
      website: (cols[idx.website] ?? "").trim(),
      dentistType: idx.dentistType >= 0 ? (cols[idx.dentistType] ?? "").trim() : undefined,
      selectedProcedure: idx.selectedProcedure >= 0 ? (cols[idx.selectedProcedure] ?? "").trim() : undefined,
      practiceName: idx.practiceName >= 0 ? (cols[idx.practiceName] ?? "").trim() : undefined,
    }));
  });
}

function normalizeWebsite(website: string): string {
  let w = website.trim();
  if (!w) return w;
  if (!/^https?:\/\//i.test(w)) w = `https://${w}`;
  return w;
}

function websiteToSlug(website: string): string {
  return website
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveProcedure(row: CsvRow): Procedure | null {
  return (
    procedureFromSelected(row.selectedProcedure) ?? procedureFromDentistType(row.dentistType)
  );
}

interface LogEntry {
  website: string;
  slug: string;
  procedure: string | null;
  status: "ok" | "skipped" | "error";
  error?: string;
  timestamp: string;
}

interface BatchLog {
  startedAt: string;
  finishedAt?: string;
  csv: string;
  total: number;
  entries: LogEntry[];
}

async function loadLog(logPath: string): Promise<Map<string, LogEntry>> {
  try {
    const raw = await fs.readFile(logPath, "utf-8");
    const parsed = JSON.parse(raw) as BatchLog;
    return new Map(parsed.entries.map((e) => [e.slug, e]));
  } catch {
    return new Map();
  }
}

async function writeLog(logPath: string, log: BatchLog): Promise<void> {
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  const tmp = `${logPath}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(log, null, 2));
  await fs.rename(tmp, logPath);
}

async function processRow(
  row: CsvRow,
  args: CliArgs,
  existingLog: Map<string, LogEntry>,
): Promise<LogEntry> {
  const url = normalizeWebsite(row.website);
  const slug = websiteToSlug(row.website);
  const procedure = resolveProcedure(row);
  const baseEntry: Pick<LogEntry, "website" | "slug" | "procedure" | "timestamp"> = {
    website: row.website,
    slug,
    procedure: procedure?.key ?? null,
    timestamp: new Date().toISOString(),
  };

  if (!url || !slug) {
    return { ...baseEntry, status: "error", error: "empty website cell" };
  }
  if (!procedure) {
    return {
      ...baseEntry,
      status: "error",
      error: `no procedure mapping for dentistType="${row.dentistType ?? ""}" selectedProcedure="${row.selectedProcedure ?? ""}"`,
    };
  }

  const configPath = path.join(CLINICS_DATA_DIR, `${slug}.json`);
  if (args.skipExisting && existsSync(configPath)) {
    return { ...baseEntry, status: "skipped", error: "config already exists" };
  }
  const prior = existingLog.get(slug);
  if (args.skipExisting && prior?.status === "ok") {
    return { ...baseEntry, status: "skipped", error: "already ok in batch log" };
  }
  if (args.force && existsSync(configPath)) {
    console.log(`      --force enabled → regenerating existing ${path.relative(REPO_ROOT, configPath)}`);
  }

  if (args.dryRun) {
    console.log(`[dry-run] would customize ${url} (slug=${slug}, procedure=${procedure.key})`);
    return { ...baseEntry, status: "skipped", error: "dry-run" };
  }

  try {
    await runCustomize({
      url,
      slug,
      procedure,
      template: procedure.template,
      generateHero: args.generateHero,
    });
    return { ...baseEntry, status: "ok", timestamp: new Date().toISOString() };
  } catch (err) {
    return {
      ...baseEntry,
      status: "error",
      error: (err as Error).message,
      timestamp: new Date().toISOString(),
    };
  }
}

async function runBatch(args: CliArgs): Promise<void> {
  const csvPath = path.resolve(args.csv);
  const allRows = await readCsv(csvPath);
  let rows = allRows.slice(args.start);
  if (args.only) {
    const needle = args.only.toLowerCase();
    rows = rows.filter((r) => r.website.toLowerCase().includes(needle));
  }
  if (args.limit !== undefined) rows = rows.slice(0, args.limit);

  console.log(
    `Loaded ${allRows.length} rows from ${path.relative(REPO_ROOT, csvPath)} — processing ${rows.length} ` +
      `(start=${args.start}, limit=${args.limit ?? "∞"}, only=${args.only ?? "(none)"}, concurrency=${args.concurrency}, ` +
      `skipExisting=${args.skipExisting}, force=${args.force}, generateHero=${args.generateHero}, dryRun=${args.dryRun})`,
  );

  const existingLog = await loadLog(args.logPath);
  const log: BatchLog = {
    startedAt: new Date().toISOString(),
    csv: csvPath,
    total: rows.length,
    entries: [],
  };

  let counters = { ok: 0, skipped: 0, error: 0 };
  let processed = 0;

  const worker = async (id: number, queue: CsvRow[]) => {
    while (queue.length > 0) {
      const row = queue.shift();
      if (!row) break;
      processed++;
      const tag = `[${processed}/${rows.length} w${id}]`;
      console.log(`\n${tag} ${row.website} — dentistType="${row.dentistType ?? ""}" selectedProcedure="${row.selectedProcedure ?? ""}"`);
      const entry = await processRow(row, args, existingLog);
      log.entries.push(entry);
      counters[entry.status]++;
      const summary = entry.status === "ok"
        ? `→ ${entry.status}`
        : `→ ${entry.status}${entry.error ? ` (${entry.error})` : ""}`;
      console.log(`${tag} ${summary}`);
      await writeLog(args.logPath, log);
    }
  };

  const queue = [...rows];
  const workers = Array.from({ length: Math.min(args.concurrency, rows.length || 1) }, (_, i) => worker(i + 1, queue));
  await Promise.all(workers);

  log.finishedAt = new Date().toISOString();
  await writeLog(args.logPath, log);
  console.log(
    `\nDone. ok=${counters.ok} skipped=${counters.skipped} error=${counters.error} total=${rows.length}. Log: ${path.relative(REPO_ROOT, args.logPath)}`,
  );
}

const args = parseArgs(process.argv.slice(2));
runBatch(args).catch((err) => {
  console.error(err);
  process.exit(1);
});
