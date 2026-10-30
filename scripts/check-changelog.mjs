// The changelog is append-only. scripts/changelog-published.json pins a hash of every
// published entry, oldest entry last. The entry hashes are what is pinned: nothing is
// resolved from git, so a force push cannot move the baseline. Each hash covers the
// whole entry block. Pinned entries must stay at the end of the log, word for word and
// in order, with new entries above them, and the page must keep its statements about
// the log. Comments in the source count for nothing.
//
//   npm run check:changelog              compares with the baseline file
//   npm run check:changelog -- <ref>     also compares with a git ref
//   node scripts/check-changelog.mjs --hashes   prints a baseline for the current log
//
// Runs on its own, in CI, and as the first step of check:ledger. Exits 1 on any change.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const FILE = "src/app/changelog/page.tsx";
const BASELINE = "scripts/changelog-published.json";

const STATEMENTS = [
  "Every model update, methodology change, data source addition, and platform release, documented publicly in chronological order. CERES does not make undisclosed changes to its prediction system.",
  "All model changes are documented before deployment. Retrospective edits to this log are not permitted.",
  "CERES documents every change to the prediction system, model coefficients, data sources, and methodology in this public log before or at the time of deployment. Changes are never made retroactively to improve the appearance of historical accuracy.",
];

function fail(message) {
  console.log(message);
  process.exit(1);
}

// Whole-line and block comments, and JSX comments. A string holding // stays.
const withoutComments = (source) =>
  source
    .split("\r\n").join("\n")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

// The entries in order, each as its whole block from { to }.
function entries(source) {
  const text = withoutComments(source);
  const start = text.indexOf("const CHANGELOG");
  const end = text.indexOf("\n];", start);
  if (start < 0 || end < 0) fail(`${FILE}: no CHANGELOG list found`);
  const list = `${text.slice(start, end)}\n`;
  return (list.match(/^  \{\n[\s\S]*?\n  \}/gm) ?? []);
}

const hash = (entry) => createHash("sha256").update(entry).digest("hex");
const title = (entry) => entry.match(/^\s*title: "(.*)",?$/m)?.[1] ?? entry.slice(0, 60);

function atRef(ref) {
  try {
    return execFileSync("git", ["show", `${ref}:${FILE}`], { encoding: "utf8", maxBuffer: 1e7, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return fail(`${ref} is not available here. Fetch it, or run without a ref to use ${BASELINE}.`);
  }
}

if (process.argv[2] === "--hashes") {
  const list = entries(readFileSync(FILE, "utf8")).map((e) => ({ title: title(e), sha256: hash(e) }));
  console.log(JSON.stringify({ commit: "published", entries: list }, null, 2));
  process.exit(0);
}

let baseline;
try {
  baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
} catch {
  fail(`${BASELINE} is missing or unreadable.`);
}
const published = baseline.entries;
const source = readFileSync(FILE, "utf8");
const current = entries(source);
const currentHashes = current.map(hash);
const wrong = [];

// Published entries end the log, in their published order.
const tail = currentHashes.slice(-published.length);
published.forEach((entry, i) => {
  if (tail[i] === entry.sha256) return;
  const moved = currentHashes.includes(entry.sha256);
  wrong.push(`${moved ? "moved" : "changed or removed"}: ${entry.title}`);
});

const page = withoutComments(source);
for (const statement of STATEMENTS) {
  if (!page.includes(statement)) wrong.push(`statement changed: ${statement.slice(0, 70)}`);
}

const ref = process.argv[2];
if (ref) {
  const hashes = new Set(currentHashes);
  for (const entry of entries(atRef(ref))) {
    if (!hashes.has(hash(entry))) wrong.push(`differs from ${ref}: ${title(entry)}`);
  }
}

console.log(`${published.length} pinned entries compared, ${current.length} in the log, ${wrong.length} changed`);
for (const line of wrong) console.log(line);
process.exit(wrong.length > 0 || published.length === 0 ? 1 : 0);
