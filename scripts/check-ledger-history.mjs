// Checks the run history and /ledger/archive.csv against two independent sources,
// the raw archive and the verification ledger, in both directions.
//
// First it compares the first archive write of every region and date with the
// ledger on probability, tier and sensitivity interval, without using the site.
// Then it compares the site's rows with those raw first writes, so a build that
// keeps the wrong write, or loses a region, fails. Last it reads the CSV and
// requires the same rows as the history.
//
// Run it against a production server, because the site must be serving its own
// /ledger routes:
//
//   npm run build
//   npx next start --port 3100
//   npm run check:ledger                 checks http://localhost:3100
//   npm run check:ledger -- <site url>   checks another server
//
// Needs network access to the public API and a running server, so it stays out of
// CI. Exits 1 on any disagreement.
const SITE = process.argv[2] ?? "http://localhost:3100";
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ceres.northflow.no";

// The API serves at most this many rows and has no offset.
const LEDGER_MAX = 1000;

// Dates held by one record only. A change to either list fails the check, so a new
// gap has to be looked at before it is listed here.
const EXPECTED_LEDGER_ONLY = ["2026-08-17", "2026-08-24", "2026-08-31", "2026-09-07"];
const EXPECTED_ARCHIVE_ONLY = ["2026-07-20", "2026-07-27"];

async function json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

const ledger = new Map();
const gradedRows = [];
const withdrawn = new Set();
const limitHit = [];
for (const status of ["pending", "awaiting", "graded", "voided"]) {
  const { predictions } = await json(`${API}/v1/validation/ledger?status=${status}&limit=${LEDGER_MAX}`);
  if (predictions.length >= LEDGER_MAX) limitHit.push(status);
  if (status === "graded") gradedRows.push(...predictions);
  for (const r of predictions) {
    ledger.set(`${r.region_id}|${r.reference_date}`, r);
    if (r.voided_at) withdrawn.add(`${r.region_id}|${r.reference_date}`);
  }
}

const { history, latest } = await json(`${SITE}/ledger/tracker.json`);
const wrong = limitHit.map((status) => `ledger ${status}: reached the ${LEDGER_MAX} row limit, rows may be cut`);
const archiveKeys = new Set();

// Every region the API forecasts must be in the history and the latest run.
const regions = (await json(`${API}/v1/predictions`)).map((p) => p.region_id);
for (const id of regions) {
  if (!history[id]) wrong.push(`${id}: missing from the history`);
  if (!latest.some((s) => s.region_id === id)) wrong.push(`${id}: missing from the latest run`);
}

// Quoted CSV fields, one row per line.
function parseCsv(text) {
  const rows = text.trim().split("\n").map((line) => {
    const cells = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const c = line[i];
      if (c === '"' && quoted && line[i + 1] === '"') { cell += '"'; i += 1; }
      else if (c === '"') quoted = !quoted;
      else if (c === "," && !quoted) { cells.push(cell); cell = ""; }
      else cell += c;
    }
    cells.push(cell);
    return cells;
  });
  const [head, ...body] = rows;
  return body.map((cells) => Object.fromEntries(head.map((h, i) => [h, cells[i]])));
}
let rawCompared = 0;
let siteCompared = 0;

const sameAsLedger = (s, l) =>
  s.p_ipc3plus_90d === l.p_ipc3plus &&
  s.alert_tier === l.alert_tier &&
  s.sensitivity_interval_low === l.si_low &&
  s.sensitivity_interval_high === l.si_high;

for (const [region, siteRows] of Object.entries(history)) {
  const raw = await json(`${API}/v1/archive/regions/${region}?limit=104`);
  for (const r of raw) archiveKeys.add(`${region}|${r.run_date}`);
  const firstWrite = new Map();
  for (const r of [...raw].sort((a, b) => (a.archived_at ?? "").localeCompare(b.archived_at ?? ""))) {
    if (!firstWrite.has(r.run_date)) firstWrite.set(r.run_date, r);
  }

  for (const [date, first] of firstWrite) {
    const issued = ledger.get(`${region}|${date}`);
    if (!issued) continue;
    rawCompared += 1;
    if (!sameAsLedger(first, issued)) wrong.push(`${region} ${date}: first archive write differs from the ledger`);
  }

  const seen = new Set();
  for (const s of siteRows) {
    const key = `${region}|${s.run_date}`;
    if (seen.has(s.run_date)) wrong.push(`${region} ${s.run_date}: repeated run date`);
    seen.add(s.run_date);
    if (withdrawn.has(key)) wrong.push(`${region} ${s.run_date}: withdrawn run in the history`);
    const first = firstWrite.get(s.run_date);
    if (!first) {
      wrong.push(`${region} ${s.run_date}: not in the archive`);
      continue;
    }
    siteCompared += 1;
    for (const field of [
      "p_ipc3plus_90d", "alert_tier", "composite_stress_score", "ipc_phase_forecast",
      "sensitivity_interval_low", "sensitivity_interval_high",
    ]) {
      if (s[field] !== first[field]) wrong.push(`${region} ${s.run_date}: ${field} is ${s[field]}, first write has ${first[field]}`);
    }
  }
  for (const date of firstWrite.keys()) {
    if (!seen.has(date) && !withdrawn.has(`${region}|${date}`)) wrong.push(`${region} ${date}: missing from the site`);
  }
}

// Both directions: every ledger row in the archive and every archive row in the
// ledger, apart from the dates named above.
const dateOf = (key) => key.split("|")[1];
const unmatched = (keys, other) => [...new Set([...keys].filter((k) => !other.has(k)).map(dateOf))].sort();
const sameDates = (a, b) => a.join() === [...b].sort().join();

