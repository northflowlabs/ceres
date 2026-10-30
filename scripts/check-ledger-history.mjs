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

// Rows per read. An API that answers with a total also takes an offset; one without
// serves this many at most.
const LEDGER_MAX = 1000;

// ISO 3166-1 alpha-3. The CSVs carry these; the site's ids and URLs keep NIG for Niger.
const ISO3 = new Set(`ABW AFG AGO AIA ALA ALB AND ARE ARG ARM ASM ATA ATF ATG AUS AUT AZE BDI BEL BEN BES BFA BGD BGR BHR
BHS BIH BLM BLR BLZ BMU BOL BRA BRB BRN BTN BVT BWA CAF CAN CCK CHE CHL CHN CIV CMR COD COG COK COL COM CPV CRI CUB CUW
CXR CYM CYP CZE DEU DJI DMA DNK DOM DZA ECU EGY ERI ESH ESP EST ETH FIN FJI FLK FRA FRO FSM GAB GBR GEO GGY GHA GIB GIN
GLP GMB GNB GNQ GRC GRD GRL GTM GUF GUM GUY HKG HMD HND HRV HTI HUN IDN IMN IND IOT IRL IRN IRQ ISL ISR ITA JAM JEY JOR
JPN KAZ KEN KGZ KHM KIR KNA KOR KWT LAO LBN LBR LBY LCA LIE LKA LSO LTU LUX LVA MAC MAF MAR MCO MDA MDG MDV MEX MHL MKD
MLI MLT MMR MNE MNG MNP MOZ MRT MSR MTQ MUS MWI MYS MYT NAM NCL NER NFK NGA NIC NIU NLD NOR NPL NRU NZL OMN PAK PAN PCN
PER PHL PLW PNG POL PRI PRK PRT PRY PSE PYF QAT REU ROU RUS RWA SAU SDN SEN SGP SGS SHN SJM SLB SLE SLV SMR SOM SPM SRB
SSD STP SUR SVK SVN SWE SWZ SXM SYC SYR TCA TCD TGO THA TJK TKL TKM TLS TON TTO TUN TUR TUV TWN TZA UGA UKR UMI URY USA
UZB VAT VCT VEN VGB VIR VNM VUT WLF WSM YEM ZAF ZMB ZWE`.split(/\s+/));
const SITE_ID = { NER: "NIG" };
const siteId = (code) => SITE_ID[code] ?? code;

// An HXL hashtag: #tag, then +attributes that start with a letter. A parser drops
// a column whose tag breaks this rule.
const HXL_TAG = /^#[a-z][a-z0-9_]*(\+[a-z][a-z0-9_]*)*$/;

// Dates held by one record only. A change to either list fails the check, so a new
// gap has to be looked at before it is listed here.
const EXPECTED_LEDGER_ONLY = ["2026-08-17", "2026-08-24", "2026-08-31", "2026-09-07"];
const EXPECTED_ARCHIVE_ONLY = ["2026-07-20", "2026-07-27"];

async function json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

async function listRows(path, key) {
  const url = `${API}${path}${path.includes("?") ? "&" : "?"}limit=${LEDGER_MAX}`;
  const first = await json(url);
  const rows = [...first[key]];
  if (first.total == null) return { rows, cut: rows.length >= LEDGER_MAX };
  while (rows.length < first.total) {
    const page = await json(`${url}&offset=${rows.length}`);
    if (page[key].length === 0) return { rows, cut: true };
    rows.push(...page[key]);
  }
  return { rows, cut: false };
}

