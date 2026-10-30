// The one definition of the alert tiers. Every page that explains a tier reads
// it from here, so the wording cannot drift between pages.
export const TIER_DEFS = [
  {
    tier: "TIER-1",
    name: "Critical",
    roman: "Tier I",
    thresh: "≥ 70%",
    color: "var(--crisis)",
    bg: "#FEF2F2",
    meaning: "IPC Phase 3+ (Crisis or above) probable within 90 days. Pre-positioning recommended.",
  },
  {
    tier: "TIER-2",
    name: "Warning",
    roman: "Tier II",
    thresh: "45 to 69%",
    color: "var(--warning)",
    bg: "#FFFBEB",
    meaning: "IPC Phase 3+ (Crisis or above) possible within 90 days. Enhanced monitoring and contingency planning.",
  },
  {
    tier: "TIER-3",
    name: "Watch",
    roman: "Tier III",
    thresh: "< 45%",
    color: "var(--watch)",
    bg: "#F0FDF4",
    meaning: "IPC Phase 3+ less likely than not within 90 days. Situational monitoring.",
  },
] as const;
