// Checks that the site's run history agrees with the verification ledger for
// every region and date that both hold.
//
//   npm run check:ledger                 checks http://localhost:3100
//   npm run check:ledger -- <site url>   checks another build
//
// Needs network access to the public API and a running site. Exits 1 on any
// disagreement.
const SITE = process.argv[2] ?? "http://localhost:3100";
const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.ceres.northflow.no";

async function json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} answered ${res.status}`);
  return res.json();
}

const ledger = new Map();
for (const status of ["pending", "awaiting", "graded", "voided"]) {
  const { predictions } = await json(`${API}/v1/validation/ledger?status=${status}&limit=1000`);
  for (const r of predictions) ledger.set(`${r.region_id}|${r.reference_date}`, r);
}

const { history } = await json(`${SITE}/ledger/tracker.json`);

let compared = 0;
const wrong = [];
for (const [region, rows] of Object.entries(history)) {
  const dates = new Set();
  for (const s of rows) {
    if (dates.has(s.run_date)) wrong.push(`${region} ${s.run_date}: repeated run date`);
    dates.add(s.run_date);
    const l = ledger.get(`${region}|${s.run_date}`);
    if (!l) continue;
    compared += 1;
    if (s.p_ipc3plus_90d !== l.p_ipc3plus || s.alert_tier !== l.alert_tier) {
      wrong.push(`${region} ${s.run_date}: history ${s.p_ipc3plus_90d} ${s.alert_tier}, ledger ${l.p_ipc3plus} ${l.alert_tier}`);
    }
  }
}

console.log(`${compared} overlapping region dates compared, ${wrong.length} disagree`);
for (const line of wrong) console.log(line);
process.exit(wrong.length > 0 || compared === 0 ? 1 : 0);
