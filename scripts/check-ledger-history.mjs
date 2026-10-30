// Checks the run history against two independent sources: the raw archive and the
// verification ledger.
//
// First it compares the first archive write of every region and date with the
// ledger on probability, tier and sensitivity interval, without using the site.
// Then it compares the site's rows with those raw first writes, so a build that
// keeps the wrong write fails.
//
// Run it against a production server, because the site must be serving its own
// /ledger routes:
//
//   npm run build
//   npx next start --port 3100
//   npm run check:ledger                 checks http://localhost:3100
//   npm run check:ledger -- <site url>   checks another server
//
// Needs network access to the public API. Exits 1 on any disagreement.
const SITE = process.argv[2] ?? "http://localhost:3100";
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ceres.northflow.no";

async function json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

const ledger = new Map();
const withdrawn = new Set();
for (const status of ["pending", "awaiting", "graded", "voided"]) {
  const { predictions } = await json(`${API}/v1/validation/ledger?status=${status}&limit=1000`);
  for (const r of predictions) {
    ledger.set(`${r.region_id}|${r.reference_date}`, r);
    if (r.voided_at) withdrawn.add(`${r.region_id}|${r.reference_date}`);
  }
}

const { history } = await json(`${SITE}/ledger/tracker.json`);
const wrong = [];
let rawCompared = 0;
let siteCompared = 0;

const sameAsLedger = (s, l) =>
  s.p_ipc3plus_90d === l.p_ipc3plus &&
  s.alert_tier === l.alert_tier &&
  s.sensitivity_interval_low === l.si_low &&
  s.sensitivity_interval_high === l.si_high;

for (const [region, siteRows] of Object.entries(history)) {
  const raw = await json(`${API}/v1/archive/regions/${region}?limit=104`);
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
    for (const field of ["p_ipc3plus_90d", "alert_tier", "p_ipc4plus_90d", "composite_stress_score", "ipc_phase_forecast"]) {
      if (s[field] !== first[field]) wrong.push(`${region} ${s.run_date}: ${field} is ${s[field]}, first write has ${first[field]}`);
    }
  }
  for (const date of firstWrite.keys()) {
    if (!seen.has(date) && !withdrawn.has(`${region}|${date}`)) wrong.push(`${region} ${date}: missing from the site`);
  }
}

console.log(`${rawCompared} first writes compared with the ledger, ${siteCompared} site rows compared with first writes, ${wrong.length} disagree`);
for (const line of wrong.slice(0, 20)) console.log(line);
process.exit(wrong.length > 0 || rawCompared === 0 || siteCompared === 0 ? 1 : 0);