const ledgerOnly = unmatched(ledger.keys(), archiveKeys);
const archiveOnly = unmatched(archiveKeys, ledger);
if (!sameDates(ledgerOnly, EXPECTED_LEDGER_ONLY)) wrong.push(`ledger-only dates are ${ledgerOnly.join(" ")}, expected ${EXPECTED_LEDGER_ONLY.join(" ")}`);
if (!sameDates(archiveOnly, EXPECTED_ARCHIVE_ONLY)) wrong.push(`archive-only dates are ${archiveOnly.join(" ")}, expected ${EXPECTED_ARCHIVE_ONLY.join(" ")}`);

// The download must hold exactly the history's rows.
const csvRes = await fetch(`${SITE}/ledger/archive.csv`);
if (!csvRes.ok) throw new Error(`/ledger/archive.csv answered ${csvRes.status}`);
const csvRows = parseCsv(await csvRes.text());
const expected = new Map(Object.entries(history).flatMap(([id, rows]) => rows.map((s) => [`${id}|${s.run_date}`, s])));
const csvSeen = new Set();
for (const row of csvRows) {
  const key = `${row.region_id}|${row.run_date}`;
  if (csvSeen.has(key)) wrong.push(`archive.csv ${key}: repeated`);
  csvSeen.add(key);
  const s = expected.get(key);
  if (!s) {
    wrong.push(`archive.csv ${key}: not in the history`);
    continue;
  }
  for (const field of ["p_ipc3plus_90d", "sensitivity_interval_low", "sensitivity_interval_high", "composite_stress_score"]) {
    if (Number(row[field]) !== s[field]) wrong.push(`archive.csv ${key}: ${field} is ${row[field]}, history has ${s[field]}`);
  }
  if (row.alert_tier !== s.alert_tier) wrong.push(`archive.csv ${key}: tier is ${row.alert_tier}, history has ${s.alert_tier}`);
}
for (const key of expected.keys()) {
  if (!csvSeen.has(key)) wrong.push(`archive.csv ${key}: missing`);
}

// The latest run as a download: same rows as the history's latest, HXL row second.
const latestRes = await fetch(`${SITE}/ledger/latest.csv`);
if (!latestRes.ok) throw new Error(`/ledger/latest.csv answered ${latestRes.status}`);
const latestText = await latestRes.text();
const [hxl, ...latestRows] = parseCsv(latestText);
if (!hxl?.region_id?.startsWith("#")) wrong.push("latest.csv: second row is not the HXL hashtags");
if (latestRows.length !== latest.length) wrong.push(`latest.csv: ${latestRows.length} rows, the latest run has ${latest.length}`);
for (const row of latestRows) {
  const s = latest.find((x) => x.region_id === row.region_id);
  if (Number(row.p_ipc3plus_90d) !== s?.p_ipc3plus_90d) wrong.push(`latest.csv ${row.region_id}: differs from the latest run`);
}

// The TIER-1 counts on the site, recounted from the raw ledger and, on its own,
// from the grades. Recall is Phase 4+ outcomes with a TIER-1 alert.
const inScore = gradedRows.filter((r) =>
  !r.voided_at && r.brier_contribution != null && r.grade_source && !["unresolvable", "disputed"].includes(r.grade_source));
const counts = (rows, tier, phase) => {
  const alerts = rows.filter((r) => tier(r) === "TIER-1");
  const events = rows.filter((r) => phase(r) >= 4);
  return {
    alerts: alerts.length,
    confirmed: alerts.filter((r) => phase(r) >= 3).length,
    phase4Events: events.length,
    phase4Alerted: events.filter((r) => tier(r) === "TIER-1").length,
  };
};
const fromLedger = counts(inScore, (r) => r.alert_tier, (r) => r.observed_phase);
const fromGrades = counts((await json(`${API}/v1/grades`)).grades, (r) => r.predicted_tier, (r) => r.actual_ipc_phase);
const { tier1 } = await json(`${SITE}/ledger/figures.json`);
for (const [name, source] of [["ledger", fromLedger], ["grades", fromGrades]]) {
  if (JSON.stringify(tier1) !== JSON.stringify(source)) {
    wrong.push(`TIER-1 counts on the site are ${JSON.stringify(tier1)}, the ${name} has ${JSON.stringify(source)}`);
  }
}

// Fields the site must never serve, in any route or download.
const REMOVED = ["p_ipc4plus", "p_famine"];
const routes = [
  "dashboard.json", "figures.json", "graded.json", "impact.json", "latest.json", "map.json", "metrics.json",
  "regions.json", "tracker.json", "validation.json", "withdrawn.json", "archive.csv", "latest.csv", `region/${regions[0]}.json`,
];
for (const route of routes) {
  const res = await fetch(`${SITE}/ledger/${route}`);
  if (!res.ok) { wrong.push(`/ledger/${route} answered ${res.status}`); continue; }
  const body = await res.text();
  for (const field of REMOVED) if (body.includes(field)) wrong.push(`/ledger/${route} carries ${field}`);
}

console.log(`${rawCompared} first writes compared with the ledger, ${siteCompared} site rows compared with first writes, ${csvRows.length} CSV rows compared, TIER-1 ${JSON.stringify(tier1)}, ${wrong.length} disagree`);
for (const line of wrong.slice(0, 20)) console.log(line);
process.exit(wrong.length > 0 || rawCompared === 0 || siteCompared === 0 || csvRows.length === 0 ? 1 : 0);
