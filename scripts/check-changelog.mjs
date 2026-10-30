// The changelog is append-only. Every entry on the published branch must stay in
// src/app/changelog/page.tsx exactly as it was published, and the page must keep
// its statements about the log. New entries are free to be added.
//
//   npm run check:changelog              compares with origin/main
//   npm run check:changelog -- <ref>     compares with another ref
//
// Runs on its own and as the first step of check:ledger. Exits 1 on any change.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const FILE = "src/app/changelog/page.tsx";
const REF = process.argv[2] ?? "origin/main";

const STATEMENTS = [
  "CERES does not make undisclosed changes",
  "Retrospective edits to this log are not permitted",
  "Changes are never made retroactively",
];

// The entries as text. A trailing comma on a line is not part of an entry.
function entries(source) {
  const text = source.split("\r\n").join("\n");
  const list = text.slice(text.indexOf("const CHANGELOG"), text.indexOf("\n];", text.indexOf("const CHANGELOG")));
  return list
    .split(/\n  \},?\n?/)
    .map((block) => block.slice(block.indexOf("date:")).replace(/,$/gm, "").trim())
    .filter((block) => block.startsWith("date:"));
}

const published = entries(execFileSync("git", ["show", `${REF}:${FILE}`], { encoding: "utf8", maxBuffer: 1e7 }));
const source = readFileSync(FILE, "utf8");
const current = new Set(entries(source));

const wrong = published.filter((entry) => !current.has(entry)).map((entry) => `changed or removed: ${entry.split("\n")[3]?.trim() ?? entry}`);
for (const statement of STATEMENTS) {
  if (!source.includes(statement)) wrong.push(`statement removed: ${statement}`);
}

console.log(`${published.length} entries on ${REF} compared, ${current.size} in the log, ${wrong.length} changed`);
for (const line of wrong) console.log(line);
process.exit(wrong.length > 0 || published.length === 0 ? 1 : 0);
