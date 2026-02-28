export function pct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

export function ciStr(low: number, high: number): string {
  return `[${pct(low)}–${pct(high)}]`;
}

export function tierLabel(tier: string): string {
  if (tier === "TIER-1") return "CRITICAL";
  if (tier === "TIER-2") return "WARNING";
  return "WATCH";
}

export function tierColor(tier: string): string {
  if (tier === "TIER-1") return "#ef4444";
  if (tier === "TIER-2") return "#f97316";
  return "#eab308";
}

export function tierBg(tier: string): string {
  if (tier === "TIER-1") return "bg-red-500/15 border-red-500/30 text-red-400";
  if (tier === "TIER-2") return "bg-orange-500/15 border-orange-500/30 text-orange-400";
  return "bg-yellow-500/15 border-yellow-500/30 text-yellow-400";
}

export function convColor(tier: string): string {
  if (tier === "CRITICAL") return "text-red-400";
  if (tier === "WARNING")  return "text-orange-400";
  if (tier === "WATCH")    return "text-yellow-400";
  return "text-slate-500";
}

export function stressColor(v: number): string {
  if (v >= 0.70) return "#ef4444";
  if (v >= 0.50) return "#f97316";
  if (v >= 0.30) return "#eab308";
  return "#22c55e";
}

export function ipcPhaseLabel(phase: number): string {
  const labels: Record<number, string> = {
    1: "Minimal",
    2: "Stressed",
    3: "Crisis",
    4: "Emergency",
    5: "Famine",
  };
  return labels[Math.round(phase)] ?? `Phase ${phase}`;
}

export function relativeTime(isoStr: string): string {
  if (!isoStr) return "";
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins < 2)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatDate(isoStr: string): string {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function clsx(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