const ledger = new Map();
const gradedRows = [];
const withdrawn = new Set();
const limitHit = [];
for (const status of ["pending", "awaiting", "graded", "voided"]) {
  const { rows: predictions, cut } = await listRows(`/v1/validation/ledger?status=${status}`, "predictions");
  if (cut) limitHit.push(status);
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
const forecasts = await json(`${API}/v1/predictions`);
const regions = forecasts.map((p) => p.region_id);
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
const csvText = await csvRes.text();
const [csvTags, ...csvRows] = parseCsv(csvText);
const checkTags = (name, text, tags) => {
  for (const column of text.split("\n")[0].trim().split(",")) {
    if (!HXL_TAG.test(tags?.[column] ?? "")) wrong.push(`${name} ${column}: ${tags?.[column]} is not a valid HXL tag`);
  }
};
checkTags("archive.csv", csvText, csvTags);
const expected = new Map(Object.entries(history).flatMap(([id, rows]) => rows.map((s) => [`${id}|${s.run_date}`, s])));
const csvSeen = new Set();
for (const row of csvRows) {
  if (!ISO3.has(row.region_id)) wrong.push(`archive.csv: ${row.region_id} is not an ISO3 code`);
  const key = `${siteId(row.region_id)}|${row.run_date}`;
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

// The latest run as a download, HXL row second. Each row must be its region's
// newest published run, and where the ledger holds it the ledger's values stand.
const latestRes = await fetch(`${SITE}/ledger/latest.csv`);
if (!latestRes.ok) throw new Error(`/ledger/latest.csv answered ${latestRes.status}`);
const latestText = await latestRes.text();
const [hxl, ...latestRows] = parseCsv(latestText);
checkTags("latest.csv", latestText, hxl);
if (latestRows.length !== regions.length) wrong.push(`latest.csv: ${latestRows.length} rows for ${regions.length} regions`);
for (const row of latestRows) {
  const id = siteId(row.region_id);
  const key = `${id}|${row.run_date}`;
  if (!ISO3.has(row.region_id)) wrong.push(`latest.csv: ${row.region_id} is not an ISO3 code`);
  if (withdrawn.has(key)) wrong.push(`latest.csv ${key}: withdrawn run`);
  const newest = history[id]?.[0];
  if (row.run_date !== newest?.run_date) wrong.push(`latest.csv ${key}: newest published run is ${newest?.run_date}`);
  const issued = ledger.get(key);
  const want = issued
    ? { tier: issued.alert_tier, p: issued.p_ipc3plus, low: issued.si_low, high: issued.si_high }
    : { tier: newest?.alert_tier, p: newest?.p_ipc3plus_90d, low: newest?.sensitivity_interval_low, high: newest?.sensitivity_interval_high };
  const got = { tier: row.alert_tier, p: Number(row.p_ipc3plus_90d), low: Number(row.sensitivity_interval_low), high: Number(row.sensitivity_interval_high) };
  if (JSON.stringify(got) !== JSON.stringify(want)) wrong.push(`latest.csv ${key}: ${JSON.stringify(got)}, ${issued ? "the ledger" : "the history"} has ${JSON.stringify(want)}`);
}
for (const s of latest) {
  if (s.run_date !== history[s.region_id]?.[0]?.run_date) wrong.push(`latest ${s.region_id}: ${s.run_date} is not the newest published run`);
}

// The TIER-1 counts on the site, recounted from the raw ledger and, on its own,
// from the grades. Recall is Phase 4+ outcomes with a TIER-1 alert.
const inScore = gradedRows.filter((r) =>
  !r.voided_at && r.brier_contribution != null && r.grade_source && !["unresolvable", "disputed"].includes(r.grade_source));
const counts = (rows, tier, phase) => {
  const alerts = rows.filter((r) => tier(r) === "TIER-1");
  const events = rows.filter((r) => phase(r) >= 4);
  const eventRuns = events.map((r) => r.reference_date).sort();
  return {
    alerts: alerts.length,
    confirmed: alerts.filter((r) => phase(r) >= 3).length,
    phase4Events: events.length,
    phase4Alerted: events.filter((r) => tier(r) === "TIER-1").length,
    phase4Countries: new Set(events.map((r) => r.region_id)).size,
    phase4Runs: new Set(eventRuns).size,
    phase4FirstRun: eventRuns[0] ?? null,
    phase4LastRun: eventRuns[eventRuns.length - 1] ?? null,
  };
};
const fromLedger = counts(inScore, (r) => r.alert_tier, (r) => r.observed_phase);
const fromGrades = counts((await listRows("/v1/grades", "grades")).rows, (r) => r.predicted_tier, (r) => r.actual_ipc_phase);
const { tier1 } = await json(`${SITE}/ledger/figures.json`);
for (const [name, source] of [["ledger", fromLedger], ["grades", fromGrades]]) {
  if (JSON.stringify(tier1) !== JSON.stringify(source)) {
    wrong.push(`TIER-1 counts on the site are ${JSON.stringify(tier1)}, the ${name} has ${JSON.stringify(source)}`);
  }
}

// One hypothesis per forecast of the current run on the dashboard.
const dashboard = await json(`${SITE}/ledger/dashboard.json`);
const shown = new Map(dashboard.hypotheses.map((h) => [h.hypothesis_id, h]));
if (!dashboard.complete) wrong.push(`dashboard: ${dashboard.hypotheses.length} hypotheses of ${forecasts.length}`);
if (dashboard.hypotheses.length !== forecasts.length) wrong.push(`dashboard: ${dashboard.hypotheses.length} hypotheses for ${forecasts.length} forecasts`);
for (const p of forecasts) {
  const h = shown.get(p.hypothesis_id);
  if (h?.reference_date !== p.reference_date) wrong.push(`dashboard ${p.region_id}: no hypothesis of the run ${p.reference_date}`);
}

// Every evidence row in words, against the API's own values and note. A variable
// the site cannot word, or a verdict its own values contradict, is a disagreement.
const signedDeparture = (text) => {
  if (text === "Normal") return 0;
  const m = text?.match(/^(\d+)% (above|below) normal$/);
  return m ? Number(m[1]) * (m[2] === "above" ? 1 : -1) : NaN;
};
const EVIDENCE = {
  rainfall_fraction_of_normal: (v, text) => Math.abs(signedDeparture(text) - v * 100) <= 1,
  ndvi_anomaly_zscore: (v, text) => text === `z ${v.toFixed(2)}`,
  ipc_phase: (v, text) => text === `Phase ${v}`,
};
const NOT_SHOWN = new Set(["conflict_events_monthly"]);
let evidenceCompared = 0;
for (const p of forecasts) {
  const raw = await json(`${API}/v1/hypotheses/${p.hypothesis_id}`);
  const site = await json(`${SITE}/ledger/hypothesis/${p.hypothesis_id}.json`);
  const rows = raw.evidence ?? [];
  for (const e of rows) {
    if (!EVIDENCE[e.variable] && !NOT_SHOWN.has(e.variable)) wrong.push(`${p.region_id}: evidence variable ${e.variable} has no wording`);
  }
  const expected = rows.filter((e) => EVIDENCE[e.variable] && e.observed_value != null && e.threshold != null);
  if (expected.length !== (site.evidence ?? []).length) wrong.push(`${p.region_id}: ${site.evidence?.length} evidence rows, the API has ${expected.length} to show`);
  for (const e of expected) {
    const s = site.evidence?.find((x) => x.variable === e.variable);
    const label = `${p.region_id} ${e.variable}`;
    evidenceCompared += 1;
    if (!EVIDENCE[e.variable](e.observed_value, s?.observed)) wrong.push(`${label}: site says ${s?.observed}, observed ${e.observed_value}`);
    if (!EVIDENCE[e.variable](e.threshold, s?.threshold)) wrong.push(`${label}: site says threshold ${s?.threshold}, API has ${e.threshold}`);
    const noted = e.note?.match(/^Rainfall ([+-]\d+)%/);
    if (noted && signedDeparture(s?.observed) !== Number(noted[1])) wrong.push(`${label}: site says ${s?.observed}, the API's note says ${noted[1]}%`);
    const reached = e.direction === "below" ? e.observed_value <= e.threshold : e.observed_value >= e.threshold;
    const verdict = reached === e.supports_hypothesis ? e.supports_hypothesis : null;
    if (s?.supports !== verdict) wrong.push(`${label}: verdict is ${s?.supports}, its values give ${verdict}`);
  }
}
if (evidenceCompared === 0) wrong.push("no evidence rows compared");

// The rows behind the score, key by key in both directions.
const rowKey = (r) => `${r.region_id}|${r.reference_date}`;
const servedScore = await json(`${SITE}/ledger/graded.json`);
const servedKeys = servedScore.predictions.map(rowKey);
const scoreKeys = new Set(inScore.map(rowKey));
if (new Set(servedKeys).size !== servedKeys.length) wrong.push("graded.json: repeated rows");
if (!servedScore.complete) wrong.push(`graded.json: ${servedScore.count} of ${servedScore.total_in_score} rows`);
for (const key of servedKeys) if (!scoreKeys.has(key)) wrong.push(`graded.json ${key}: not in the ledger's score`);
for (const key of scoreKeys) if (!servedKeys.includes(key)) wrong.push(`graded.json ${key}: missing`);

// Fields the site must never serve, in any route or download.
const REMOVED = ["p_ipc4plus", "p_famine", "total_runs", "earliest_run", "total_snapshots"];
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

console.log(`${rawCompared} first writes compared with the ledger, ${siteCompared} site rows compared with first writes, ${csvRows.length} CSV rows compared, ${evidenceCompared} evidence rows compared, TIER-1 ${JSON.stringify(tier1)}, ${wrong.length} disagree`);
for (const line of wrong.slice(0, 20)) console.log(line);
process.exit(wrong.length > 0 || rawCompared === 0 || siteCompared === 0 || csvRows.length === 0 ? 1 : 0);
