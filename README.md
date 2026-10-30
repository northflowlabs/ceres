<a href="https://northflow.no"><img src=".github/assets/northflow-mark.svg" alt="Northflow" width="40" height="40"></a>

# CERES

The public website and dashboard of CERES, Northflow's weekly forecasts of acute food insecurity in 43 countries.

[Website](https://ceres.northflow.no) · [Research page](https://research.northflow.no/systems/ceres) · [API docs](https://api.ceres.northflow.no/docs) · [Preprint](https://arxiv.org/abs/2603.09425) · [Licence](#licence)

[![Licence: Apache 2.0](https://img.shields.io/badge/licence-Apache%202.0-0e6b63)](LICENSE)

## What this repository is

This repository holds the Next.js application behind [ceres.northflow.no](https://ceres.northflow.no). It reads the forecasts from the public CERES API at [api.ceres.northflow.no](https://api.ceres.northflow.no/docs) and shows them as maps, regional pages, sub-national breakdowns and a public validation ledger.

CERES (Calibrated Early-warning and Risk Estimation System) issues 90-day probability forecasts of IPC Phase 3+, Phase 4+ and Famine conditions for 43 countries, every Monday. Northflow Technologies AS develops and runs the forecasting engine. This repository contains the website only.

## Pages

| Page | Path | Shows |
|------|------|-------|
| Dashboard | `/` | Tier distribution, global map, driver hypotheses |
| Regions | `/regions` | All 43 countries with their probability scores |
| Region detail | `/regions/{iso3}` | Hypothesis chain, drivers, Admin1 and Admin2 detail |
| Map | `/map` | Global risk map with Admin1 and Admin2 layers |
| Sub-national | `/subnational` | Admin1 stress across the countries covered |
| Validation | `/validation` | The public prediction ledger: pending, awaiting data, graded |
| Track record | `/tracker` | Weekly snapshots per region and verified outcomes |
| Impact | `/impact` | The operational record, read live from the archive and the ledger |
| Changelog | `/changelog` | Model, data, methodology and platform changes |
| Methodology | `/methodology` | Technical documentation of the method |
| Data sources | `/data` | The model inputs and the grading source |
| About | `/about` | System overview |

## Data sources

The forecasts draw on public data:

- Rainfall from NASA POWER
- Vegetation (NDVI) from MODIS
- Conflict events and fatalities from UCDP GED
- IPC and Cadre Harmonisé phase classifications, through OCHA's HDX HAPI
- WFP market food prices, through OCHA's HDX HAPI

Each forecast is graded at 90 days against the observed phase published by the IPC or FEWS NET. CERES does not declare famine: only the IPC declares Famine (IPC Phase 5).

## Using the forecasts

The forecasts on the site and from the public API are published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribute them to "CERES / Northflow Technologies AS, ceres.northflow.no". Downloads need no account or key:

- Current forecasts (JSON): https://api.ceres.northflow.no/v1/predictions
- Current forecasts (CSV): https://api.ceres.northflow.no/v1/export/predictions/csv
- Weekly archive (CSV): https://api.ceres.northflow.no/v1/export/archive/csv

## Run it locally

```bash
git clone https://github.com/northflowlabs/ceres
cd ceres
npm install
NEXT_PUBLIC_API_URL=https://api.ceres.northflow.no npm run dev
```

The site then runs at http://localhost:3100 and reads the public API. Without `NEXT_PUBLIC_API_URL`, a development build expects an API at http://localhost:8100. Production builds default to `api.ceres.northflow.no`.

## Stack

- Next.js 15 (App Router) and Tailwind CSS
- Leaflet and React-Leaflet for maps, Recharts for charts
- Hosted on Vercel

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── regions/              # All regions and region detail
│   ├── map/                  # Global risk map
│   ├── subnational/          # Sub-national breakdown
│   ├── validation/           # Public validation ledger
│   ├── methodology/          # Method documentation
│   ├── data/                 # Data sources
│   └── about/                # System overview
├── lib/
│   └── api.ts                # Client for the CERES public API
└── components/               # Shared UI components
```

## Citation

```bibtex
@article{pedersen2026ceres,
  title={CERES: A Probabilistic Early Warning System for Acute Food Insecurity},
  author={Pedersen, Tom Danny S.},
  journal={arXiv preprint arXiv:2603.09425},
  year={2026}
}
```

Research collaboration: hello@northflow.no

## Licence

The source code in this repository is licensed under the [Apache License 2.0](LICENSE).

Copyright 2026 Northflow Technologies AS
